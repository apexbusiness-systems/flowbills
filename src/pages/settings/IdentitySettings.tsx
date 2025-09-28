import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function IdentitySettings() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Enterprise SSO</h1>
        <p className="text-muted-foreground">Single sign-on configuration and identity management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SAML Configuration</CardTitle>
          <CardDescription>
            SSO is configured in Supabase Auth. Role mapping arrives via IdP claims.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure your enterprise identity provider (IdP) to enable single sign-on for your organization. 
            This includes SAML providers like Okta, Azure AD, or Google Workspace.
          </p>
          
          <Button asChild className="flex items-center gap-2">
            <a 
              href="https://supabase.com/dashboard/project/yvyjzlbosmtesldczhnm/auth/providers" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Open Supabase Auth Providers
            </a>
          </Button>
          
          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-md">
            <strong>Configuration Notes:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use Supabase CLI to add SAML provider and map domains/attributes</li>
              <li>Configure role mapping via JWT claims from your IdP</li>
              <li>Test SSO integration before enabling for all users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}