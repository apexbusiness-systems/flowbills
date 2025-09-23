import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Globe,
  BarChart3,
  Clock,
  DollarSign,
  Award
} from "lucide-react";
import LeadCaptureDialog from "./LeadCaptureDialog";
import { useToast } from "@/hooks/use-toast";

export const ProductSnapshot = () => {
  const [leadCaptureOpen, setLeadCaptureOpen] = useState(false);
  const [interestType, setInterestType] = useState<'demo' | 'roi_calculator' | 'contact'>('demo');
  const { toast } = useToast();

  const handleLeadSuccess = () => {
    // Track conversion and provide next steps
    toast({
      title: "Thank you for your interest!",
      description: "Check your email for next steps and our team will be in touch soon.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
          ENTERPRISE SOLUTION
        </Badge>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          FLOW Billing Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transform your oil & gas billing operations with AI-powered automation, 
          compliance monitoring, and real-time analytics that scale with your business.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">99.7%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">75%</div>
            <div className="text-sm text-muted-foreground">Time Reduction</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">$2.3M</div>
            <div className="text-sm text-muted-foreground">Avg Savings/Year</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </CardContent>
        </Card>
      </div>

      {/* Core Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">AI-Powered Automation</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Intelligent invoice processing & validation</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Automated compliance checking</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Smart exception handling</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Advanced Analytics</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Real-time performance dashboards</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Predictive cost analysis</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Custom reporting & insights</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Compliance & Security</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">SOX, SOC 2, GDPR compliant</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Enterprise-grade encryption</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Audit trail & documentation</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Enterprise Integration</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">SAP, Oracle, NetSuite ready</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">RESTful API & webhooks</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">Scalable cloud infrastructure</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <DollarSign className="h-8 w-8 text-primary mx-auto" />
              <div className="text-2xl font-bold">285% ROI</div>
              <div className="text-sm text-muted-foreground">Average 18-month return</div>
            </div>
            <div className="space-y-2">
              <Clock className="h-8 w-8 text-primary mx-auto" />
              <div className="text-2xl font-bold">90 Days</div>
              <div className="text-sm text-muted-foreground">Implementation timeline</div>
            </div>
            <div className="space-y-2">
              <Award className="h-8 w-8 text-primary mx-auto" />
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime guarantee</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Testimonial */}
      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <blockquote className="text-lg italic text-muted-foreground">
              "FLOW Billing transformed our operations completely. We've reduced processing time by 80% 
              and eliminated manual errors. The compliance monitoring alone saves us hundreds of hours monthly."
            </blockquote>
            <div className="space-y-1">
              <div className="font-semibold">Sarah Mitchell</div>
              <div className="text-sm text-muted-foreground">VP Operations, PetroMax Energy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6 text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to Transform Your Billing Operations?</h3>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto">
            Join 500+ energy companies already using FLOW Billing to streamline operations, 
            ensure compliance, and drive significant cost savings.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-primary bg-primary-foreground hover:bg-primary-foreground/90"
              onClick={() => setLeadCaptureOpen(true)}
              onPointerDown={() => setInterestType('demo')}
            >
              Schedule Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setLeadCaptureOpen(true)}
              onPointerDown={() => setInterestType('roi_calculator')}
            >
              Download ROI Calculator
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Users className="h-4 w-4" />
          <span>Trusted by 500+ energy companies across North America</span>
        </div>
      </div>

      {/* Lead Capture Dialog */}
      <LeadCaptureDialog
        open={leadCaptureOpen}
        onOpenChange={setLeadCaptureOpen}
        interestType={interestType}
        onSuccess={handleLeadSuccess}
      />
    </div>
  );
};