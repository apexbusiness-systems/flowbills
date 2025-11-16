import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, Zap, FileCheck, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-oilgas.jpg";

const Index = () => {
  useEffect(() => {
    // SEO essentials
    document.title = "AI-Powered Invoice Processing for Canadian Oil & Gas | FLOWBills.ca";
    const desc = "Automate your accounts payable with enterprise-grade security, PIPEDA compliance, and intelligent duplicate detection. Built specifically for Canadian energy sector requirements.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    if (meta) meta.content = desc;

    // Canonical
    const href = window.location.origin + "/";
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }, []);

  return (
    <main className="min-h-screen">
      {/* Compliance Badge */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        <Shield className="inline-block w-4 h-4 mr-2" />
        PIPEDA & CASL Compliant
      </div>

      {/* Hero Section */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        aria-label="Hero section with energy industry background"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AI-Powered Invoice Processing for<br />
            <span className="text-[#F59E0B]">Canadian Oil & Gas</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Automate your accounts payable with enterprise-grade security, PIPEDA compliance, and intelligent duplicate detection. Built specifically for Canadian energy sector requirements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold">
              <Link to="/contact">Book Free Demo →</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
              <Link to="/pricing">Calculate ROI ↓</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-[#F59E0B] mb-2">95%</div>
              <p className="text-muted-foreground">Straight-Through Processing</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-[#F59E0B] mb-2">80%</div>
              <p className="text-muted-foreground">Cost Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-[#F59E0B] mb-2">24/7</div>
              <p className="text-muted-foreground">Processing Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to modernize your accounts payable process
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <CardTitle>AI-Powered Processing</CardTitle>
                <CardDescription>
                  Intelligent document extraction with 99% accuracy for invoices, POs, and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    OCR & Data Extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    Smart Field Mapping
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    Multi-format Support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <CardTitle>Compliance & Security</CardTitle>
                <CardDescription>
                  PIPEDA, CASL, and SOC 2 compliance with enterprise security controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    PIPEDA Compliant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    CASL Email Consent
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    SOC 2 Ready
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <CardTitle>Smart Workflows</CardTitle>
                <CardDescription>
                  Intelligent routing with human-in-the-loop for exception handling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    Duplicate Detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    Auto-Approval Rules
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
                    Exception Management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your AP Process?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join leading Canadian energy companies using FlowBills.ca to reduce costs and improve efficiency.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/contact">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
