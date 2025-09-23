import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KPIMetrics {
  total_invoices: number;
  pending_invoices: number;
  processed_invoices: number;
  total_exceptions: number;
  open_exceptions: number;
  resolved_exceptions: number;
  compliance_records: number;
  overdue_compliance: number;
  avg_processing_time: number;
  exception_rate: number;
  compliance_score: number;
}

export interface ChartData {
  invoices_by_month: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
  exceptions_by_type: Array<{
    type: string;
    count: number;
  }>;
  compliance_by_risk: Array<{
    risk_level: string;
    count: number;
  }>;
  processing_trend: Array<{
    date: string;
    processed: number;
    exceptions: number;
  }>;
}

export interface AnalyticsFilters {
  start_date: string;
  end_date: string;
  status?: string;
  type?: string;
}

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<KPIMetrics>({
    total_invoices: 0,
    pending_invoices: 0,
    processed_invoices: 0,
    total_exceptions: 0,
    open_exceptions: 0,
    resolved_exceptions: 0,
    compliance_records: 0,
    overdue_compliance: 0,
    avg_processing_time: 0,
    exception_rate: 0,
    compliance_score: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    invoices_by_month: [],
    exceptions_by_type: [],
    compliance_by_risk: [],
    processing_trend: [],
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchKPIMetrics = useCallback(async (filters?: AnalyticsFilters) => {
    if (!user) return;

    try {
      const startDate = filters?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = filters?.end_date || new Date().toISOString().split('T')[0];

      // Fetch invoice metrics
      let invoiceQuery = supabase
        .from('invoices')
        .select('status, created_at, amount')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: invoices } = await invoiceQuery;

      // Fetch exception metrics
      let exceptionQuery = supabase
        .from('exceptions')
        .select('status, exception_type, created_at, resolved_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: exceptions } = await exceptionQuery;

      // Fetch compliance metrics
      let complianceQuery = supabase
        .from('compliance_records')
        .select('status, risk_level, due_date, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: compliance } = await complianceQuery;

      // Calculate KPI metrics
      const totalInvoices = invoices?.length || 0;
      const pendingInvoices = invoices?.filter(i => i.status === 'pending').length || 0;
      const processedInvoices = invoices?.filter(i => i.status === 'processed').length || 0;
      
      const totalExceptions = exceptions?.length || 0;
      const openExceptions = exceptions?.filter(e => e.status === 'open').length || 0;
      const resolvedExceptions = exceptions?.filter(e => e.status === 'resolved').length || 0;

      const complianceRecords = compliance?.length || 0;
      const today = new Date().toISOString().split('T')[0];
      const overdueCompliance = compliance?.filter(c => 
        c.due_date && c.due_date < today && c.status !== 'completed'
      ).length || 0;

      // Calculate processing time (simplified)
      const avgProcessingTime = resolvedExceptions > 0 ? 
        exceptions?.filter(e => e.resolved_at).reduce((acc, e) => {
          const created = new Date(e.created_at);
          const resolved = new Date(e.resolved_at!);
          return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0)! / resolvedExceptions : 0;

      const exceptionRate = totalInvoices > 0 ? (totalExceptions / totalInvoices) * 100 : 0;
      const complianceScore = complianceRecords > 0 ? 
        ((complianceRecords - overdueCompliance) / complianceRecords) * 100 : 100;

      setMetrics({
        total_invoices: totalInvoices,
        pending_invoices: pendingInvoices,
        processed_invoices: processedInvoices,
        total_exceptions: totalExceptions,
        open_exceptions: openExceptions,
        resolved_exceptions: resolvedExceptions,
        compliance_records: complianceRecords,
        overdue_compliance: overdueCompliance,
        avg_processing_time: Math.round(avgProcessingTime * 10) / 10,
        exception_rate: Math.round(exceptionRate * 10) / 10,
        compliance_score: Math.round(complianceScore * 10) / 10,
      });

    } catch (error: any) {
      console.error('Error fetching KPI metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics metrics",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const fetchChartData = useCallback(async (filters?: AnalyticsFilters) => {
    if (!user) return;

    try {
      const startDate = filters?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = filters?.end_date || new Date().toISOString().split('T')[0];

      // Fetch data for charts
      const { data: invoices } = await supabase
        .from('invoices')
        .select('created_at, amount, status')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: exceptions } = await supabase
        .from('exceptions')
        .select('created_at, exception_type, status')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: compliance } = await supabase
        .from('compliance_records')
        .select('created_at, risk_level')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Process invoices by month
      const invoicesByMonth = invoices?.reduce((acc: any[], invoice) => {
        const month = new Date(invoice.created_at).toLocaleString('default', { 
          month: 'short', 
          year: 'numeric' 
        });
        const existing = acc.find(item => item.month === month);
        
        if (existing) {
          existing.count += 1;
          existing.amount += parseFloat(String(invoice.amount)) || 0;
        } else {
          acc.push({
            month,
            count: 1,
            amount: parseFloat(String(invoice.amount)) || 0
          });
        }
        return acc;
      }, []) || [];

      // Process exceptions by type
      const exceptionsByType = exceptions?.reduce((acc: any[], exception) => {
        const existing = acc.find(item => item.type === exception.exception_type);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({
            type: exception.exception_type,
            count: 1
          });
        }
        return acc;
      }, []) || [];

      // Process compliance by risk level
      const complianceByRisk = compliance?.reduce((acc: any[], record) => {
        const existing = acc.find(item => item.risk_level === record.risk_level);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({
            risk_level: record.risk_level,
            count: 1
          });
        }
        return acc;
      }, []) || [];

      // Process daily processing trend (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const processingTrend = last30Days.map(date => {
        const processedCount = invoices?.filter(i => 
          i.created_at.startsWith(date) && i.status === 'processed'
        ).length || 0;
        
        const exceptionCount = exceptions?.filter(e => 
          e.created_at.startsWith(date)
        ).length || 0;

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          processed: processedCount,
          exceptions: exceptionCount
        };
      });

      setChartData({
        invoices_by_month: invoicesByMonth,
        exceptions_by_type: exceptionsByType,
        compliance_by_risk: complianceByRisk,
        processing_trend: processingTrend,
      });

    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics charts",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const fetchAnalytics = useCallback(async (filters?: AnalyticsFilters) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchKPIMetrics(filters),
        fetchChartData(filters)
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchKPIMetrics, fetchChartData]);

  const exportData = useCallback(async (format: 'csv' | 'pdf', filters?: AnalyticsFilters) => {
    if (!user) return;

    try {
      const startDate = filters?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = filters?.end_date || new Date().toISOString().split('T')[0];

      // Fetch all data for export
      const [invoicesRes, exceptionsRes, complianceRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('exceptions')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('compliance_records')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      ]);

      if (format === 'csv') {
        // Generate CSV export
        const csvData = [
          ['Report Type', 'Analytics Summary'],
          ['Date Range', `${startDate} to ${endDate}`],
          [''],
          ['KPI Metrics'],
          ['Total Invoices', String(metrics.total_invoices)],
          ['Pending Invoices', String(metrics.pending_invoices)],
          ['Total Exceptions', String(metrics.total_exceptions)],
          ['Exception Rate', `${metrics.exception_rate}%`],
          ['Compliance Score', `${metrics.compliance_score}%`],
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${startDate}-to-${endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: `Analytics data exported as ${format.toUpperCase()}`,
      });

    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data",
        variant: "destructive",
      });
    }
  }, [user, metrics, toast]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Set up real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoices',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchAnalytics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'exceptions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchAnalytics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'compliance_records', 
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAnalytics]);

  return {
    metrics,
    chartData,
    loading,
    fetchAnalytics,
    exportData,
  };
};