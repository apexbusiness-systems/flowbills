import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ValidationRule {
  id: string;
  user_id: string;
  rule_name: string;
  rule_type: string;
  rule_config: any;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  rule_id: string;
  rule_name: string;
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  suggested_action?: string;
}

export interface InvoiceValidationResult {
  invoice_id: string;
  overall_passed: boolean;
  results: ValidationResult[];
  executed_at: string;
}

export const useValidationRules = () => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRules = useCallback(async (filters?: {
    rule_type?: string;
    is_active?: boolean;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('validation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false });

      if (filters?.rule_type) {
        query = query.eq('rule_type', filters.rule_type);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRules((data || []) as ValidationRule[]);
    } catch (error: any) {
      console.error('Error fetching validation rules:', error);
      toast({
        title: "Error",
        description: "Failed to load validation rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createRule = useCallback(async (ruleData: {
    rule_name: string;
    rule_type: string;
    rule_config: any;
    priority?: number;
    is_active?: boolean;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .insert({
          ...ruleData,
          user_id: user.id,
          is_active: ruleData.is_active ?? true,
          priority: ruleData.priority ?? 1
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Rule Created",
        description: `Validation rule "${ruleData.rule_name}" has been created`,
      });

      await fetchRules();
      return data;
    } catch (error: any) {
      console.error('Error creating validation rule:', error);
      toast({
        title: "Error",
        description: "Failed to create validation rule",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast, fetchRules]);

  const updateRule = useCallback(async (
    ruleId: string,
    updates: Partial<Omit<ValidationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('validation_rules')
        .update(updates)
        .eq('id', ruleId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Rule Updated",
        description: "Validation rule has been updated successfully",
      });

      await fetchRules();
      return true;
    } catch (error: any) {
      console.error('Error updating validation rule:', error);
      toast({
        title: "Error",
        description: "Failed to update validation rule",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchRules]);

  const deleteRule = useCallback(async (ruleId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('validation_rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Rule Deleted",
        description: "Validation rule has been deleted successfully",
      });

      await fetchRules();
      return true;
    } catch (error: any) {
      console.error('Error deleting validation rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete validation rule",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchRules]);

  const validateInvoice = useCallback(async (invoice: any): Promise<InvoiceValidationResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get active validation rules
    const { data: activeRules, error } = await supabase
      .from('validation_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;

    const results: ValidationResult[] = [];
    let overallPassed = true;

    // Execute each validation rule
    for (const rule of activeRules || []) {
      const result = await executeValidationRule(rule, invoice);
      results.push(result);
      
      if (!result.passed && (result.severity === 'error' || result.severity === 'critical')) {
        overallPassed = false;
      }
    }

    return {
      invoice_id: invoice.id,
      overall_passed: overallPassed,
      results,
      executed_at: new Date().toISOString()
    };
  }, [user]);

  const executeValidationRule = async (
    rule: ValidationRule, 
    invoice: any
  ): Promise<ValidationResult> => {
    try {
      const { rule_type, rule_config } = rule;

      switch (rule_type) {
        case 'amount_range':
          return validateAmountRange(rule, invoice, rule_config);
        case 'required_fields':
          return validateRequiredFields(rule, invoice, rule_config);
        case 'date_validation':
          return validateDates(rule, invoice, rule_config);
        case 'vendor_validation':
          return validateVendor(rule, invoice, rule_config);
        case 'duplicate_check':
          return await validateDuplicates(rule, invoice, rule_config);
        case 'format_validation':
          return validateFormats(rule, invoice, rule_config);
        default:
          return {
            rule_id: rule.id,
            rule_name: rule.rule_name,
            passed: true,
            message: 'Unknown rule type - skipped',
            severity: 'info'
          };
      }
    } catch (error: any) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: `Rule execution failed: ${error.message}`,
        severity: 'error'
      };
    }
  };

  // Validation rule implementations
  const validateAmountRange = (rule: ValidationRule, invoice: any, config: any): ValidationResult => {
    const amount = parseFloat(invoice.amount) || 0;
    const { min_amount, max_amount } = config;

    if (min_amount && amount < min_amount) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: `Invoice amount $${amount} is below minimum threshold of $${min_amount}`,
        severity: 'error',
        suggested_action: 'Review invoice amount or adjust validation threshold'
      };
    }

    if (max_amount && amount > max_amount) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: `Invoice amount $${amount} exceeds maximum threshold of $${max_amount}`,
        severity: 'warning',
        suggested_action: 'Verify invoice amount and approve if correct'
      };
    }

    return {
      rule_id: rule.id,
      rule_name: rule.rule_name,
      passed: true,
      message: `Amount $${amount} is within acceptable range`,
      severity: 'info'
    };
  };

  const validateRequiredFields = (rule: ValidationRule, invoice: any, config: any): ValidationResult => {
    const { required_fields } = config;
    const missingFields: string[] = [];

    for (const field of required_fields || []) {
      if (!invoice[field] || (typeof invoice[field] === 'string' && !invoice[field].trim())) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        severity: 'error',
        suggested_action: 'Complete all required fields before processing'
      };
    }

    return {
      rule_id: rule.id,
      rule_name: rule.rule_name,
      passed: true,
      message: 'All required fields are present',
      severity: 'info'
    };
  };

  const validateDates = (rule: ValidationRule, invoice: any, config: any): ValidationResult => {
    const { check_future_dates, max_days_old } = config;
    const invoiceDate = new Date(invoice.invoice_date);
    const today = new Date();

    if (check_future_dates && invoiceDate > today) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: 'Invoice date cannot be in the future',
        severity: 'error',
        suggested_action: 'Correct the invoice date'
      };
    }

    if (max_days_old) {
      const daysOld = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOld > max_days_old) {
        return {
          rule_id: rule.id,
          rule_name: rule.rule_name,
          passed: false,
          message: `Invoice is ${daysOld} days old, exceeding limit of ${max_days_old} days`,
          severity: 'warning',
          suggested_action: 'Review if this old invoice should be processed'
        };
      }
    }

    return {
      rule_id: rule.id,
      rule_name: rule.rule_name,
      passed: true,
      message: 'Invoice dates are valid',
      severity: 'info'
    };
  };

  const validateVendor = (rule: ValidationRule, invoice: any, config: any): ValidationResult => {
    const { approved_vendors, blocked_vendors } = config;
    const vendorName = invoice.vendor_name?.toLowerCase().trim();

    if (blocked_vendors && blocked_vendors.some((vendor: string) => 
      vendorName.includes(vendor.toLowerCase()))) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: `Vendor "${invoice.vendor_name}" is on the blocked list`,
        severity: 'critical',
        suggested_action: 'Contact procurement team before processing'
      };
    }

    if (approved_vendors && approved_vendors.length > 0 && 
        !approved_vendors.some((vendor: string) => 
          vendorName.includes(vendor.toLowerCase()))) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: `Vendor "${invoice.vendor_name}" is not in the approved vendors list`,
        severity: 'warning',
        suggested_action: 'Verify vendor approval status'
      };
    }

    return {
      rule_id: rule.id,
      rule_name: rule.rule_name,
      passed: true,
      message: 'Vendor validation passed',
      severity: 'info'
    };
  };

  const validateDuplicates = async (rule: ValidationRule, invoice: any, config: any): Promise<ValidationResult> => {
    const { check_fields } = config;
    
    try {
      let query = supabase
        .from('invoices')
        .select('id, invoice_number, vendor_name, amount');

      // Build duplicate check query
      for (const field of check_fields || ['invoice_number']) {
        if (invoice[field]) {
          query = query.eq(field, invoice[field]);
        }
      }

      // Exclude current invoice if it's an update
      if (invoice.id) {
        query = query.neq('id', invoice.id);
      }

      const { data: duplicates, error } = await query;

      if (error) throw error;

      if (duplicates && duplicates.length > 0) {
        return {
          rule_id: rule.id,
          rule_name: rule.rule_name,
          passed: false,
          message: `Potential duplicate found: ${duplicates.length} similar invoice(s) exist`,
          severity: 'warning',
          suggested_action: 'Review for duplicates before processing'
        };
      }

      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: true,
        message: 'No duplicates detected',
        severity: 'info'
      };
    } catch (error) {
      return {
        rule_id: rule.id,
        rule_name: rule.rule_name,
        passed: false,
        message: 'Duplicate check failed',
        severity: 'error'
      };
    }
  };

  const validateFormats = (rule: ValidationRule, invoice: any, config: any): ValidationResult => {
    const { invoice_number_pattern, vendor_name_pattern } = config;

    if (invoice_number_pattern && invoice.invoice_number) {
      const regex = new RegExp(invoice_number_pattern);
      if (!regex.test(invoice.invoice_number)) {
        return {
          rule_id: rule.id,
          rule_name: rule.rule_name,
          passed: false,
          message: `Invoice number "${invoice.invoice_number}" doesn't match required format`,
          severity: 'error',
          suggested_action: 'Correct invoice number format'
        };
      }
    }

    if (vendor_name_pattern && invoice.vendor_name) {
      const regex = new RegExp(vendor_name_pattern);
      if (!regex.test(invoice.vendor_name)) {
        return {
          rule_id: rule.id,
          rule_name: rule.rule_name,
          passed: false,
          message: `Vendor name "${invoice.vendor_name}" doesn't match required format`,
          severity: 'warning',
          suggested_action: 'Verify vendor name format'
        };
      }
    }

    return {
      rule_id: rule.id,
      rule_name: rule.rule_name,
      passed: true,
      message: 'Format validation passed',
      severity: 'info'
    };
  };

  const getRuleStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('rule_type, is_active')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(rule => rule.is_active).length,
        inactive: data.filter(rule => !rule.is_active).length,
        by_type: data.reduce((acc: Record<string, number>, rule) => {
          acc[rule.rule_type] = (acc[rule.rule_type] || 0) + 1;
          return acc;
        }, {})
      };

      return stats;
    } catch (error: any) {
      console.error('Error fetching rule stats:', error);
      return null;
    }
  }, [user]);

  return {
    rules,
    loading,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    validateInvoice,
    getRuleStats,
  };
};