import React, { useState, useEffect } from 'react';
import { FileCheck, Calendar, MapPin, Package, DollarSign, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { statsApi, TenderResult } from '../../services/api';

interface TenderSectionProps {
  isVisible: boolean;
}

export const TenderSection: React.FC<TenderSectionProps> = ({ isVisible }) => {
  const [tenders, setTenders] = useState<TenderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsApi.getTenders(limit);
      setTenders(data);
    } catch (err) {
      setError('Failed to load tender data');
      console.error('Error fetching tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchTenders();
    }
  }, [isVisible, limit]);

  const formatDate = (dateString: string) => {
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

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Latest Tenders</h2>
              <p className="text-sm text-gray-600">Recent procurement opportunities</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value={5}>5 items</option>
              <option value={10}>10 items</option>
              <option value={20}>20 items</option>
            </select>
            
            <button
              onClick={fetchTenders}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-orange-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading tenders...</span>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-4">
              {tenders.map((tender, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1 pr-3">
                      {tender.title}
                    </h3>
                    <a
                      href={tender.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Date and Value */}
                  <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(tender.publication_date)}
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span className={tender.contract_value ? 'text-emerald-600 font-medium' : 'text-gray-500'}>
                        {formatContractValue(tender.contract_value)}
                      </span>
                    </div>

                    {tender.deadline && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="text-red-600 font-medium">
                          Due: {formatDate(tender.deadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    {/* Countries */}
                    {tender.countries.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {tender.countries.map((country, countryIndex) => (
                            <span
                              key={countryIndex}
                              className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded border border-blue-200"
                            >
                              {country}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Commodities */}
                    {tender.commodities.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <Package className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {tender.commodities.map((commodity, commodityIndex) => (
                            <span
                              key={commodityIndex}
                              className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded border border-purple-200"
                            >
                              {commodity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!loading && tenders.length === 0 && !error && (
                <div className="text-center py-12">
                  <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <div className="text-gray-500 mb-2">No tenders found</div>
                  <p className="text-sm text-gray-400">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};