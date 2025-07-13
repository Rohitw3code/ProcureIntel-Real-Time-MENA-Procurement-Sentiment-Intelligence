import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CompanySearchCard } from './CompanySearchCard';
import { statsApi, CompanySearchResult, CompanySearchParams } from '../../services/api';

interface CompanySearchProps {
  onSearchStateChange?: (hasSearched: boolean) => void;
  onCompanyClick?: (companyName: string) => void;
}

export const CompanySearch: React.FC<CompanySearchProps> = ({ onSearchStateChange, onCompanyClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasPerformedSearch, setHasPerformedSearch] = useState(false);
  const [filters, setFilters] = useState<Omit<CompanySearchParams, 'name'>>({
    sentiment: undefined,
    risk_type: undefined,
    mode: undefined
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const searchParams: CompanySearchParams = {
        name: searchQuery,
        ...filters
      };
      const data = await statsApi.searchCompanies(searchParams);
      setResults(data);
      setHasPerformedSearch(true);
      onSearchStateChange?.(true);
    } catch (err) {
      setError('Failed to search companies');
      console.error('Error searching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      sentiment: undefined,
      risk_type: undefined,
      mode: undefined
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHasPerformedSearch(false);
    setError(null);
    clearFilters();
    onSearchStateChange?.(false);
  };

  const hasActiveFilters = filters.sentiment || filters.risk_type || filters.mode;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Search className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              Company Intelligence Search
            </h2>
            <p className="text-sm text-gray-600">
              Search company mentions with sentiment analysis
            </p>
          </div>
          {hasPerformedSearch && (
            <button
              onClick={clearSearch}
              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <X className="h-3 w-3 mr-1" />
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-lg font-medium transition-colors text-sm ${
                showFilters || hasActiveFilters
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-emerald-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
            
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sentiment
                </label>
                <select
                  value={filters.sentiment || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value as any || undefined }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Mode
                </label>
                <select
                  value={filters.mode || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value as any || undefined }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="">All Modes</option>
                  <option value="Tender">Tender</option>
                  <option value="Sentiment">Sentiment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Financial, Supply Disruption"
                  value={filters.risk_type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, risk_type: e.target.value || undefined }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center text-xs text-gray-600 hover:text-gray-800"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-shrink-0">
        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600 text-sm">Searching companies...</span>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Search Results ({results.length} found)
                </h3>
              </div>
              
              <div className="space-y-3">
                {results.map((result, index) => (
                  <CompanySearchCard 
                    key={index} 
                    result={result} 
                    onClick={() => onCompanyClick?.(result.company_name)}
                  />
                ))}
              </div>
          </div>
        )}

        {!loading && hasPerformedSearch && results.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2 text-sm">No companies found matching your search criteria</div>
            <p className="text-xs text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};