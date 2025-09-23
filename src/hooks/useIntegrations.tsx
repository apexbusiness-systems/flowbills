import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Integration {
  id: string;
  user_id: string;
  integration_name: string;
  integration_type: string;
  status: 'connected' | 'disconnected' | 'error' | 'processing';
  last_sync_at?: string;
  next_sync_at?: string;
  sync_count: number;
  error_message?: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationStats {
  total: number;
  connected: number;
  disconnected: number;
  error: number;
  processing: number;
  by_type: Record<string, number>;
  recent_syncs: number;
}

export const useIntegrations = () => {
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchIntegrations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('integration_status')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations((data || []) as Integration[]);
    } catch (error: any) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createIntegration = useCallback(async (integrationData: {
    integration_name: string;
    integration_type: string;
    config: Record<string, any>;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('integration_status')
        .insert({
          ...integrationData,
          user_id: user.id,
          status: 'disconnected',
          sync_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Integration Created",
        description: `${integrationData.integration_name} integration has been created`,
      });

      await fetchIntegrations();
      return data;
    } catch (error: any) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast, fetchIntegrations]);

  const updateIntegration = useCallback(async (
    integrationId: string,
    updates: Partial<Omit<Integration, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('integration_status')
        .update(updates)
        .eq('id', integrationId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Integration Updated",
        description: "Integration has been updated successfully",
      });

      await fetchIntegrations();
      return true;
    } catch (error: any) {
      console.error('Error updating integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchIntegrations]);

  const deleteIntegration = useCallback(async (integrationId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('integration_status')
        .delete()
        .eq('id', integrationId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Integration Deleted",
        description: "Integration has been removed successfully",
      });

      await fetchIntegrations();
      return true;
    } catch (error: any) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchIntegrations]);

  const testConnection = useCallback(async (integrationId: string) => {
    if (!user) return false;

    try {
      // Update status to processing
      await updateIntegration(integrationId, { 
        status: 'processing',
        error_message: undefined 
      });

      // Simulate connection test (in real app, this would call actual integration)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update to connected status
      await updateIntegration(integrationId, { 
        status: 'connected',
        last_sync_at: new Date().toISOString(),
        sync_count: integrations.find(i => i.id === integrationId)?.sync_count || 0 + 1
      });

      toast({
        title: "Connection Successful",
        description: "Integration connection test passed",
      });

      return true;
    } catch (error: any) {
      console.error('Error testing connection:', error);
      await updateIntegration(integrationId, { 
        status: 'error',
        error_message: 'Connection test failed' 
      });

      toast({
        title: "Connection Failed",
        description: "Integration connection test failed",
        variant: "destructive",
      });
      return false;
    }
  }, [user, updateIntegration, integrations]);

  const syncIntegration = useCallback(async (integrationId: string) => {
    if (!user) return false;

    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return false;

      await updateIntegration(integrationId, { 
        status: 'processing' 
      });

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));

      await updateIntegration(integrationId, { 
        status: 'connected',
        last_sync_at: new Date().toISOString(),
        sync_count: integration.sync_count + 1,
        next_sync_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // Next hour
      });

      toast({
        title: "Sync Complete",
        description: `${integration.integration_name} synchronized successfully`,
      });

      return true;
    } catch (error: any) {
      console.error('Error syncing integration:', error);
      await updateIntegration(integrationId, { 
        status: 'error',
        error_message: 'Sync failed' 
      });

      toast({
        title: "Sync Failed",
        description: "Integration synchronization failed",
        variant: "destructive",
      });
      return false;
    }
  }, [user, updateIntegration, integrations]);

  const getIntegrationStats = useCallback((): IntegrationStats => {
    const stats: IntegrationStats = {
      total: integrations.length,
      connected: integrations.filter(i => i.status === 'connected').length,
      disconnected: integrations.filter(i => i.status === 'disconnected').length,
      error: integrations.filter(i => i.status === 'error').length,
      processing: integrations.filter(i => i.status === 'processing').length,
      by_type: integrations.reduce((acc: Record<string, number>, integration) => {
        acc[integration.integration_type] = (acc[integration.integration_type] || 0) + 1;
        return acc;
      }, {}),
      recent_syncs: integrations.filter(i => {
        if (!i.last_sync_at) return false;
        const lastSync = new Date(i.last_sync_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return lastSync > oneHourAgo;
      }).length
    };

    return stats;
  }, [integrations]);

  // Auto-fetch integrations on mount
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    integrations,
    loading,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    syncIntegration,
    getIntegrationStats,
  };
};