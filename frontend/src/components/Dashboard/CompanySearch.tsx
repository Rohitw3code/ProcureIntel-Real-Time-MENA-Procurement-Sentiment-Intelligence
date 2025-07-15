import React, { useState } from 'react';
import { useEffect } from 'react';
import { Search, Loader2, Sparkles, Brain, Zap, Filter, X, ArrowRight, Building2 } from 'lucide-react';
import { statsApi, CompanySearchResult } from '../../services/api';
import { CompanySearchCard } from './CompanySearchCard';

interface CompanySearchProps {
  onSearchStateChange?: (isSearching: boolean) => void;
  onCompanyDetailsClick?: (companyId: string, companyName: string) => void;
}

const SAMPLE_SEARCHES = [
  "Saudi Aramco",
  "ADNOC",
  "Qatar Airways",
  "Emirates Steel",
  "SABIC",
  "Masdar"
];

export const CompanySearch: React.FC<CompanySearchProps> = ({
  onSearchStateChange,
  onCompanyDetailsClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [filters, setFilters] = useState({
    sentiment: '',
    risk_type: '',
    mode: ''
  });

  // Auto-search for a random company when component mounts
  useEffect(() => {
    if (!hasAutoSearched) {
      const randomCompany = SAMPLE_SEARCHES[Math.floor(Math.random() * SAMPLE_SEARCHES.length)];
      handleAutoSearch(randomCompany);
      setHasAutoSearched(true);
    }
  }, [hasAutoSearched]);

  const handleAutoSearch = async (companyName: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    onSearchStateChange?.(true);

    try {
      const searchParams = {
        name: companyName,
        ...(filters.sentiment && { sentiment: filters.sentiment as any }),
        ...(filters.risk_type && { risk_type: filters.risk_type }),
        ...(filters.mode && { mode: filters.mode as any })
      };
      
      const results = await statsApi.searchCompanies(searchParams);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search companies. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      onSearchStateChange?.(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    onSearchStateChange?.(true);

    try {
      const searchParams = {
        name: searchQuery,
        ...(filters.sentiment && { sentiment: filters.sentiment as any }),
        ...(filters.risk_type && { risk_type: filters.risk_type }),
        ...(filters.mode && { mode: filters.mode as any })
      };
      
      const results = await statsApi.searchCompanies(searchParams);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search companies. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setHasAutoSearched(false);
    setError(null);
    setFilters({ sentiment: '', risk_type: '', mode: '' });
    onSearchStateChange?.(false);
  };

  const handleSampleSearch = (sample: string) => {
    setSearchQuery(sample);
    // Auto-search when clicking sample
    setTimeout(() => {
      const event = { target: { value: sample } } as any;
      setSearchQuery(sample);
      handleSearch();
    }, 100);
  };

  const hasActiveFilters = filters.sentiment || filters.risk_type || filters.mode;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Input Section */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30 rounded-2xl shadow-lg border border-gray-200/60 backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AI Company Intelligence
                </h2>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  <span>Powered by advanced semantic search</span>
                </p>
              </div>
            </div>
            
            {/* Stats Badge */}
            <div className="flex items-center space-x-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200/60 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">Live Database</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Search Interface */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col sm:flex-row gap-3">
              {/* Input Container */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-emerald-600" />
                    <div className="hidden sm:block w-px h-5 bg-gray-300"></div>
                  </div>
                </div>
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search companies with AI intelligence..."
                  className="block w-full pl-12 sm:pl-16 pr-4 py-4 sm:py-5 text-base sm:text-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-xl leading-6 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                />
                
                {/* AI Indicator */}
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="flex items-center space-x-2">
                    {isLoading && (
                      <div className="flex items-center space-x-1">
                        <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                        <span className="text-xs text-emerald-600 font-medium hidden sm:inline">Analyzing...</span>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg px-2 py-1 border border-emerald-200/60">
                      <span className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        AI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative px-4 py-4 sm:py-5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                    showFilters || hasActiveFilters
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white/90 text-gray-700 border-2 border-gray-200/60 hover:border-purple-300'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>
                
                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="relative px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Searching...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
                
                {/* Clear Button */}
                {hasSearched && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-4 sm:py-5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium rounded-xl hover:bg-gray-100/80 flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-inner space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                  <span>Advanced Filters</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={() => setFilters({ sentiment: '', risk_type: '', mode: '' })}
                    className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Sentiment</label>
                  <select
                    value={filters.sentiment}
                    onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">All Sentiments</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Risk Type</label>
                  <input
                    type="text"
                    value={filters.risk_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, risk_type: e.target.value }))}
                    placeholder="e.g., Financial, Compliance"
                    className="w-full px-3 py-2 text-sm bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Analysis Mode</label>
                  <select
                    value={filters.mode}
                    onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">All Modes</option>
                    <option value="Tender">Tender</option>
                    <option value="Sentiment">Sentiment</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sample Searches */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Try searching for:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_SEARCHES.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleSearch(sample)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 border ${
                    searchQuery === sample
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-transparent shadow-lg'
                      : 'bg-white/80 text-gray-700 border-gray-200/60 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Building2 className="h-3 w-3" />
                    <span>{sample}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Stats */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-200/60">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>AI-powered semantic search</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Real-time sentiment analysis</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>MENA market intelligence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Search Results
                </h3>
                <p className="text-sm text-gray-600">
                  Found {searchResults.length} {searchResults.length === 1 ? 'company' : 'companies'} matching your query
                </p>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg px-3 py-2 border border-emerald-200/60">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Ranked by AI relevance
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((result, index) => (
                <div key={`${result.company_name}-${index}`} className="transform transition-all duration-200 hover:scale-[1.01]">
                  <CompanySearchCard
                    result={result}
                    onCompanyDetailsClick={onCompanyDetailsClick}
                  />
                </div>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/60">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search terms or filters</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SAMPLE_SEARCHES.slice(0, 3).map((sample) => (
                  <button
                    key={sample}
                    onClick={() => handleSampleSearch(sample)}
                    className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-200 hover:border-emerald-200"
                  >
                    Try "{sample}"
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};