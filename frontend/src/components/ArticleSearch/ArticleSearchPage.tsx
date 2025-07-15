import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Calendar, User, ExternalLink, ArrowLeft, Sparkles, X } from 'lucide-react';
import { statsApi, ArticleSearchResult } from '../../services/api';

interface ArticleSearchPageProps {
  onBack: () => void;
}

// Predefined queries that will auto-load
const PREDEFINED_QUERIES = [
  'renewable energy projects',
  'infrastructure development',
  'technology investments',
  'oil and gas sector',
  'construction contracts'
];

export const ArticleSearchPage: React.FC<ArticleSearchPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArticleSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultLimit, setResultLimit] = useState(10);
  const [summarizingArticles, setSummarizingArticles] = useState<Set<number>>(new Set());
  const [articleSummaries, setArticleSummaries] = useState<Map<number, string>>(new Map());

  // Auto-load with first predefined query on component mount
  useEffect(() => {
    if (PREDEFINED_QUERIES.length > 0) {
      const randomQuery = PREDEFINED_QUERIES[Math.floor(Math.random() * PREDEFINED_QUERIES.length)];
      setSearchQuery(randomQuery);
      handleSearch(randomQuery);
    }
  }, []);

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await statsApi.searchArticles({ 
        query: query, 
        k: resultLimit 
      });
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search articles. Please try again.');
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
    setError(null);
    setArticleSummaries(new Map());
  };

  const handleSummarizeArticle = async (article: ArticleSearchResult) => {
    setSummarizingArticles(prev => new Set(prev).add(article.id));
    
    try {
      const response = await statsApi.summarizeArticle(article.description);
      setArticleSummaries(prev => new Map(prev).set(article.id, response.summary));
    } catch (err) {
      console.error('Failed to summarize article:', err);
      // You could show an error toast here
    } finally {
      setSummarizingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(article.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handlePredefinedQuery = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Article Search
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Search through our database of news articles and reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Search Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4">
            {/* Main Search Bar */}
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
                  placeholder="Search for articles, topics, companies..."
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <select
                  value={resultLimit}
                  onChange={(e) => setResultLimit(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm bg-white min-w-0"
                >
                  <option value={5}>5 results</option>
                  <option value={10}>10 results</option>
                  <option value={20}>20 results</option>
                  <option value={50}>50 results</option>
                </select>
                
                <button
                  onClick={() => handleSearch()}
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
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
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200'
                  }`}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results
              </h3>
              <span className="text-sm text-gray-500">
                {searchResults.length} {searchResults.length === 1 ? 'article' : 'articles'} found
              </span>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {searchResults.map((article) => (
                  <div 
                    key={article.id} 
                    className="group bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* Article Header */}
                    <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight mb-2">
                              {article.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                              {article.author && (
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span className="truncate max-w-32 sm:max-w-none">{article.author}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(article.publication_date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="truncate max-w-24 sm:max-w-none">{extractDomain(article.url)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        </a>
                      </div>

                      {/* Article Description */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                          {truncateText(article.description, window.innerWidth < 640 ? 200 : 300)}
                        </p>
                      </div>

                      {/* Summary Section */}
                      {articleSummaries.has(article.id) && (
                        <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">AI Summary</span>
                            </div>
                            <button
                              onClick={() => {
                                setArticleSummaries(prev => {
                                  const newMap = new Map(prev);
                                  newMap.delete(article.id);
                                  return newMap;
                                });
                              }}
                              className="text-blue-400 hover:text-blue-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            {articleSummaries.get(article.id)}
                          </p>
                        </div>
                      )}

                      {/* Article Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-3 sm:gap-0">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-600">
                            {extractDomain(article.url)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {!articleSummaries.has(article.id) && (
                            <button
                              onClick={() => handleSummarizeArticle(article)}
                              disabled={summarizingArticles.has(article.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {summarizingArticles.has(article.id) ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Summarizing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Summarize Article
                                </>
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => window.open(article.url, '_blank')}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Read Full Article
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Gradient */}
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try searching with different keywords or terms
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {PREDEFINED_QUERIES.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handlePredefinedQuery(suggestion)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">Searching articles...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};