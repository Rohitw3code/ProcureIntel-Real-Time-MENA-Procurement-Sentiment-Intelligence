import React from 'react';
import { FileText, Download, RefreshCw, Sparkles, Zap, Shield, Globe, Clock, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

interface ArticleScraperTabProps {
  loading: boolean;
  onRun: () => void;
}

export const ArticleScraperTab: React.FC<ArticleScraperTabProps> = ({
  loading,
  onRun
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-400 rounded-xl sm:rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-green-700 bg-clip-text text-transparent">
              Article Content Extractor
            </h2>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
              Intelligent content extraction from discovered article URLs with advanced parsing
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600">Mode</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-800">Smart</p>
              </div>
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Quality</p>
                <p className="text-lg sm:text-xl font-bold text-blue-800">High</p>
              </div>
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Status</p>
                <p className="text-lg sm:text-xl font-bold text-purple-800">{loading ? 'Active' : 'Ready'}</p>
              </div>
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600">Perf</p>
                <p className="text-lg sm:text-xl font-bold text-orange-800">Optimal</p>
              </div>
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Process Overview */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl border border-emerald-200/50 p-6 lg:p-8 shadow-lg">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-emerald-600" />
              Content Extraction Process
            </h3>
            <p className="text-gray-600 text-sm lg:text-base">
              Our advanced scraper processes pending article links to extract clean, structured content including titles, authors, publication dates, and article text.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">1. URL Fetching</h4>
                <p className="text-xs text-gray-600">Retrieve pending article links from the database</p>
              </div>
              {/* Connector */}
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-emerald-300 to-green-300"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mb-3">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">2. Content Download</h4>
                <p className="text-xs text-gray-600">Fetch HTML content with smart retry logic</p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-emerald-300 to-green-300"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">3. Data Parsing</h4>
                <p className="text-xs text-gray-600">Extract structured data using AI-powered parsing</p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-emerald-300 to-green-300"></div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">4. Data Storage</h4>
                <p className="text-xs text-gray-600">Store clean content ready for analysis</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-emerald-200/30">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Real-time Processing</p>
                <p className="text-xs text-gray-600">Instant content extraction</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-emerald-200/30">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Error Handling</p>
                <p className="text-xs text-gray-600">Robust failure recovery</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-emerald-200/30">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Smart Parsing</p>
                <p className="text-xs text-gray-600">AI-powered content extraction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-start lg:items-center lg:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Info Section */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900">Ready to Extract Content</h3>
              </div>
              
              <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base leading-relaxed">
                The article scraper will process all pending article links found by the link discovery engine. 
                It extracts clean, structured content including titles, authors, publication dates, and article text 
                using advanced parsing algorithms.
              </p>
              
              {/* Status Indicators */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-md sm:rounded-lg border border-emerald-200/50">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${loading ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {loading ? 'Processing Articles' : 'Ready to Process'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-md sm:rounded-lg border border-blue-200/50">
                  <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Error Recovery</span>
                </div>
                
                <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-md sm:rounded-lg border border-purple-200/50">
                  <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">AI Parsing</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex-shrink-0">
              <button
                onClick={onRun}
                disabled={loading}
                className={`group relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl ${
                  loading 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-3 animate-spin" />
                    <span className="hidden sm:inline ml-3">Extracting Content...</span>
                    <span className="sm:hidden ml-2">Extracting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="hidden sm:inline ml-3">Start Content Extraction</span>
                    <span className="sm:hidden ml-2">Start</span>
                  </>
                )}
                
                {/* Button Glow Effect */}
                {!loading && (
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                )}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-emerald-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Processing Articles</span>
                <span className="text-xs sm:text-sm text-gray-500">In Progress...</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
            Technical Specifications
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Extraction Capabilities</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Article titles and headlines</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Author information and bylines</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Publication dates and timestamps</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Clean article text content</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Metadata and structured data</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quality Assurance</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Content validation and cleaning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Duplicate detection and removal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Error handling and retry logic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Rate limiting and respectful scraping</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Data integrity verification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};