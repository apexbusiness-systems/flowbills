import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, Calendar as CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

interface AdvancedSearchDialogProps {
  onSearch: (query: string, filters: Record<string, any>) => void;
  trigger?: React.ReactNode;
}

export const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({
  onSearch,
  trigger
}) => {
  const { saveSearch, savedSearches } = useGlobalSearch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({
    type: 'all',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    amountMin: '',
    amountMax: ''
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSearch = () => {
    onSearch(query, filters);
    setOpen(false);
  };

  const handleSaveSearch = async () => {
    if (searchName.trim()) {
      await saveSearch(searchName, query, filters);
      setSearchName('');
      setSaveDialogOpen(false);
    }
  };

  const loadSavedSearch = (saved: any) => {
    setQuery(saved.query);
    setFilters(saved.filters);
  };

  const clearFilter = (key: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'type' || key === 'status' ? 'all' : key.includes('date') ? null : ''
    }));
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'type' || key === 'status') return value !== 'all';
    if (key.includes('date')) return value !== null;
    return value !== '';
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Search
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Advanced Search & Filters</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-query"
                placeholder="Search across all your data..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="exception">Exceptions</SelectItem>
                  <SelectItem value="workflow">Workflows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Amount Range (for invoices) */}
          <div className="space-y-2">
            <Label>Amount Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min amount"
                type="number"
                value={filters.amountMin}
                onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
              />
              <Input
                placeholder="Max amount"
                type="number"
                value={filters.amountMax}
                onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
              />
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (key === 'type' && value === 'all') return null;
                  if (key === 'status' && value === 'all') return null;
                  if (key.includes('date') && !value) return null;
                  if (typeof value === 'string' && !value) return null;

                  const displayValue = key.includes('date') && value 
                    ? format(new Date(value), "MMM dd") 
                    : value;

                  return (
                    <Badge key={key} variant="secondary" className="gap-1">
                      {key}: {displayValue}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => clearFilter(key)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Searches</Label>
              <div className="flex flex-wrap gap-2">
                {savedSearches.slice(0, 5).map((saved) => (
                  <Button
                    key={saved.id}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedSearch(saved)}
                  >
                    {saved.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(true)}
              disabled={!query}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Save Search Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-name">Search Name</Label>
                <Input
                  id="search-name"
                  placeholder="Enter a name for this search..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSearch}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};