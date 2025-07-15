import React from 'react';
import {
  ExternalLink,
  Calendar,
  MapPin,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Building2,
  BarChart3,
} from 'lucide-react';
import { CompanySearchResult } from '../../services/api';

interface CompanySearchCardProps {
  result: CompanySearchResult;
  onClick?: () => void;
  onCompanyDetailsClick?: (companyId: string, companyName: string) => void;
}

export const CompanySearchCard: React.FC<CompanySearchCardProps> = ({ result, onClick, onCompanyDetailsClick }) => {
  // Calculate dominant sentiment
  const { positive, negative, neutral } = result.sentiments;
  const total = positive + negative + neutral;

  let dominantSentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
  let dominantCount = neutral;
  let dominantPercentage = 0;

  if (positive > negative && positive > neutral) {
    dominantSentiment = 'Positive';
    dominantCount = positive;
    dominantPercentage = total > 0 ? (positive / total) * 100 : 0;
  } else if (negative > positive && negative > neutral) {
    dominantSentiment = 'Negative';
    dominantCount = negative;
    dominantPercentage = total > 0 ? (negative / total) * 100 : 0;
  } else {
    dominantPercentage = total > 0 ? (neutral / total) * 100 : 0;
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'Negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Negative':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div
      onClick={() => {
        if (onCompanyDetailsClick && result.company_id) {
          onCompanyDetailsClick(result.company_id.toString(), result.company_name);
        }
      }}
      className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Company Logo/Icon */}
          <div className="relative">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gray-50 border border-gray-200 group-hover:shadow-md transition-shadow">
              {result.logo_url ? (
                <img src={result.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <Building2 className="h-6 w-6 text-emerald-600" />
              )}
            </div>
            {/* Status indicator */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              dominantSentiment === 'Positive' ? 'bg-emerald-500' : 
              dominantSentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
          </div>
          
          <div className="flex-1">
            <h3 
              className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors"
            >
              {result.company_name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <BarChart3 className="h-3 w-3" />
                <span className="font-medium">{total} mentions</span>
              </div>
              {result.publication_date && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Latest: {formatDate(result.publication_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Dominant Sentiment Badge */}
        <div className={`flex items-center px-3 py-1.5 rounded-full border ${getSentimentColor(dominantSentiment)} font-medium text-sm`}>
          {getSentimentIcon(dominantSentiment)}
          <span className="ml-1.5">
            {dominantSentiment} ({Math.round(dominantPercentage)}%)
          </span>
        </div>
      </div>

      {/* AI Reason */}
      {result.reason && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">AI</span>
            </div>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{result.reason}"</p>
          </div>
        </div>
      )}

      {/* Risk Analysis */}
      {result.risk_types && Object.keys(result.risk_types).length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-700">Risk Factors</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.risk_types)
              .slice(0, 3)
              .map(([risk, count], index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg border border-orange-200"
                >
                  {risk} <span className="ml-1 bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full text-xs">{count}</span>
                </span>
              ))}
            {Object.keys(result.risk_types).length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
                +{Object.keys(result.risk_types).length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Geographic and Sector Information */}
      <div className="space-y-3 mb-4">
        {/* Countries */}
        {result.countries?.top_3?.length > 0 && (
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="h-3 w-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-600 mb-1">Geographic Presence</div>
              <div className="flex flex-wrap gap-1.5">
                {result.countries.top_3.map((country, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 font-medium"
                  >
                    {country.name}
                  </span>
                ))}
                {result.countries.total_unique > 3 && (
                  <span className="inline-block px-2 py-0.5 text-xs text-gray-500 bg-gray-50 rounded border border-gray-200">
                    +{result.countries.total_unique - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Commodities */}
        {result.commodities?.top_3?.length > 0 && (
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="h-3 w-3 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-600 mb-1">Sector Involvement</div>
              <div className="flex flex-wrap gap-1.5">
                {result.commodities.top_3.map((commodity, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200 font-medium"
                  >
                    {commodity.name}
                  </span>
                ))}
                {result.commodities.total_unique > 3 && (
                  <span className="inline-block px-2 py-0.5 text-xs text-gray-500 bg-gray-50 rounded border border-gray-200">
                    +{result.commodities.total_unique - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ExternalLink className="h-3 w-3" />
          <span className="font-medium">{result.urls?.length || 0} news sources</span>
        </div>
        
        <div className="flex items-center gap-2">
          {result.urls && result.urls.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-600 font-medium">{extractDomain(result.urls[0])}</span>
              {result.urls.length > 1 && (
                <span className="text-gray-400">+{result.urls.length - 1} more</span>
              )}
            </div>
          )}
          
          {/* External link button */}
          {result.urls && result.urls.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(result.urls[0], '_blank');
              }}
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};