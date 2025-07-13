import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, TrendingUp, TrendingDown, Minus, Calendar, MapPin, Package, ExternalLink, AlertTriangle, FileText } from 'lucide-react';
import { CompanySearchResult, statsApi } from '../../services/api';

interface CompanyAnalysisPageProps {
  companyName: string;
  onBack: () => void;
}

export const CompanyAnalysisPage: React.FC<CompanyAnalysisPageProps> = ({ companyName, onBack }) => {
  const [companyData, setCompanyData] = useState<CompanySearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyData();
  }, [companyName]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsApi.searchCompanies({ name: companyName });
      setCompanyData(data);
    } catch (err) {
      setError('Failed to load company analysis');
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <TrendingUp className="h-5 w-5" />;
      case 'Negative':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate sentiment statistics
  const sentimentStats = companyData.reduce(
    (acc, item) => {
      acc.total++;
      if (item.sentiment === 'Positive') acc.positive++;
      else if (item.sentiment === 'Negative') acc.negative++;
      else acc.neutral++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0, total: 0 }
  );

  // Get unique countries and commodities
  const uniqueCountries = [...new Set(companyData.flatMap(item => item.countries))];
  const uniqueCommodities = [...new Set(companyData.flatMap(item => item.commodities))];
  const uniqueRiskTypes = [...new Set(companyData.map(item => item.risk_type).filter(Boolean))];

  // Group by analysis mode
  const tenderArticles = companyData.filter(item => item.mode === 'Tender');
  const sentimentArticles = companyData.filter(item => item.mode === 'Sentiment');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={onBack}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{companyName}</h1>
                <p className="text-sm text-gray-600">Company Intelligence Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mentions</p>
                <p className="text-2xl font-bold text-gray-900">{sentimentStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positive Sentiment</p>
                <p className="text-2xl font-bold text-emerald-600">{sentimentStats.positive}</p>
                <p className="text-xs text-gray-500">
                  {sentimentStats.total > 0 ? Math.round((sentimentStats.positive / sentimentStats.total) * 100) : 0}% of total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Negative Sentiment</p>
                <p className="text-2xl font-bold text-red-600">{sentimentStats.negative}</p>
                <p className="text-xs text-gray-500">
                  {sentimentStats.total > 0 ? Math.round((sentimentStats.negative / sentimentStats.total) * 100) : 0}% of total
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Factors</p>
                <p className="text-2xl font-bold text-orange-600">{uniqueRiskTypes.length}</p>
                <p className="text-xs text-gray-500">Identified risks</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sentiment Distribution</h2>
          <div className="space-y-4">
            {/* Positive */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-gray-900">Positive</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full" 
                    style={{ width: `${sentimentStats.total > 0 ? (sentimentStats.positive / sentimentStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{sentimentStats.positive}</span>
              </div>
            </div>

            {/* Negative */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-900">Negative</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${sentimentStats.total > 0 ? (sentimentStats.negative / sentimentStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{sentimentStats.negative}</span>
              </div>
            </div>

            {/* Neutral */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Minus className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Neutral</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full" 
                    style={{ width: `${sentimentStats.total > 0 ? (sentimentStats.neutral / sentimentStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{sentimentStats.neutral}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic and Sector Presence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Countries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Geographic Presence
            </h3>
            <div className="flex flex-wrap gap-2">
              {uniqueCountries.map((country, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>

          {/* Commodities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-600" />
              Sector Involvement
            </h3>
            <div className="flex flex-wrap gap-2">
              {uniqueCommodities.map((commodity, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg border border-purple-200"
                >
                  {commodity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        {uniqueRiskTypes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Risk Analysis
            </h3>
            <div className="flex flex-wrap gap-2">
              {uniqueRiskTypes.map((risk, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200"
                >
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Articles Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tender Articles */}
          {tenderArticles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Tender & Contract Articles ({tenderArticles.length})</h3>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {tenderArticles.map((article, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 pr-3">
                        {article.article_title}
                      </h4>
                      <a
                        href={article.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publication_date)}
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs ${getSentimentColor(article.sentiment)}`}>
                      {getSentimentIcon(article.sentiment)}
                      <span className="ml-1 font-medium">{article.sentiment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Articles */}
          {sentimentArticles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Sentiment Articles ({sentimentArticles.length})</h3>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {sentimentArticles.map((article, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 pr-3">
                        {article.article_title}
                      </h4>
                      <a
                        href={article.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publication_date)}
                    </div>
                    <p className="text-xs text-gray-700 italic mb-2">"{article.reason_for_sentiment}"</p>
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs ${getSentimentColor(article.sentiment)}`}>
                        {getSentimentIcon(article.sentiment)}
                        <span className="ml-1 font-medium">{article.sentiment}</span>
                      </div>
                      {article.risk_type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                          {article.risk_type}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {companyData.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
            <p className="text-gray-500">No analysis data available for {companyName}</p>
          </div>
        )}
      </div>
    </div>
  );
};