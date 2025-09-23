import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SearchResult {
  id: string;
  title: string;
  type: 'invoice' | 'compliance' | 'exception' | 'workflow';
  description: string;
  metadata: Record<string, any>;
  url: string;
  score: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  created_at: string;
}

export const useGlobalSearch = () => {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search to history
  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Global search across all entities
  const search = async (query: string, filters: Record<string, any> = {}) => {
    if (!user || !query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    addToHistory(query);

    try {
      const searchResults: SearchResult[] = [];

      // Search invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .or(`invoice_number.ilike.%${query}%,vendor_name.ilike.%${query}%,notes.ilike.%${query}%`);

      if (invoices) {
        invoices.forEach(invoice => {
          searchResults.push({
            id: invoice.id,
            title: `Invoice ${invoice.invoice_number}`,
            type: 'invoice',
            description: `${invoice.vendor_name} - $${invoice.amount}`,
            metadata: invoice,
            url: `/invoices`,
            score: calculateRelevanceScore(query, [invoice.invoice_number, invoice.vendor_name, invoice.notes || ''])
          });
        });
      }

      // Search compliance records
      const { data: compliance } = await supabase
        .from('compliance_records')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,responsible_party.ilike.%${query}%`);

      if (compliance) {
        compliance.forEach(record => {
          searchResults.push({
            id: record.id,
            title: record.title,
            type: 'compliance',
            description: `${record.record_type} - ${record.status}`,
            metadata: record,
            url: `/compliance`,
            score: calculateRelevanceScore(query, [record.title, record.description || '', record.responsible_party || ''])
          });
        });
      }

      // Search exceptions
      const { data: exceptions } = await supabase
        .from('exceptions')
        .select('*')
        .eq('user_id', user.id)
        .or(`description.ilike.%${query}%,resolution_notes.ilike.%${query}%`);

      if (exceptions) {
        exceptions.forEach(exception => {
          searchResults.push({
            id: exception.id,
            title: `${exception.exception_type} Exception`,
            type: 'exception',
            description: exception.description,
            metadata: exception,
            url: `/exceptions`,
            score: calculateRelevanceScore(query, [exception.description, exception.resolution_notes || ''])
          });
        });
      }

      // Search workflows
      const { data: workflows } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (workflows) {
        workflows.forEach(workflow => {
          searchResults.push({
            id: workflow.id,
            title: workflow.name,
            type: 'workflow',
            description: workflow.description || 'Workflow automation',
            metadata: workflow,
            url: `/workflows`,
            score: calculateRelevanceScore(query, [workflow.name, workflow.description || ''])
          });
        });
      }

      // Apply filters
      let filteredResults = searchResults;
      if (filters.type && filters.type !== 'all') {
        filteredResults = filteredResults.filter(result => result.type === filters.type);
      }
      if (filters.dateFrom || filters.dateTo) {
        filteredResults = filteredResults.filter(result => {
          const createdAt = result.metadata.created_at || result.metadata.invoice_date;
          if (!createdAt) return true;
          
          const date = new Date(createdAt);
          if (filters.dateFrom && date < new Date(filters.dateFrom)) return false;
          if (filters.dateTo && date > new Date(filters.dateTo)) return false;
          return true;
        });
      }

      // Sort by relevance score
      filteredResults.sort((a, b) => b.score - a.score);

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Calculate relevance score based on query match
  const calculateRelevanceScore = (query: string, fields: string[]): number => {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    fields.forEach(field => {
      if (!field) return;
      const lowerField = field.toLowerCase();
      
      // Exact match gets highest score
      if (lowerField === lowerQuery) score += 100;
      // Start of field match
      else if (lowerField.startsWith(lowerQuery)) score += 50;
      // Contains query
      else if (lowerField.includes(lowerQuery)) score += 25;
      
      // Bonus for shorter fields (more specific matches)
      if (lowerField.includes(lowerQuery)) {
        score += Math.max(0, 50 - field.length);
      }
    });

    return score;
  };

  // Save search with filters
  const saveSearch = async (name: string, query: string, filters: Record<string, any>) => {
    if (!user) return;

    // For now, save to localStorage (in production, save to database)
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters,
      created_at: new Date().toISOString()
    };

    const existing = localStorage.getItem('savedSearches') || '[]';
    const searches = JSON.parse(existing);
    searches.push(savedSearch);
    localStorage.setItem('savedSearches', JSON.stringify(searches));
    
    setSavedSearches(searches);
  };

  // Load saved searches
  const loadSavedSearches = () => {
    const existing = localStorage.getItem('savedSearches') || '[]';
    setSavedSearches(JSON.parse(existing));
  };

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const existing = localStorage.getItem('savedSearches') || '[]';
    const searches = JSON.parse(existing).filter((s: SavedSearch) => s.id !== id);
    localStorage.setItem('savedSearches', JSON.stringify(searches));
    setSavedSearches(searches);
  };

  useEffect(() => {
    loadSavedSearches();
  }, []);

  return {
    search,
    results,
    isSearching,
    searchHistory,
    savedSearches,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearches
  };
};