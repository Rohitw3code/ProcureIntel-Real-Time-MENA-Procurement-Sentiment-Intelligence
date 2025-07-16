import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Filter, X, BarChart3, Shuffle, Building2, ChevronRight } from 'lucide-react';
import { statsApi, CompanySentimentSummary as CompanySentimentSummaryType, CompanySentimentSummaryParams, ShuffledCompany } from '../../services/api';

interface CompanySentimentSummaryProps {
  isVisible: boolean;
  onCompanyDetailsClick?: (companyId: string, companyName: string) => void;
}

export const CompanySentimentSummary: React.FC<CompanySentimentSummaryProps> = ({ 
  isVisible, 
  onCompanyDetailsClick 
}) => {
  const [data, setData] = useState<CompanySentimentSummaryType[]>([]);
  const [shuffledData, setShuffledData] = useState<ShuffledCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [filters, setFilters] = useState<CompanySentimentSummaryParams>({
    order_by: 'total',
    limit: 3
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if any meaningful filters are applied
      const hasFilters = filters.name || filters.risk_type || filters.mode || 
                        filters.order_by !== 'total' || filters.limit !== 3;
      
      if (hasFilters) {
        // Use filtered data
        const result = await statsApi.getCompanySentimentSummary(filters);
        setData(result);
        setShuffledData([]);
        setHasAppliedFilters(true);
      } else {
        // Use shuffled companies
        const shuffled = await statsApi.getShuffledCompanies();
        setShuffledData(shuffled);
        setData([]);
        setHasAppliedFilters(false);
      }
    } catch (err) {
      setError('Failed to load company data');
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchData();
    }
  }, [isVisible, filters]);

  const handleFilterChange = (key: keyof CompanySentimentSummaryParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      order_by: 'total',
      limit: 3
    });
  };

  const getSentimentIcon = (type: 'positive' | 'negative' | 'neutral' | 'Positive' | 'Negative' | 'Neutral') => {
    const sentiment = typeof type === 'string' ? type.toLowerCase() : type;
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (type: 'positive' | 'negative' | 'neutral' | 'Positive' | 'Negative' | 'Neutral') => {
    const sentiment = typeof type === 'string' ? type.toLowerCase() : type;
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const hasActiveFilters = filters.name || filters.risk_type || filters.mode || filters.order_by !== 'total' || filters.limit !== 3;

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            {hasAppliedFilters ? (
              <BarChart3 className="h-5 w-5 text-purple-600" />
            ) : (
              <Shuffle className="h-5 w-5 text-purple-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {hasAppliedFilters ? 'Company Sentiment Overview' : 'Featured Companies/Entity'}
            </h2>
            <p className="text-sm text-gray-600">
              {hasAppliedFilters 
                ? 'Sentiment analysis summary for companies' 
                : 'Discover companies in our intelligence database'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Filter Buttons */}
            <button
              onClick={() => handleFilterChange('order_by', 'positive')}
              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                filters.order_by === 'positive'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Most Positive
            </button>
            
            <button
              onClick={() => handleFilterChange('order_by', 'negative')}
              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                filters.order_by === 'negative'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="h-3 w-3 mr-1" />
              Most Negative
            </button>
            
            <button
              onClick={() => handleFilterChange('order_by', 'total')}
              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                filters.order_by === 'total'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Most Mentioned
            </button>

            {!hasAppliedFilters && (
              <button
                onClick={fetchData}
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              >
                <Shuffle className="h-3 w-3 mr-1" />
                Shuffle
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-2 py-1 border rounded-lg text-xs font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="h-3 w-3 mr-1" />
              Advanced
              {hasActiveFilters && (
                <span className="ml-1 bg-purple-600 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Search entity/company..."
                  value={filters.name || ''}
                  onChange={(e) => handleFilterChange('name', e.target.value || undefined)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analysis Mode
                </label>
                <select
                  value={filters.mode || ''}
                  onChange={(e) => handleFilterChange('mode', e.target.value as any || undefined)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                >
                  <option value="">All Modes</option>
                  <option value="Tender">Tender</option>
                  <option value="Sentiment">Sentiment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Financial"
                  value={filters.risk_type || ''}
                  onChange={(e) => handleFilterChange('risk_type', e.target.value || undefined)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit
                </label>
                <select
                  value={filters.limit || 10}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                >
                  <option value={3}>3 companies</option>
                  <option value={5}>5 companies</option>
                  <option value={10}>10 companies</option>
                  <option value={20}>20 companies</option>
                  <option value={50}>50 companies</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center text-xs text-gray-600 hover:text-gray-800"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset Filters
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600 text-sm">Loading company data...</span>
          </div>
        ) : (
          <div className="p-4">
            {/* Filtered Company Data */}
            {hasAppliedFilters && data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((company, index) => (
                  <div 
                    key={index} 
                    onClick={() => {
                      if (onCompanyDetailsClick && company.company_id) {
                        onCompanyDetailsClick(company.company_id.toString(), company.company_name);
                      }
                    }}
                    className={`bg-gray-50 rounded-lg border border-gray-200 p-3 transition-all duration-200 h-fit ${
                      onCompanyDetailsClick && company.company_id 
                        ? 'hover:shadow-lg hover:border-purple-300 cursor-pointer group hover:bg-white' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-gray-900 text-sm leading-tight flex-1 pr-2 ${
                        onCompanyDetailsClick && company.company_id ? 'group-hover:text-purple-700' : ''
                      }`}>
                        {company.company_name}
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                          {company.total_sentiments} mentions
                        </span>
                        {onCompanyDetailsClick && company.company_id && (
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Positive */}
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon('positive')}
                          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Positive</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${getSentimentColor('positive')}`}>
                            {company.positive}
                          </span>
                          <span className="text-xs text-gray-500 w-6 sm:w-8 text-right flex-shrink-0">
                            {company.total_sentiments > 0 ? Math.round((company.positive / company.total_sentiments) * 100) : 0}%
                          </span>
                        </div>
                      </div>

                      {/* Negative */}
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon('negative')}
                          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Negative</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${getSentimentColor('negative')}`}>
                            {company.negative}
                          </span>
                          <span className="text-xs text-gray-500 w-6 sm:w-8 text-right flex-shrink-0">
                            {company.total_sentiments > 0 ? Math.round((company.negative / company.total_sentiments) * 100) : 0}%
                          </span>
                        </div>
                      </div>

                      {/* Neutral */}
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon('neutral')}
                          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Neutral</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${getSentimentColor('neutral')}`}>
                            {company.neutral}
                          </span>
                          <span className="text-xs text-gray-500 w-6 sm:w-8 text-right flex-shrink-0">
                            {company.total_sentiments > 0 ? Math.round((company.neutral / company.total_sentiments) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div 
                          className="bg-emerald-500" 
                          style={{ width: `${company.total_sentiments > 0 ? (company.positive / company.total_sentiments) * 100 : 0}%` }}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${company.total_sentiments > 0 ? (company.negative / company.total_sentiments) * 100 : 0}%` }}
                        ></div>
                        <div 
                          className="bg-gray-400" 
                          style={{ width: `${company.total_sentiments > 0 ? (company.neutral / company.total_sentiments) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shuffled Company Data */}
            {!hasAppliedFilters && shuffledData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shuffledData.map((company, index) => (
                  <div 
                    key={index} 
                    onClick={() => {
                      if (onCompanyDetailsClick && company.company_id) {
                        onCompanyDetailsClick(company.company_id.toString(), company.company_name);
                      }
                    }}
                    className={`bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4 transition-all duration-200 ${
                      onCompanyDetailsClick && company.company_id 
                        ? 'hover:shadow-xl hover:border-purple-300 cursor-pointer group hover:from-purple-50 hover:to-white' 
                        : 'hover:shadow-lg hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className={`font-semibold text-gray-900 text-sm leading-tight min-w-0 flex-1 ${
                          onCompanyDetailsClick && company.company_id ? 'group-hover:text-purple-700' : ''
                        }`}>
                          {company.company_name}
                        </h3>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {formatDate(company.created_at)}
                        </span>
                        {onCompanyDetailsClick && company.company_id && (
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        )}
                        <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs ${getSentimentColor(company.sentiment)}`}>
                          {getSentimentIcon(company.sentiment)}
                          <span className="ml-1 font-medium">{company.sentiment}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile-only elements below company name */}
                    <div className="sm:hidden mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs ${getSentimentColor(company.sentiment)}`}>
                          {getSentimentIcon(company.sentiment)}
                          <span className="ml-1 font-medium">{company.sentiment}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(company.created_at)}
                          </span>
                          {onCompanyDetailsClick && company.company_id && (
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-700 italic leading-relaxed">
                        "{company.reason_for_sentiment}"
                      </p>
                    </div>

                    {company.risk_type && (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Risk: {company.risk_type}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && data.length === 0 && shuffledData.length === 0 && !error && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2 text-sm">No company data found</div>
                <p className="text-xs text-gray-400">Try adjusting your filters or refresh the page</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};