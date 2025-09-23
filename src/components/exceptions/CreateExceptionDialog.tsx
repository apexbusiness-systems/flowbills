import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useExceptions } from '@/hooks/useExceptions';
import { AlertTriangle, Plus } from 'lucide-react';

interface CreateExceptionDialogProps {
  invoiceId?: string;
  trigger?: React.ReactNode;
}

const CreateExceptionDialog = ({ invoiceId, trigger }: CreateExceptionDialogProps) => {
  const { createException } = useExceptions();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    exception_type: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exception_type || !formData.description) {
      return;
    }

    const success = await createException({
      ...formData,
      invoice_id: invoiceId,
    });

    if (success) {
      setOpen(false);
      setFormData({
        exception_type: '',
        description: '',
        severity: 'medium',
      });
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Report Exception
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report New Exception
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exception-type">Exception Type</Label>
            <Select
              value={formData.exception_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, exception_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exception type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_validation">Data Validation Error</SelectItem>
                <SelectItem value="format_error">Format Error</SelectItem>
                <SelectItem value="missing_information">Missing Information</SelectItem>
                <SelectItem value="calculation_error">Calculation Error</SelectItem>
                <SelectItem value="compliance_issue">Compliance Issue</SelectItem>
                <SelectItem value="system_error">System Error</SelectItem>
                <SelectItem value="integration_failure">Integration Failure</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor issue, doesn't block processing</SelectItem>
                <SelectItem value="medium">Medium - Moderate impact on processing</SelectItem>
                <SelectItem value="high">High - Significant impact, requires attention</SelectItem>
                <SelectItem value="critical">Critical - Blocks processing completely</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the exception in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.exception_type || !formData.description}
            >
              Create Exception
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExceptionDialog;