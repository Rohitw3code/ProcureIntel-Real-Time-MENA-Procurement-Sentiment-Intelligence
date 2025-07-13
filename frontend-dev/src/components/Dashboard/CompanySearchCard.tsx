import React from 'react';
import { ExternalLink, Calendar, MapPin, Package, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CompanySearchResult } from '../../services/api';

interface CompanySearchCardProps {
  result: CompanySearchResult;
  onClick?: () => void;
}

export const CompanySearchCard: React.FC<CompanySearchCardProps> = ({ result, onClick }) => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer hover:bg-gray-100"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">
            {result.article_title}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(result.publication_date)}
            </div>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
              {result.mode}
            </span>
          </div>
        </div>
        <a
          href={result.article_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:text-emerald-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Company and Sentiment */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs text-gray-500">Entity/Company:</span>
          <p className="font-semibold text-gray-900 text-sm">{result.company_name}</p>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full border ${getSentimentColor(result.sentiment)}`}>
          {getSentimentIcon(result.sentiment)}
          <span className="ml-1 text-xs font-medium">{result.sentiment}</span>
        </div>
      </div>

      {/* Sentiment Reason */}
      <div className="mb-3">
        <p className="text-xs text-gray-700 italic">"{result.reason_for_sentiment}"</p>
      </div>

      {/* Risk Type */}
      {result.risk_type && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
            Risk: {result.risk_type}
          </span>
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        {/* Countries */}
        {result.countries.length > 0 && (
          <div className="flex items-start space-x-2">
            <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {result.countries.map((country, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Commodities */}
        {result.commodities.length > 0 && (
          <div className="flex items-start space-x-2">
            <Package className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {result.commodities.map((commodity, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200"
                >
                  {commodity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};