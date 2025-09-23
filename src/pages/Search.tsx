import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { AdvancedSearchDialog } from '@/components/search/AdvancedSearchDialog';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Search, TrendingUp, Clock, Star, Trash2 } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { 
    search, 
    results,
    isSearching, 
    searchHistory, 
    savedSearches,
    deleteSavedSearch 
  } = useGlobalSearch();
  
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});

  const handleSearch = (query: string, filters: Record<string, any> = {}) => {
    setCurrentQuery(query);
    setCurrentFilters(filters);
    search(query, filters);
  };

  const handleSavedSearch = (savedSearch: any) => {
    handleSearch(savedSearch.query, savedSearch.filters);
  };

  const getResultTypeStats = () => {
    const stats = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).map(([type, count]) => ({ type, count }));
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Global Search</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search across all your invoices, compliance records, exceptions, and workflows in one place.
          Use advanced filters to find exactly what you need.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center">
        <GlobalSearchBar onSearch={handleSearch} />
      </div>

      {/* Search Analytics */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{results.length}</p>
                  <p className="text-xs text-muted-foreground">Total Results</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {getResultTypeStats().slice(0, 3).map(({ type, count }) => (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">{type}s</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Results {results.length > 0 && `(${results.length})`}
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Saved Searches {savedSearches.length > 0 && `(${savedSearches.length})`}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Searches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-6">
          {currentQuery ? (
            <SearchResults
              results={results}
              isLoading={isSearching}
              query={currentQuery}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start Your Search</h3>
                <p className="text-muted-foreground mb-6">
                  Enter a search term above to find invoices, compliance records, exceptions, and workflows.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Try: "pending invoices"</Badge>
                  <Badge variant="outline">Try: "compliance overdue"</Badge>
                  <Badge variant="outline">Try: "high priority"</Badge>
                  <Badge variant="outline">Try: "workflow automation"</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Saved Searches</span>
                <AdvancedSearchDialog onSearch={handleSearch} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedSearches.length > 0 ? (
                <div className="space-y-4">
                  {savedSearches.map((savedSearch) => (
                    <div
                      key={savedSearch.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{savedSearch.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Query: "{savedSearch.query}"
                        </p>
                        <div className="flex gap-2 mt-2">
                          {Object.entries(savedSearch.filters).map(([key, value]) => {
                            if (!value || value === 'all' || value === '') return null;
                            return (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSavedSearch(savedSearch)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSavedSearch(savedSearch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Searches</h3>
                  <p className="text-muted-foreground mb-4">
                    Save your frequently used searches for quick access.
                  </p>
                  <AdvancedSearchDialog
                    onSearch={handleSearch}
                    trigger={
                      <Button>
                        <Search className="h-4 w-4 mr-2" />
                        Create Advanced Search
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
            </CardHeader>
            <CardContent>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{query}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(query)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search Again
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Search History</h3>
                  <p className="text-muted-foreground">
                    Your recent searches will appear here for quick access.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage;