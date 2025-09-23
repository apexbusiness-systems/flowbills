import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Mail, User, Building2, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interestType: 'demo' | 'roi_calculator' | 'contact';
  onSuccess?: () => void;
}

interface LeadFormData {
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
  message: string;
}

const LeadCaptureDialog: React.FC<LeadCaptureDialogProps> = ({
  open,
  onOpenChange,
  interestType,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    message: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          company_name: formData.companyName,
          phone: formData.phone,
          message: formData.message,
          interest_type: interestType,
          lead_source: 'website',
          lead_status: 'new'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you for your interest!",
        description: getSuccessMessage(interestType),
        variant: "default",
      });

      // Reset form and close dialog
      setFormData({
        fullName: "",
        email: "",
        companyName: "",
        phone: "",
        message: ""
      });
      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('Lead capture error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSuccessMessage = (type: string) => {
    switch (type) {
      case 'demo':
        return "Our team will contact you within 24 hours to schedule your personalized demo.";
      case 'roi_calculator':
        return "Check your email for the ROI calculator and pricing information.";
      default:
        return "We'll get back to you shortly with more information.";
    }
  };

  const getDialogTitle = () => {
    switch (interestType) {
      case 'demo':
        return "Schedule Your Demo";
      case 'roi_calculator':
        return "Get Your ROI Calculator";
      default:
        return "Get In Touch";
    }
  };

  const getDialogDescription = () => {
    switch (interestType) {
      case 'demo':
        return "See FLOW Billing in action with a personalized demo tailored to your organization's needs.";
      case 'roi_calculator':
        return "Discover your potential savings with our ROI calculator and pricing information.";
      default:
        return "Learn more about how FLOW Billing can transform your operations.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Business Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                type="text"
                placeholder="Oil & Gas Company Inc."
                className="pl-10"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="pl-10"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          {interestType === 'demo' && (
            <div className="space-y-2">
              <Label htmlFor="message">Tell us about your needs (optional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="message"
                  placeholder="Current invoice volume, key challenges, integration requirements..."
                  className="pl-10 min-h-[80px]"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {interestType === 'demo' ? 'Schedule Demo' : 
               interestType === 'roi_calculator' ? 'Get Calculator' : 'Submit'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          <p>By submitting this form, you agree to our privacy policy and to receive communications about FLOW Billing.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;