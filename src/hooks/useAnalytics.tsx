import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface AnalyticsData {
  totalInvoices: number;
  approvedInvoices: number;
  pendingInvoices: number;
  totalExceptions: number;
  criticalExceptions: number;
  resolvedExceptions: number;
  totalCompliance: number;
  dueSoonCompliance: number;
  avgResolutionTimeHours: number;
  processingEfficiency: number;
  exceptionRate: number;
  complianceScore: number;
}

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async (dateRange: { start: Date; end: Date }) => {
    if (!user) return null;

    setLoading(true);
    try {
      // Fetch basic invoice count
      const { data: invoices } = await supabase
        .from('invoices')
        .select('status, created_at, amount')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Fetch exceptions count
      const { data: exceptions } = await supabase
        .from('exceptions')
        .select('severity, resolved_at, created_at')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Fetch compliance records count
      const { data: compliance } = await supabase
        .from('compliance_records')
        .select('status, risk_level, next_audit_date')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Calculate basic metrics
      const totalInvoices = invoices?.length || 0;
      const approvedInvoices = invoices?.filter(inv => inv.status === 'approved').length || 0;
      const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;
      
      const totalExceptions = exceptions?.length || 0;
      const criticalExceptions = exceptions?.filter(exc => exc.severity === 'critical').length || 0;
      const resolvedExceptions = exceptions?.filter(exc => exc.resolved_at).length || 0;
      
      const totalCompliance = compliance?.length || 0;
      const dueSoonCompliance = compliance?.filter(comp => {
        if (!comp.next_audit_date) return false;
        const dueDate = new Date(comp.next_audit_date);
        const now = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && comp.status !== 'compliant';
      }).length || 0;

      const result = {
        totalInvoices,
        approvedInvoices,
        pendingInvoices,
        totalExceptions,
        criticalExceptions,
        resolvedExceptions,
        totalCompliance,
        dueSoonCompliance,
        avgResolutionTimeHours: 0, // Simplified for now
        processingEfficiency: totalInvoices > 0 ? Math.round((approvedInvoices / totalInvoices) * 100) : 0,
        exceptionRate: totalInvoices > 0 ? Math.round((totalExceptions / totalInvoices) * 100) : 0,
        complianceScore: totalCompliance > 0 ? Math.round(((totalCompliance - dueSoonCompliance) / totalCompliance) * 100) : 100
      };

      setAnalyticsData(result);
      return result;
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Simplified stub functions for now
  const getInvoiceMetrics = useCallback(async () => null, []);
  const getExceptionMetrics = useCallback(async () => null, []);  
  const getTrendData = useCallback(async () => null, []);

  return {
    loading,
    analyticsData,
    fetchAnalytics,
    getInvoiceMetrics,
    getExceptionMetrics,
    getTrendData,
  };
};