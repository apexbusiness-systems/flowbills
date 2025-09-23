import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { FileText, AlertTriangle, CheckCircle, Workflow, ExternalLink, Clock } from 'lucide-react';
import { SearchResult } from '@/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  query
}) => {
  const navigate = useNavigate();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'compliance':
        return <CheckCircle className="h-4 w-4" />;
      case 'exception':
        return <AlertTriangle className="h-4 w-4" />;
      case 'workflow':
        return <Workflow className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-100 text-blue-800';
      case 'compliance':
        return 'bg-green-100 text-green-800';
      case 'exception':
        return 'bg-red-100 text-red-800';
      case 'workflow':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            {query 
              ? `No results found for "${query}". Try adjusting your search terms or filters.`
              : "Enter a search query to find invoices, compliance records, exceptions, and workflows."
            }
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span>Try searching for:</span>
            <Badge variant="outline">invoice numbers</Badge>
            <Badge variant="outline">vendor names</Badge>
            <Badge variant="outline">compliance titles</Badge>
            <Badge variant="outline">workflow names</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {results.length} result{results.length !== 1 ? 's' : ''} 
          {query && ` for "${query}"`}
        </h3>
        <Badge variant="outline">
          {results.length} total
        </Badge>
      </div>

      {results.map((result) => (
        <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={getTypeColor(result.type)}>
                      {getTypeIcon(result.type)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {highlightMatch(result.title, query)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {highlightMatch(result.description, query)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                  <Badge variant="secondary" className="capitalize">
                    {result.type}
                  </Badge>
                  
                  {result.metadata.status && (
                    <Badge 
                      variant={result.metadata.status === 'approved' || result.metadata.status === 'closed' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {result.metadata.status}
                    </Badge>
                  )}

                  {result.metadata.amount && (
                    <span className="font-medium">
                      ${parseFloat(result.metadata.amount).toLocaleString()}
                    </span>
                  )}

                  {(result.metadata.created_at || result.metadata.invoice_date) && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(result.metadata.created_at || result.metadata.invoice_date)}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Score: {result.score}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(result.url)}
                className="ml-4"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};