import React from 'react';
import { Package, MapPin, Calendar, DollarSign, Clock, TrendingUp, Globe, Building2 } from 'lucide-react';
import { CompanyCommodityData } from '../../services/api';

interface CompanyCommoditiesSectionProps {
  commoditiesData: CompanyCommodityData[];
  companyName: string;
}

export const CompanyCommoditiesSection: React.FC<CompanyCommoditiesSectionProps> = ({ 
  commoditiesData, 
  companyName 
}) => {
  // Process data for insights
  const processData = () => {
    const allCommodities = new Set<string>();
    const allCountries = new Set<string>();
    const contractValues = commoditiesData.filter(item => item.contract_value).length;
    const withDeadlines = commoditiesData.filter(item => item.deadline).length;
    
    commoditiesData.forEach(item => {
      item.commodities.forEach(commodity => allCommodities.add(commodity));
      item.countries.forEach(country => allCountries.add(country));
    });
    
    return {
      totalEntries: commoditiesData.length,
      uniqueCommodities: allCommodities.size,
      uniqueCountries: allCountries.size,
      contractValues,
      withDeadlines,
      commoditiesList: Array.from(allCommodities),
      countriesList: Array.from(allCountries)
    };
  };

  const insights = processData();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCommodityColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-red-100 text-red-800 border-red-200'
    ];
    return colors[index % colors.length];
  };

  const getCountryColor = (index: number) => {
    const colors = [
      'bg-green-100 text-green-800 border-green-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    return colors[index % colors.length];
  };

  if (commoditiesData.length === 0) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Commodities Data</h3>
          <p className="text-sm text-gray-500">No commodity or country information available for this company</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Commodities & Markets
              </h2>
              <p className="text-sm text-gray-600">
                Business sectors and geographic presence for {companyName}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Entries</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-blue-800">{insights.totalEntries}</p>
            </div>
            
            <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Sectors</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-purple-800">{insights.uniqueCommodities}</p>
            </div>
            
            <div className="text-center p-2 sm:p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Countries</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-800">{insights.uniqueCountries}</p>
            </div>
            
            <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Active</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-orange-800">{insights.totalEntries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Commodities Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Business Sectors</h3>
                <p className="text-xs sm:text-sm text-gray-600">{insights.uniqueCommodities} unique sectors</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {insights.commoditiesList.map((commodity, index) => (
                <span
                  key={commodity}
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 hover:scale-105 ${getCommodityColor(index)}`}
                >
                  <Package className="h-3 w-3 mr-1.5" />
                  {commodity}
                </span>
              ))}
            </div>
          </div>

          {/* Countries Overview */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-emerald-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Geographic Presence</h3>
                <p className="text-xs sm:text-sm text-gray-600">{insights.uniqueCountries} countries</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {insights.countriesList.map((country, index) => (
                <span
                  key={country}
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 hover:scale-105 ${getCountryColor(index)}`}
                >
                  <MapPin className="h-3 w-3 mr-1.5" />
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Entries */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Recent Activity Timeline
            </h3>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {commoditiesData.length} entries
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {commoditiesData
              .sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime())
              .map((item, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm sm:text-base font-semibold text-gray-900">
                            Entry #{index + 1}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatDate(item.publication_date)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Published on {formatDate(item.publication_date)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex flex-wrap gap-2">
                      {item.contract_value && (
                        <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Contract Value
                        </span>
                      )}
                      {item.deadline && (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-lg border border-orange-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Deadline Set
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Commodities */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Business Sectors</span>
                        <span className="text-xs text-gray-500 bg-purple-50 px-2 py-0.5 rounded-full">
                          {item.commodities.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.commodities.map((commodity, commodityIndex) => (
                          <span
                            key={commodityIndex}
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 hover:scale-105 ${getCommodityColor(commodityIndex)}`}
                          >
                            {commodity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Countries */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">Geographic Scope</span>
                        <span className="text-xs text-gray-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {item.countries.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.countries.map((country, countryIndex) => (
                          <span
                            key={countryIndex}
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 hover:scale-105 ${getCountryColor(countryIndex)}`}
                          >
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(item.contract_value || item.deadline) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.contract_value && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-gray-700">Contract Value:</span>
                            <span className="text-sm font-semibold text-emerald-700">{item.contract_value}</span>
                          </div>
                        )}
                        {item.deadline && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-gray-700">Deadline:</span>
                            <span className="text-sm font-semibold text-orange-700">{formatDate(item.deadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-600">Total Sectors</span>
              </div>
              <p className="text-lg font-bold text-blue-700">{insights.uniqueCommodities}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Globe className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-gray-600">Countries</span>
              </div>
              <p className="text-lg font-bold text-emerald-700">{insights.uniqueCountries}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-600">Entries</span>
              </div>
              <p className="text-lg font-bold text-purple-700">{insights.totalEntries}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-gray-600">Latest</span>
              </div>
              <p className="text-xs font-bold text-orange-700">
                {commoditiesData.length > 0 ? formatDate(
                  commoditiesData.sort((a, b) => 
                    new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime()
                  )[0].publication_date
                ) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};