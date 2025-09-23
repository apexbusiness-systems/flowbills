import { Building2, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DashboardHeader = () => {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">OilField Billing</h1>
            <p className="text-xs text-muted-foreground">Enterprise Payment Platform</p>
          </div>
        </div>

        {/* Search */}
        <div className="mx-4 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices, vendors, POs..."
              className="pl-10"
              aria-label="Search invoices, vendors, and purchase orders"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            aria-label="User menu"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;