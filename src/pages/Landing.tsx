import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-oilgas.jpg";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AI-Powered Invoice Processing | FLOWBills.ca";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Background */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            AI-Powered Invoice Processing for{" "}
            <span className="text-[#f59e0b] block mt-2">Canadian Oil & Gas</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed">
            Automate your accounts payable with enterprise-grade security, PIPEDA compliance,
            and intelligent duplicate detection. Built specifically for Canadian energy sector
            requirements.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold px-8 py-6 text-lg"
              onClick={() => navigate("/contact")}
            >
              Book Free Demo <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg"
              onClick={() => navigate("/pricing")}
            >
              Calculate ROI <BarChart3 className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-black/40 backdrop-blur-md border-white/20">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#f59e0b] mb-3">95%</div>
                <div className="text-white text-lg font-medium">Straight-Through Processing</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border-white/20">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#f59e0b] mb-3">80%</div>
                <div className="text-white text-lg font-medium">Cost Reduction</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border-white/20">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#f59e0b] mb-3">24/7</div>
                <div className="text-white text-lg font-medium">Processing Uptime</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to modernize your accounts payable process
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
