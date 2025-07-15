import React from 'react';
import { Globe, Play, RefreshCw, CheckCircle, Circle, Sparkles, Zap, Shield } from 'lucide-react';

interface LinkScraperTabProps {
  scraperNames: string[];
  selectedScrapers: string[];
  loading: boolean;
  onScraperToggle: (scraper: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onRun: () => void;
}

export const LinkScraperTab: React.FC<LinkScraperTabProps> = ({
  scraperNames,
  selectedScrapers,
  loading,
  onScraperToggle,
  onSelectAll,
  onClearAll,
  onRun
}) => {
  const getScraperIcon = (scraperName: string) => {
    // Return different colors/styles based on scraper name
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-green-500', 
      'from-purple-500 to-violet-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500'
    ];
    const index = scraperNames.indexOf(scraperName) % colors.length;
    return colors[index];
  };

  const formatScraperName = (name: string) => {
    return name.replace('.com', '').replace(/[-_]/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-xl sm:rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
              Link Discovery Engine
            </h2>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
              Intelligent web scraping to discover fresh article URLs across multiple sources
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Sources</p>
                <p className="text-lg sm:text-xl font-bold text-blue-800">{scraperNames.length}</p>
              </div>
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600">Selected</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-800">{selectedScrapers.length}</p>
              </div>
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Ready</p>
                <p className="text-lg sm:text-xl font-bold text-purple-800">{selectedScrapers.length > 0 ? 'Yes' : 'No'}</p>
              </div>
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600">Status</p>
                <p className="text-lg sm:text-xl font-bold text-orange-800">{loading ? 'Running' : 'Idle'}</p>
              </div>
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        {/* Scraper Selection */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2">
                Select News Sources
              </label>
              <p className="text-xs sm:text-sm text-gray-600">
                Choose which news sources to scrape for article links. Each source has unique content and update patterns.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={onSelectAll}
                className="group inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-emerald-300 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline">Select All</span>
                <span className="sm:hidden">All</span>
              </button>
              
              <button
                onClick={onClearAll}
                className="group inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-gray-700 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
              >
                <Circle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>
          </div>
          
          {/* Responsive Scraper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {scraperNames.map((scraper, index) => {
              const isSelected = selectedScrapers.includes(scraper);
              const gradientColor = getScraperIcon(scraper);
              
              return (
                <label 
                  key={scraper} 
                  className={`group relative flex items-center p-3 sm:p-4 lg:p-5 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected 
                      ? `bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 shadow-lg shadow-blue-100/50 transform scale-105`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/50'
                  }`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Selection Indicator */}
                  <div className="relative flex items-center space-x-3 sm:space-x-4 w-full">
                    {/* Custom Checkbox */}
                    <div className={`relative w-4 h-4 sm:w-5 sm:h-5 rounded border-2 sm:rounded-lg transition-all duration-300 flex-shrink-0 ${
                      isSelected 
                        ? `bg-gradient-to-br ${gradientColor} border-transparent shadow-lg`
                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onScraperToggle(scraper)}
                        className="sr-only"
                      />
                      {isSelected && (
                        <CheckCircle className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 text-white animate-scale-in" />
                      )}
                    </div>
                    
                    {/* Scraper Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Icon */}
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                          isSelected 
                            ? `bg-gradient-to-br ${gradientColor} shadow-lg`
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Globe className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-300 ${
                            isSelected ? 'text-white' : 'text-gray-600 group-hover:text-gray-700'
                          }`} />
                        </div>
                        
                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-semibold truncate transition-colors duration-300 ${
                            isSelected ? 'text-blue-800' : 'text-gray-900 group-hover:text-gray-800'
                          }`}>
                            {formatScraperName(scraper)}
                          </p>
                          <p className={`text-xs truncate transition-colors duration-300 hidden sm:block ${
                            isSelected ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                          }`}>
                            {scraper}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                      isSelected 
                        ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' 
                        : 'bg-gray-300 group-hover:bg-gray-400'
                    }`}></div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  {isSelected && (
                    <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientColor} opacity-10 blur-sm`}></div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200/50">
          <div className="flex flex-col sm:flex-row sm:items-start lg:items-center lg:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Info Section */}
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Ready to Launch</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                {selectedScrapers.length > 0 
                  ? `${selectedScrapers.length} source${selectedScrapers.length > 1 ? 's' : ''} selected. Click "Start Discovery" to begin scraping for new article links.`
                  : 'Select at least one news source to begin the link discovery process.'
                }
              </p>
              
              {/* Selected Sources Preview */}
              {selectedScrapers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedScrapers.slice(0, 3).map((scraper, index) => (
                    <span 
                      key={scraper}
                      className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getScraperIcon(scraper)} text-white shadow-sm`}
                    >
                      {formatScraperName(scraper)}
                    </span>
                  ))}
                  {selectedScrapers.length > 3 && (
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                      +{selectedScrapers.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <div className="flex-shrink-0">
              <button
                onClick={onRun}
                disabled={loading || selectedScrapers.length === 0}
                className={`group relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl ${
                  loading 
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse'
                    : selectedScrapers.length > 0
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/25 hover:shadow-blue-500/40'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-3 animate-spin" />
                    <span className="hidden sm:inline ml-3">Discovering Links...</span>
                    <span className="sm:hidden ml-2">Discovering...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="hidden sm:inline ml-3">Start Discovery</span>
                    <span className="sm:hidden ml-2">Start</span>
                  </>
                )}
                
                {/* Button Glow Effect */}
                {!loading && selectedScrapers.length > 0 && (
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};