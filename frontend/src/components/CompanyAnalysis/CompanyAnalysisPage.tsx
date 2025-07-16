import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, TrendingUp, TrendingDown, Minus, Calendar, Clock, MessageSquare, Package, AlertTriangle, BarChart3, Globe, ExternalLink } from 'lucide-react';
import { CompanySentimentTimeline, CompanyRiskFactors, CompanyCommodityData, statsApi } from '../../services/api';
import { SentimentTrendChart } from './SentimentTrendChart';
import { RiskFactorsChart } from './RiskFactorsChart';
import { CompanyCommoditiesSection } from './CompanyCommoditiesSection';

interface CompanyAnalysisPageProps {
  companyId: string;
  companyName: string;
  onBack: () => void;
}

type TabType = 'overview' | 'commodities' | 'risks';

export const CompanyAnalysisPage: React.FC<CompanyAnalysisPageProps> = ({ 
  companyId, 
  companyName, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [timelineData, setTimelineData] = useState<CompanySentimentTimeline | null>(null);
  const [riskData, setRiskData] = useState<CompanyRiskFactors | null>(null);
  const [commoditiesData, setCommoditiesData] = useState<CompanyCommodityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch timeline, risk, and commodities data in parallel
      const [timelineResponse, riskResponse, commoditiesResponse] = await Promise.allSettled([
        statsApi.getCompanySentiments(companyId),
        statsApi.getCompanyRiskFactors(companyId),
        statsApi.getCompanyCommodities(companyId)
      ]);
      
      if (timelineResponse.status === 'fulfilled') {
        setTimelineData(timelineResponse.value);
      } else {
        console.error('Failed to fetch timeline data:', timelineResponse.reason);
      }
      
      if (riskResponse.status === 'fulfilled') {
        setRiskData(riskResponse.value);
      } else {
        console.error('Failed to fetch risk data:', riskResponse.reason);
      }
      
      if (commoditiesResponse.status === 'fulfilled') {
        setCommoditiesData(commoditiesResponse.value);
      } else {
        console.error('Failed to fetch commodities data:', commoditiesResponse.reason);
      }
      
    } catch (err) {
      setError('Failed to load company data');
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'Negative':
        return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <Minus className="h-3 w-3 sm:h-4 sm:w-4" />;
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

  // Calculate sentiment statistics from timeline data
  const calculateStats = () => {
    if (!timelineData) return { positive: 0, negative: 0, neutral: 0, total: 0 };
    
    let positive = 0, negative = 0, neutral = 0, total = 0;
    
    Object.values(timelineData.sentiment_timeline).forEach(dayEntries => {
      dayEntries.forEach(entry => {
        total++;
        if (entry.sentiment === 'Positive') positive++;
        else if (entry.sentiment === 'Negative') negative++;
        else neutral++;
      });
    });
    
    return { positive, negative, neutral, total };
  };

  const stats = calculateStats();

  // Prepare timeline data for visualization
  const timelineEntries = timelineData ? 
    Object.entries(timelineData.sentiment_timeline)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    : [];

  // Calculate data availability for tab indicators
  const hasRiskData = riskData && Object.keys(riskData.risk_counts_by_date).length > 0;
  const hasCommoditiesData = commoditiesData.length > 0;

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview',
      icon: BarChart3,
      count: stats.total,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'commodities' as TabType,
      label: 'Markets & Sectors',
      icon: Package,
      count: commoditiesData.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hasData: hasCommoditiesData
    },
    {
      id: 'risks' as TabType,
      label: 'Risk Analysis',
      icon: AlertTriangle,
      count: hasRiskData ? Object.keys(riskData.risk_counts_by_date).length : 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hasData: hasRiskData
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading company analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={onBack}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base"
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0 mt-1 sm:mt-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {timelineData?.real_name || companyName}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="text-xs sm:text-sm font-normal text-gray-500">
                    ID: {companyId}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <p className="text-xs sm:text-sm text-gray-600">Company/Entity Intelligence Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Mentions</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Positive</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.positive}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Negative</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.negative}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Neutral</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-600">{stats.neutral}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0}%
                </p>
              </div>
              <Minus className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 sm:flex-none sm:min-w-0 py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
                      isActive
                        ? `border-emerald-500 ${tab.color} ${tab.bgColor}`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <div className="relative">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {tab.hasData !== undefined && !tab.hasData && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                        {tab.hasData && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-center sm:text-left">
                        <span className="block">{tab.label}</span>
                        {tab.count > 0 && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium mt-1 sm:mt-0 sm:ml-2 ${
                            isActive ? `${tab.color} ${tab.bgColor} ${tab.borderColor} border` : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 min-h-[600px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-6">
              <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[65%_35%] lg:gap-8">
                {/* Sentiment Chart */}
                <div className="order-1 lg:order-1">
                  {timelineData && <SentimentTrendChart timelineData={timelineData} />}
                </div>

                {/* Timeline Section */}
                <div className="order-2 lg:order-2 bg-gray-50 rounded-xl border border-gray-200 flex flex-col max-h-[600px] lg:max-h-[800px]">
                  <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                      Recent Timeline
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Latest sentiment mentions
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                      {timelineEntries.length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                          {timelineEntries.slice(0, 10).map(([date, entries], dateIndex) => (
                            <div key={date} className="relative">
                              {/* Date Header */}
                              <div className="flex items-center mb-2 sm:mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-600 rounded-full"></div>
                                  <div className="h-px bg-gray-300 flex-1 w-6 sm:w-8"></div>
                                </div>
                                <div className="ml-2 sm:ml-3 bg-white px-2 py-1 rounded-md sm:rounded-lg border border-gray-200">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
                                    <span className="text-xs font-medium text-gray-900">
                                      {new Date(date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded text-xs">
                                      {entries.length}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Sentiment Entries */}
                              <div className="ml-3 sm:ml-4 space-y-2">
                                {entries.slice(0, 3).map((entry, entryIndex) => (
                                  <div 
                                    key={entryIndex}
                                    className={`relative p-2 sm:p-3 rounded-md sm:rounded-lg border-l-2 sm:border-l-3 ${
                                      entry.sentiment === 'Positive' ? 'border-l-emerald-500 bg-emerald-50' :
                                      entry.sentiment === 'Negative' ? 'border-l-red-500 bg-red-50' :
                                      'border-l-gray-500 bg-gray-50'
                                    } hover:shadow-sm transition-shadow`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-xs font-medium ${getSentimentColor(entry.sentiment)}`}>
                                        {getSentimentIcon(entry.sentiment)}
                                        <span className="ml-1">{entry.sentiment}</span>
                                      </div>
                                      {entry.url && (
                                        <a
                                          href={entry.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          title="View source article"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                    
                                    <p className="text-xs text-gray-700 leading-relaxed">
                                      {entry.reason}
                                    </p>
                                    
                                    {entry.url && (
                                      <div className="mt-2 pt-2 border-t border-gray-200/50">
                                        <a
                                          href={entry.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <span className="truncate max-w-48">
                                            {new URL(entry.url).hostname.replace('www.', '')}
                                          </span>
                                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}


                                
                                {entries.length > 3 && (
                                  <div className="ml-2 sm:ml-3 text-xs text-gray-500">
                                    +{entries.length - 3} more mentions 4545
                                  </div>
                                )}
                              </div>

                              {/* Connector line for next date */}
                              {dateIndex < Math.min(timelineEntries.length - 1, 9) && (
                                <div className="absolute left-0.5 sm:left-1 top-full w-px h-4 sm:h-6 bg-gray-300"></div>
                              )}
                            </div>
                          ))}
                          
                          {timelineEntries.length > 10 && (
                            <div className="text-center pt-4 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Showing latest 10 days • {timelineEntries.length - 10} more days available
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-sm font-medium text-gray-900 mb-2">No timeline data</h3>
                          <p className="text-xs text-gray-500">No sentiment timeline available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commodities Tab */}
          {activeTab === 'commodities' && (
            <div className="p-4 sm:p-6">
              <CompanyCommoditiesSection 
                commoditiesData={commoditiesData} 
                companyName={timelineData?.real_name || companyName}
              />
            </div>
          )}

          {/* Risk Analysis Tab */}
          {activeTab === 'risks' && (
            <div className="p-4 sm:p-6">
              {riskData && hasRiskData ? (
                <RiskFactorsChart riskData={riskData} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Risk Data Available</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    No risk factors have been identified for this company yet.
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-orange-800">
                      Risk analysis data will appear here once the system identifies potential risk factors from news articles and reports.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};