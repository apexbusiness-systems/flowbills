import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Exception {
  id: string;
  user_id: string;
  invoice_id?: string;
  validation_rule_id?: string;
  exception_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export const useExceptions = () => {
  const [loading, setLoading] = useState(false);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExceptions = useCallback(async (filters?: {
    status?: string;
    severity?: string;
    invoice_id?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('exceptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.invoice_id) {
        query = query.eq('invoice_id', filters.invoice_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExceptions((data || []) as Exception[]);
    } catch (error: any) {
      console.error('Error fetching exceptions:', error);
      toast({
        title: "Error",
        description: "Failed to load exceptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createException = useCallback(async (exceptionData: {
    invoice_id?: string;
    validation_rule_id?: string;
    exception_type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('exceptions')
        .insert({
          ...exceptionData,
          user_id: user.id,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Exception Created",
        description: "New exception has been logged",
      });

      await fetchExceptions();
      return data;
    } catch (error: any) {
      console.error('Error creating exception:', error);
      toast({
        title: "Error",
        description: "Failed to create exception",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast, fetchExceptions]);

  const updateExceptionStatus = useCallback(async (
    exceptionId: string,
    status: 'open' | 'investigating' | 'resolved' | 'dismissed',
    resolutionNotes?: string
  ) => {
    if (!user) return false;

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' && resolutionNotes) {
        updateData.resolution_notes = resolutionNotes;
        updateData.resolved_by = user.id;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('exceptions')
        .update(updateData)
        .eq('id', exceptionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Exception marked as ${status}`,
      });

      await fetchExceptions();
      return true;
    } catch (error: any) {
      console.error('Error updating exception:', error);
      toast({
        title: "Error",
        description: "Failed to update exception",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchExceptions]);

  const getExceptionStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('exceptions')
        .select('status, severity')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        open: data.filter(e => e.status === 'open').length,
        investigating: data.filter(e => e.status === 'investigating').length,
        resolved: data.filter(e => e.status === 'resolved').length,
        critical: data.filter(e => e.severity === 'critical').length,
        high: data.filter(e => e.severity === 'high').length,
      };

      return stats;
    } catch (error: any) {
      console.error('Error fetching exception stats:', error);
      return null;
    }
  }, [user]);

  return {
    exceptions,
    loading,
    fetchExceptions,
    createException,
    updateExceptionStatus,
    getExceptionStats,
  };
};