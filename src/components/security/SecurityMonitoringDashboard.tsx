import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, Eye, Activity, Lock, UserX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  user_id?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  details: any;
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  piiAccesses: number;
  suspiciousSessions: number;
  recentEvents: SecurityEvent[];
}

export const SecurityMonitoringDashboard = () => {
  const { hasRole } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    highSeverityEvents: 0,
    piiAccesses: 0,
    suspiciousSessions: 0,
    recentEvents: []
  });
  const [loading, setLoading] = useState(true);

  // Only admins can access security monitoring
  if (!hasRole('admin')) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          Security monitoring requires administrator privileges.
        </AlertDescription>
      </Alert>
    );
  }

  useEffect(() => {
    const fetchSecurityMetrics = async () => {
      try {
        setLoading(true);
        
        // Get recent security events (last 24 hours)
        const { data: events, error } = await supabase
          .from('security_events')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Type cast to match our interface
        const typedEvents = (events || []).map(event => ({
          ...event,
          ip_address: event.ip_address as string | null,
          user_agent: event.user_agent as string | null
        }));

        // Calculate metrics
        const criticalEvents = typedEvents.filter(e => e.severity === 'critical').length;
        const highSeverityEvents = typedEvents.filter(e => e.severity === 'high').length;
        const piiAccesses = typedEvents.filter(e => e.event_type === 'admin_pii_access').length;
        const suspiciousSessions = typedEvents.filter(e => e.event_type === 'session_anomaly_detected').length;

        setMetrics({
          totalEvents: typedEvents.length,
          criticalEvents,
          highSeverityEvents,
          piiAccesses,
          suspiciousSessions,
          recentEvents: typedEvents.slice(0, 10)
        });
      } catch (error) {
        console.error('Failed to fetch security metrics:', error);
        toast({
          title: "Security Monitoring Error",
          description: "Failed to load security metrics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSecurityMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'admin_pii_access':
        return <Eye className="h-4 w-4" />;
      case 'session_anomaly_detected':
        return <UserX className="h-4 w-4" />;
      case 'invalid_session_access':
        return <Lock className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Monitoring</h2>
          <p className="text-muted-foreground">Real-time security events and compliance monitoring</p>
        </div>
        <Badge variant={metrics.criticalEvents > 0 ? "destructive" : "secondary"}>
          {metrics.criticalEvents > 0 ? "Critical Issues" : "All Clear"}
        </Badge>
      </div>

      {/* Security Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Security events logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PII Access</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.piiAccesses}</div>
            <p className="text-xs text-muted-foreground">Admin PII data access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Anomalies</CardTitle>
            <UserX className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousSessions}</div>
            <p className="text-xs text-muted-foreground">Suspicious sessions detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {metrics.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Events Detected</AlertTitle>
          <AlertDescription>
            {metrics.criticalEvents} critical security events require immediate investigation.
            Review the recent events below and take appropriate action.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security events from the past 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {metrics.recentEvents.map((event, index) => (
                <div key={event.id}>
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(event.severity)}
                      {getEventTypeIcon(event.event_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {event.event_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                      {event.ip_address && (
                        <p className="text-xs text-muted-foreground">
                          IP: {event.ip_address}
                        </p>
                      )}
                      {event.details && (
                        <div className="text-xs bg-muted p-2 rounded mt-2">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < metrics.recentEvents.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
              {metrics.recentEvents.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No security events in the last 24 hours</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};