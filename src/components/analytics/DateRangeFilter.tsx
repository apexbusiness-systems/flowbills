import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { AnalyticsFilters } from "@/hooks/useAnalytics";

interface DateRangeFilterProps {
  onFilterChange: (filters: AnalyticsFilters) => void;
  loading: boolean;
}

const DateRangeFilter = ({ onFilterChange, loading }: DateRangeFilterProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quickFilter, setQuickFilter] = useState<string>("");

  const handleQuickFilter = (period: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;

    switch (period) {
      case "7days":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        break;
      default:
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filters: AnalyticsFilters = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };

    setDateRange({ from: startDate, to: endDate });
    setQuickFilter(period);
    onFilterChange(filters);
  };

  const handleCustomDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      const filters: AnalyticsFilters = {
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0]
      };
      onFilterChange(filters);
    }
  };

  const handleReset = () => {
    setDateRange(undefined);
    setQuickFilter("");
    
    // Default to last 30 days
    const today = new Date();
    const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const filters: AnalyticsFilters = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0]
    };
    
    onFilterChange(filters);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter className="h-4 w-4" />
        Filters:
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex gap-2">
        {[
          { value: "7days", label: "Last 7 Days" },
          { value: "30days", label: "Last 30 Days" },
          { value: "90days", label: "Last 90 Days" },
          { value: "1year", label: "Last Year" }
        ].map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={quickFilter === option.value ? "default" : "outline"}
            onClick={() => handleQuickFilter(option.value)}
            disabled={loading}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Range */}
      <div className="flex items-center gap-2">
        <Label htmlFor="custom-date" className="text-sm">
          Custom Range:
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="custom-date"
              variant="outline"
              size="sm"
              className="gap-2 min-w-[200px] justify-start text-left font-normal"
              disabled={loading}
            >
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd, y")} -{" "}
                    {format(dateRange.to, "MMM dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, y")
                )
              ) : (
                "Select date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
            <div className="p-3 border-t border-border">
              <Button
                onClick={handleCustomDateRange}
                disabled={!dateRange?.from || !dateRange?.to || loading}
                className="w-full"
                size="sm"
              >
                Apply Date Range
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Reset Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleReset}
        disabled={loading}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
};

export default DateRangeFilter;