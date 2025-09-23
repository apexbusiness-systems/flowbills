import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { AnalyticsFilters } from "@/hooks/useAnalytics";

interface ExportControlsProps {
  onExport: (format: 'csv' | 'pdf', filters?: AnalyticsFilters) => Promise<void>;
  loading: boolean;
  currentFilters?: AnalyticsFilters;
}

const ExportControls = ({ onExport, loading, currentFilters }: ExportControlsProps) => {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format);
    try {
      await onExport(format, currentFilters);
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={loading || exporting !== null}
        >
          <Download className="h-4 w-4" />
          {exporting ? `Exporting ${exporting.toUpperCase()}...` : 'Export Data'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          disabled={exporting !== null}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportControls;