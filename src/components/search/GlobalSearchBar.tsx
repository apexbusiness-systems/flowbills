import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Filter, Clock, Trash2 } from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { AdvancedSearchDialog } from './AdvancedSearchDialog';
import { cn } from '@/lib/utils';

interface GlobalSearchBarProps {
  onSearch: (query: string, filters?: Record<string, any>) => void;
  className?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSearch,
  className
}) => {
  const { searchHistory } = useGlobalSearch();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentQueries(searchHistory.slice(0, 5));
  }, [searchHistory]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch(finalQuery);
      setShowSuggestions(false);
      setQuery(finalQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setRecentQueries([]);
  };

  const removeFromHistory = (queryToRemove: string) => {
    const updated = recentQueries.filter(q => q !== queryToRemove);
    setRecentQueries(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const suggestions = [
    'invoice pending',
    'compliance overdue',
    'exceptions high priority',
    'workflow automation',
    'vendor payments',
  ];

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search invoices, compliance, exceptions, workflows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-4"
          />
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50">
              <div className="bg-background border rounded-lg shadow-lg max-h-80 overflow-hidden">
                <Command>
                  <CommandList>
                    {/* Recent Searches */}
                    {recentQueries.length > 0 && (
                      <CommandGroup>
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Recent Searches
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="h-auto p-1 text-xs"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {recentQueries.map((recentQuery, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => handleSearch(recentQuery)}
                            className="cursor-pointer group"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{recentQuery}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromHistory(recentQuery);
                                }}
                                className="opacity-0 group-hover:opacity-100 h-auto p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Search Suggestions */}
                    <CommandGroup>
                      <div className="px-2 py-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Suggestions
                        </span>
                      </div>
                      {suggestions
                        .filter(suggestion => 
                          !query || suggestion.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((suggestion, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => handleSearch(suggestion)}
                            className="cursor-pointer"
                          >
                            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                            {suggestion}
                          </CommandItem>
                        ))
                      }
                    </CommandGroup>

                    {/* Quick Filters */}
                    <CommandGroup>
                      <div className="px-2 py-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Quick Filters
                        </span>
                      </div>
                      <div className="p-2 flex flex-wrap gap-1">
                        {[
                          { label: 'Invoices', filter: 'type:invoice' },
                          { label: 'Pending', filter: 'status:pending' },
                          { label: 'This Month', filter: 'date:month' },
                          { label: 'High Priority', filter: 'priority:high' }
                        ].map((quickFilter) => (
                          <Badge
                            key={quickFilter.filter}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleSearch(quickFilter.filter)}
                          >
                            {quickFilter.label}
                          </Badge>
                        ))}
                      </div>
                    </CommandGroup>

                    {query && !recentQueries.some(q => q.toLowerCase() === query.toLowerCase()) && (
                      <CommandEmpty>
                        <div className="py-2">
                          Press Enter to search for "{query}"
                        </div>
                      </CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </div>
            </div>
          )}
        </div>

        <Button onClick={() => handleSearch()}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>

        <AdvancedSearchDialog
          onSearch={onSearch}
          trigger={
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          }
        />
      </div>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};