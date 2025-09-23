import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import { useExceptions, Exception } from '@/hooks/useExceptions';
import { AlertTriangle, CheckCircle, Clock, Search, Filter, Eye } from 'lucide-react';
import { format } from 'date-fns';

const ExceptionList = () => {
  const { exceptions, loading, fetchExceptions, updateExceptionStatus } = useExceptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedException, setSelectedException] = useState<Exception | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  useEffect(() => {
    const filters: any = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (severityFilter !== 'all') filters.severity = severityFilter;
    
    fetchExceptions(filters);
  }, [fetchExceptions, statusFilter, severityFilter]);

  const filteredExceptions = exceptions.filter(exception =>
    exception.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exception.exception_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'secondary';
      case 'resolved': return 'default';
      case 'dismissed': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'investigating': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'dismissed': return <Eye className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleResolve = async () => {
    if (!selectedException) return;

    const success = await updateExceptionStatus(
      selectedException.id,
      'resolved',
      resolutionNotes
    );

    if (success) {
      setResolveDialogOpen(false);
      setSelectedException(null);
      setResolutionNotes('');
    }
  };

  const handleStatusChange = async (exceptionId: string, newStatus: string) => {
    await updateExceptionStatus(exceptionId, newStatus as any);
  };

  if (loading) {
    return <LoadingSkeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Exception Management</h2>
          <p className="text-muted-foreground">Track and resolve processing exceptions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exceptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exception Cards */}
      <div className="grid gap-4">
        {filteredExceptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Exceptions Found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'No exceptions match your current filters.'
                  : 'Great! No exceptions to resolve at the moment.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredExceptions.map((exception) => (
            <Card key={exception.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(exception.status)}
                      <CardTitle className="text-lg">{exception.exception_type}</CardTitle>
                      <Badge variant={getSeverityColor(exception.severity)}>
                        {exception.severity}
                      </Badge>
                      <Badge variant={getStatusColor(exception.status)}>
                        {exception.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created {format(new Date(exception.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-foreground">{exception.description}</p>
                
                {exception.resolution_notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Resolution Notes:</p>
                    <p className="text-sm text-muted-foreground">{exception.resolution_notes}</p>
                    {exception.resolved_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Resolved {format(new Date(exception.resolved_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {exception.status === 'open' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(exception.id, 'investigating')}
                      >
                        Start Investigation
                      </Button>
                      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedException(exception)}
                          >
                            Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Exception</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="resolution-notes">Resolution Notes</Label>
                              <Textarea
                                id="resolution-notes"
                                placeholder="Describe how this exception was resolved..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setResolveDialogOpen(false);
                                  setSelectedException(null);
                                  setResolutionNotes('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleResolve}>
                                Mark as Resolved
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  
                  {exception.status === 'investigating' && (
                    <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedException(exception)}
                        >
                          Resolve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolve Exception</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="resolution-notes">Resolution Notes</Label>
                            <Textarea
                              id="resolution-notes"
                              placeholder="Describe how this exception was resolved..."
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setResolveDialogOpen(false);
                                setSelectedException(null);
                                setResolutionNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleResolve}>
                              Mark as Resolved
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {exception.status !== 'dismissed' && exception.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusChange(exception.id, 'dismissed')}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExceptionList;