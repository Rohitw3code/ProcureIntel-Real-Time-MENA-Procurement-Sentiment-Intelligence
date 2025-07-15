import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileCheck, Calendar, MapPin, Package, DollarSign, ExternalLink, RefreshCw, Clock, Filter, Search, TrendingUp, Building2, Sparkles, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { statsApi, TenderResult, TenderSearchParams } from '../../services/api';

interface TendersPageProps {
  onBack: () => void;
}

// Predefined search queries for quick access
const PREDEFINED_QUERIES = [
  'infrastructure development',
  'renewable energy projects',
  'construction contracts',
  'technology services',
  'oil and gas sector',
  'transportation projects'
];

export const TendersPage: React.FC<TendersPageProps> = ({ onBack }) => {
  const [tenders, setTenders] = useState<TenderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTenders, setFilteredTenders] = useState<TenderResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [summarizingTenders, setSummarizingTenders] = useState<Set<number>>(new Set());
  const [tenderSummaries, setTenderSummaries] = useState<Map<number, string>>(new Map());
  const [expandedTenders, setExpandedTenders] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Auto-load with a default search on component mount
    if (PREDEFINED_QUERIES.length > 0) {
      const randomQuery = PREDEFINED_QUERIES[Math.floor(Math.random() * PREDEFINED_QUERIES.length)];
      setSearchQuery(randomQuery);
      handleSearch(randomQuery);
    }
  }, []);

  useEffect(() => {
    // Set filtered tenders to all tenders when tenders change
    setFilteredTenders(tenders);
  }, [tenders]);

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const searchParams: TenderSearchParams = {
        k: limit
      };
      
      if (query && query.trim()) {
        searchParams.query = query.trim();
      }
      
      const data = await statsApi.searchTenders(searchParams);
      setTenders(data);
    } catch (err) {
      setError('Failed to search tender data');
      console.error('Error fetching tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setTenders([]);
    setHasSearched(false);
    setError(null);
    setTenderSummaries(new Map());
    setExpandedTenders(new Set());
  };

  const handlePredefinedQuery = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleSummarizeTender = async (tender: TenderResult, index: number) => {
    setSummarizingTenders(prev => new Set(prev).add(index));
    
    try {
      const response = await statsApi.summarizeTender(tender.cleaned_text);
      setTenderSummaries(prev => new Map(prev).set(index, response.summary));
      setExpandedTenders(prev => new Set(prev).add(index));
    } catch (err) {
      console.error('Failed to summarize tender:', err);
      // You could show an error toast here
    } finally {
      setSummarizingTenders(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const toggleTenderExpansion = (index: number) => {
    setExpandedTenders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatContractValue = (value: string | null) => {
    if (!value) return 'Value not disclosed';
    return value;
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getValueColor = (value: string | null) => {
    if (!value) return 'text-gray-500';
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('billion') || lowerValue.includes('bn')) return 'text-emerald-600 font-bold';
    if (lowerValue.includes('million') || lowerValue.includes('mn')) return 'text-blue-600 font-semibold';
    return 'text-purple-600';
  };

  const isDeadlineUrgent = (deadline: string | null) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return 'text-gray-500';
    if (isDeadlineUrgent(deadline)) return 'text-red-600 font-semibold';
    return 'text-orange-600';
  };

  const extractTitle = (cleanedText: string) => {
    // Extract first sentence or first 100 characters as title
    const sentences = cleanedText.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 20 && firstSentence.length < 150) {
      return firstSentence;
    }
    
    // Fallback to first 100 characters
    return cleanedText.substring(0, 100).trim() + (cleanedText.length > 100 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileCheck className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  MENA Procurement Tenders
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Discover the latest procurement opportunities across the MENA region
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search tenders by title, country, or commodity..."
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm bg-white min-w-0"
                >
                  <option value={5}>5 tenders</option>
                  <option value={10}>10 tenders</option>
                  <option value={20}>20 tenders</option>
                  <option value={50}>50 tenders</option>
                  <option value={100}>100 tenders</option>
                </select>
                
                <button
                  onClick={() => handleSearch()}
                  disabled={loading || !searchQuery.trim()}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  {loading ? (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </button>
                
                {hasSearched && (
                  <button
                    onClick={clearSearch}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 hover:text-gray-800 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Predefined Query Buttons */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm text-gray-500 font-medium mr-2 py-1">Quick searches:</span>
              {PREDEFINED_QUERIES.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedQuery(query)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
                    searchQuery === query
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                  }`}
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <FileCheck className="h-4 w-4 mr-2 text-orange-600" />
                <span className="font-medium">{filteredTenders.length} tenders found</span>
              </div>
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-blue-600" />
                <span>AI-powered search</span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                <span>MENA region</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">Loading procurement opportunities...</p>
            </div>
          </div>
        ) : (
          /* Tenders Grid */
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            {filteredTenders.length > 0 ? (
              <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-6xl">
                {filteredTenders.map((tender, index) => (
                  <div 
                    key={index} 
                    className="group bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden w-full max-w-4xl"
                  >
                    {/* Beautiful Tender Card */}
                    <div className="relative">
                      {/* Gradient Header */}
                      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 h-1"></div>
                      
                      {/* Main Content */}
                      <div className="p-3 sm:p-4">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-2 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-colors flex-shrink-0">
                              <FileCheck className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1 animate-pulse"></span>
                                  Tender #{index + 1}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                  {extractDomain(tender.url)}
                                </span>
                              </div>
                              
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-orange-700 transition-colors leading-tight mb-2">
                                {extractTitle(tender.cleaned_text)}
                              </h3>

                              {/* Key Details Row */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                                {/* Contract Value */}
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                  <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                                    <DollarSign className="h-3 w-3 text-emerald-600" />
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block leading-tight">Value</span>
                                    <span className={`text-xs font-medium ${getValueColor(tender.contract_value)}`}>
                                      {formatContractValue(tender.contract_value)}
                                    </span>
                                  </div>
                                </div>

                                {/* Deadline */}
                                {tender.deadline && (
                                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
                                      <Clock className="h-3 w-3 text-red-600" />
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block leading-tight">Deadline</span>
                                      <span className={`text-xs font-medium ${getDeadlineColor(tender.deadline)}`}>
                                        {formatDate(tender.deadline)}
                                        {isDeadlineUrgent(tender.deadline) && (
                                          <span className="ml-1 text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded text-xs">
                                            Urgent
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Source */}
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                                    <Building2 className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block leading-tight">Source</span>
                                    <span className="text-xs font-medium text-gray-700">
                                      {tender.source}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <a
                            href={tender.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>

                        {/* Geographic and Sector Tags */}
                        <div className="space-y-2 mb-3">
                          {/* Countries */}
                          {tender.countries.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <div className="w-4 h-4 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MapPin className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-medium text-gray-700 mb-1">Geographic Scope</div>
                                <div className="flex flex-wrap gap-1">
                                  {tender.countries.map((country, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                                    >
                                      {country}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Commodities */}
                          {tender.commodities.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <div className="w-4 h-4 bg-purple-50 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Package className="h-3 w-3 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-medium text-gray-700 mb-1">Sectors & Commodities</div>
                                <div className="flex flex-wrap gap-1">
                                  {tender.commodities.map((commodity, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200 font-medium hover:bg-purple-100 transition-colors"
                                    >
                                      {commodity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Summary Section */}
                        {tenderSummaries.has(index) && expandedTenders.has(index) && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                                  <Sparkles className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-blue-900">AI Summary</span>
                                  <p className="text-xs text-blue-700">Generated from tender details</p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleTenderExpansion(index)}
                                className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-800 leading-relaxed text-sm">
                                {tenderSummaries.get(index)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-2 sm:gap-0">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-700">{tender.source}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {tender.analysis_mode}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!tenderSummaries.has(index) ? (
                              <button
                                onClick={() => handleSummarizeTender(tender, index)}
                                disabled={summarizingTenders.has(index)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {summarizingTenders.has(index) ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI Summary
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleTenderExpansion(index)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                              >
                                {expandedTenders.has(index) ? (
                                  <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Show
                                  </>
                                )}
                              </button>
                            )}
                            
                            <button
                              onClick={() => window.open(tender.url, '_blank')}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Tender
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileCheck className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No tenders found</h3>
                <p className="text-gray-500 mb-6">
                  Try searching with different keywords or terms
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {PREDEFINED_QUERIES.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handlePredefinedQuery(suggestion)}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-orange-100 hover:text-orange-700 transition-colors border border-gray-200 hover:border-orange-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};