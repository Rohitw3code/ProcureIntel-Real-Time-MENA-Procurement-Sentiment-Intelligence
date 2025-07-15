import React from 'react';
import { Code, RefreshCw, Square, Activity, Clock, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { GlobalStatusResponse } from '../../services/dev_api';

interface DeveloperHeaderProps {
  globalStatus: GlobalStatusResponse | null;
  onRefresh: () => void;
  onStop: () => void;
  loading: boolean;
}

export const DeveloperHeader: React.FC<DeveloperHeaderProps> = ({
  globalStatus,
  onRefresh,
  onStop,
  loading
}) => {
  return (
    <>
      {/* Enhanced Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-b border-slate-700/50 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse`}></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Left Section - Title and Description */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Code className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-400 rounded-xl sm:rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              </div>
              
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                  Developer Portal
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-blue-200/80 mt-1 font-medium">
                  Advanced pipeline management & real-time monitoring
                </p>
                <div className="flex items-center space-x-2 mt-1 sm:mt-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-emerald-300 font-medium">System Online</span>
                </div>
              </div>
            </div>

            {/* Right Section - Quick Actions */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4 text-xs sm:text-sm text-blue-200/70">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="hidden lg:inline">Production Ready</span>
                  <span className="lg:hidden">Ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="hidden lg:inline">AI Powered</span>
                  <span className="lg:hidden">AI</span>
                </div>
              </div>
              
              <button
                onClick={onRefresh}
                className="group relative inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">Refresh</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Global Status Bar */}
      {globalStatus && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl border border-gray-200/50 p-3 sm:p-4 lg:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Status Information */}
                <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-3 sm:space-x-6">
                  {/* Status Badge */}
                  <div className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    globalStatus.is_running 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200 shadow-blue-100/50 shadow-lg'
                      : globalStatus.current_stage === 'Stopping...'
                      ? 'bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-800 border-orange-200 shadow-orange-100/50 shadow-lg'
                      : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200 shadow-gray-100/50 shadow-lg'
                  }`}>
                    {globalStatus.is_running ? (
                      <Activity className="h-4 w-4 mr-2 animate-pulse" />
                    ) : globalStatus.current_stage === 'Stopping...' ? (
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-600 animate-bounce" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-bold">{globalStatus.current_stage}</span>
                  </div>
                  
                  {/* Status Message */}
                  <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-3">
                    <div className="text-xs sm:text-sm text-gray-700 font-medium bg-white/60 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-200/50 break-words">
                      {globalStatus.details.message}
                    </div>
                    
                    {/* Progress Indicator */}
                    {globalStatus.is_running && globalStatus.total > 0 && (
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2 overflow-hidden flex-shrink-0">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(globalStatus.progress / globalStatus.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono text-gray-600 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border whitespace-nowrap">
                          {globalStatus.progress}/{globalStatus.total}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                  {/* Performance Metrics */}
                  {globalStatus.is_running && (
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="hidden lg:inline">Processing</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="hidden lg:inline">Real-time</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Stop Button */}
                  {(globalStatus.is_running || globalStatus.current_stage === 'Stopping...') && (
                    <button
                      onClick={onStop}
                      disabled={loading}
                      className={`group relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 ${
                        globalStatus.current_stage === 'Stopping...' 
                          ? 'border-orange-300 text-orange-700 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 focus:ring-orange-500 shadow-orange-100/50 shadow-lg'
                          : 'border-red-300 text-red-700 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 focus:ring-red-500 shadow-red-100/50 shadow-lg'
                      }`}
                    >
                      {globalStatus.current_stage === 'Stopping...' ? (
                        <>
                          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">Stopping...</span>
                          <span className="sm:hidden">Stop</span>
                        </>
                      ) : (
                        <>
                          <Square className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="hidden sm:inline">Stop Pipeline</span>
                          <span className="sm:hidden">Stop</span>
                        </>
                      )}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  )}
                  
                  {/* Refresh Button */}
                  <button
                    onClick={onRefresh}
                    className="group relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-gray-700 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="hidden sm:inline">Refresh</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};