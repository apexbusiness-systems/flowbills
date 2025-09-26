import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCompliance } from '@/hooks/useCompliance';
import { Plus, FileText, CalendarIcon, Flag } from 'lucide-react';

interface CreateComplianceDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRecordCreated?: () => Promise<void>;
}

const CreateComplianceDialog = ({ trigger, open: controlledOpen, onOpenChange, onRecordCreated }: CreateComplianceDialogProps) => {
  const { createRecord } = useCompliance();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [complianceDateOpen, setComplianceDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [formData, setFormData] = useState({
    entity_id: '',
    entity_type: '',
    regulation: '',
    status: 'pending',
    risk_level: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    last_audit_date: '',
    next_audit_date: '',
    audit_notes: ''
  });

  const complianceTypes = [
    { value: 'environmental', label: 'Environmental Compliance' },
    { value: 'safety', label: 'Safety & Health' },
    { value: 'financial', label: 'Financial Reporting' },
    { value: 'regulatory', label: 'Regulatory Filing' },
    { value: 'audit', label: 'Internal Audit' },
    { value: 'certification', label: 'Certification Renewal' },
    { value: 'training', label: 'Training & Certification' },
    { value: 'permit', label: 'Permit & Licensing' },
    { value: 'tax', label: 'Tax Compliance' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entity_id || !formData.regulation) {
      return;
    }

    const success = await createRecord({
      entity_id: formData.entity_id,
      entity_type: formData.entity_type,
      regulation: formData.regulation,
      status: formData.status,
      risk_level: formData.risk_level,
      last_audit_date: formData.last_audit_date || undefined,
      next_audit_date: formData.next_audit_date || undefined,
      audit_notes: formData.audit_notes || undefined
    });

    if (success) {
      setOpen(false);
      if (onRecordCreated) {
        await onRecordCreated();
      }
      setFormData({
        entity_id: '',
        entity_type: '',
        regulation: '',
        status: 'pending',  
        risk_level: 'medium',
        last_audit_date: '',
        next_audit_date: '',
        audit_notes: ''
      });
    }
  };

  const handleDateChange = (date: Date | undefined, field: 'last_audit_date' | 'next_audit_date') => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date.toISOString().split('T')[0] }));
    }
    if (field === 'last_audit_date') {
      setComplianceDateOpen(false);
    } else {
      setDueDateOpen(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Pick a date';
    return format(new Date(dateString), 'PPP');
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Create Record
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
            <FileText className="h-5 w-5 text-primary" />
            Create Compliance Record
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entity_id">Entity ID *</Label>
            <Input
              id="entity_id"
              placeholder="Entity identifier"
              value={formData.entity_id}
              onChange={(e) => setFormData(prev => ({ ...prev, entity_id: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity_type">Entity Type</Label>
            <Input
              id="entity_type"
              placeholder="e.g., contract, vendor, project"
              value={formData.entity_type}
              onChange={(e) => setFormData(prev => ({ ...prev, entity_type: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regulation">Regulation *</Label>
            <Input
              id="regulation"
              placeholder="Regulatory requirement"
              value={formData.regulation}
              onChange={(e) => setFormData(prev => ({ ...prev, regulation: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit_notes">Audit Notes</Label>
            <Textarea
              id="audit_notes"
              placeholder="Additional notes..."
              value={formData.audit_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, audit_notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last Audit Date</Label>
              <Popover open={complianceDateOpen} onOpenChange={setComplianceDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.last_audit_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.last_audit_date ? formatDateForDisplay(formData.last_audit_date) : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.last_audit_date ? new Date(formData.last_audit_date) : undefined}
                    onSelect={(date) => handleDateChange(date, 'last_audit_date')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Next Audit Date</Label>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.next_audit_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.next_audit_date ? formatDateForDisplay(formData.next_audit_date) : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.next_audit_date ? new Date(formData.next_audit_date) : undefined}
                    onSelect={(date) => handleDateChange(date, 'next_audit_date')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_level">Risk Level</Label>
            <Select
              value={formData.risk_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, risk_level: value as any }))}
            >
              <SelectTrigger>
                <Flag className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor impact if not completed</SelectItem>
                <SelectItem value="medium">Medium - Moderate business impact</SelectItem>
                <SelectItem value="high">High - Significant consequences</SelectItem>
                <SelectItem value="critical">Critical - Severe penalties or shutdown risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.entity_id || !formData.regulation}
            >
              Create Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateComplianceDialog;