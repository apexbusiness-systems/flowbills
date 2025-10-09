import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';
import { TrackLink } from '@/components/ui/TrackLink';

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Pricing</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl">
          Simple usage-based pricing with free sandbox. Contact us for enterprise oil & gas volume tiers.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Sandbox</CardTitle>
              <CardDescription>Test our platform risk-free</CardDescription>
              <div className="text-3xl font-bold mt-4">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">50 invoices/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">All core features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Email support</span>
                </li>
              </ul>
              <TrackLink to="/auth" source="pricing-sandbox">
                <Button className="w-full">Start Free</Button>
              </TrackLink>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>For growing operations</CardDescription>
              <div className="text-3xl font-bold mt-4">$0.25<span className="text-lg font-normal text-muted-foreground">/invoice</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Custom workflows</span>
                </li>
              </ul>
              <TrackLink to="/contact" source="pricing-professional">
                <Button className="w-full" variant="default">Contact Sales</Button>
              </TrackLink>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>Custom solutions for large operators</CardDescription>
              <div className="text-3xl font-bold mt-4">Custom</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Volume discounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SLA guarantees</span>
                </li>
              </ul>
              <TrackLink to="/contact" source="pricing-enterprise">
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </TrackLink>
            </CardContent>
          </Card>
        </div>

        <section className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions about pricing?</h2>
          <p className="text-muted-foreground mb-4">We offer custom pricing for high-volume energy operators.</p>
          <TrackLink to="/contact" source="pricing-questions">
            <Button>Contact Us</Button>
          </TrackLink>
        </section>
      </main>
      <Footer />
    </div>
  );
}
