import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Shield, AlertTriangle, Eye, UserX, Lock, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  user_id?: string;
  ip_address?: string | null;
  details: any;
  created_at: string;
}

export const SecurityAlerts = () => {
  const { user, hasRole } = useAuth();
  const [alerts, setAlerts] = useState<SecurityEvent[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSecurityAlerts = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('security_events')
          .select('*')
          .in('severity', ['critical', 'high'])
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        // Regular users only see their own security events
        if (!hasRole('admin')) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Type cast to match our interface
        const typedData = (data || []).map(event => ({
          ...event,
          ip_address: event.ip_address as string | null
        }));

        setAlerts(typedData);
      } catch (error) {
        console.error('Failed to fetch security alerts:', error);
      }
    };

    fetchSecurityAlerts();

    // Set up real-time subscription for new security events
    const subscription = supabase
      .channel('security_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events',
          filter: hasRole('admin') ? undefined : `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const newEvent = payload.new as SecurityEvent;
          if (['critical', 'high'].includes(newEvent.severity)) {
            setAlerts(prev => [newEvent, ...prev.slice(0, 4)]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, hasRole]);

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (eventType: string, severity: string) => {
    const iconClass = severity === 'critical' ? 'text-destructive' : 'text-orange-500';
    
    switch (eventType) {
      case 'admin_pii_access':
        return <Eye className={cn('h-4 w-4', iconClass)} />;
      case 'session_anomaly_detected':
        return <UserX className={cn('h-4 w-4', iconClass)} />;
      case 'invalid_session_access':
        return <Lock className={cn('h-4 w-4', iconClass)} />;
      case 'failed_login_attempt':
        return <Shield className={cn('h-4 w-4', iconClass)} />;
      case 'suspicious_activity':
        return <AlertTriangle className={cn('h-4 w-4', iconClass)} />;
      default:
        return <Activity className={cn('h-4 w-4', iconClass)} />;
    }
  };

  const getAlertTitle = (eventType: string) => {
    switch (eventType) {
      case 'admin_pii_access':
        return 'Personal Data Accessed';
      case 'session_anomaly_detected':
        return 'Suspicious Session Activity';
      case 'invalid_session_access':
        return 'Invalid Login Attempt';
      case 'failed_login_attempt':
        return 'Failed Login Detected';
      case 'suspicious_activity':
        return 'Suspicious Activity Detected';
      default:
        return 'Security Event';
    }
  };

  const getAlertDescription = (alert: SecurityEvent) => {
    const { event_type, details } = alert;
    
    switch (event_type) {
      case 'admin_pii_access':
        return `Administrator accessed personal data in ${details?.table || 'unknown table'}`;
      case 'session_anomaly_detected':
        return `Session accessed from different device or location`;
      case 'invalid_session_access':
        return `Attempt to access with invalid or expired session`;
      case 'failed_login_attempt':
        return `Multiple failed login attempts from ${details?.ip_address || 'unknown IP'}`;
      case 'suspicious_activity':
        return `Unusual activity pattern detected on your account`;
      default:
        return `Security event: ${event_type.replace(/_/g, ' ')}`;
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => (
        <Alert 
          key={alert.id}
          variant={alert.severity === 'critical' ? 'destructive' : 'default'}
          className="relative"
        >
          {getAlertIcon(alert.event_type, alert.severity)}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <AlertTitle className="flex items-center gap-2">
                {getAlertTitle(alert.event_type)}
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </AlertTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <AlertDescription className="mt-1">
              {getAlertDescription(alert)}
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(alert.created_at).toLocaleString()}
              </div>
            </AlertDescription>
          </div>
        </Alert>
      ))}
    </div>
  );
};