import React from 'react';
import { Globe, FileText, Database, Brain, Zap, BarChart3, Sparkles } from 'lucide-react';

export type TabType = 'link-scraper' | 'article-scraper' | 'embeddings' | 'analysis' | 'full-pipeline' | 'monitoring';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'link-scraper', 
      label: 'Link Scraper', 
      icon: Globe,
      description: 'Discover article URLs',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'article-scraper', 
      label: 'Article Scraper', 
      icon: FileText,
      description: 'Extract content',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200'
    },
    { 
      id: 'embeddings', 
      label: 'Embeddings', 
      icon: Database,
      description: 'Generate vectors',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200'
    },
    { 
      id: 'analysis', 
      label: 'Analysis', 
      icon: Brain,
      description: 'AI processing',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    { 
      id: 'full-pipeline', 
      label: 'Full Pipeline', 
      icon: Zap,
      description: 'Complete workflow',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200'
    },
    { 
      id: 'monitoring', 
      label: 'Monitoring', 
      icon: BarChart3,
      description: 'Track performance',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-200'
    },
  ];

  return (
    <div className="mb-8">
      {/* Mobile Dropdown */}
      <div className="md:hidden mb-4 sm:mb-6">
        <label htmlFor="tab-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Tab
        </label>
        <select
          id="tab-select"
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as TabType)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label} - {tab.description}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-1.5 sm:p-2 backdrop-blur-sm">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as TabType)}
                  className={`group relative flex-shrink-0 flex flex-col items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? `bg-gradient-to-br ${tab.bgColor} border ${tab.borderColor} text-gray-800 shadow-lg transform scale-105`
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Background Glow Effect for Active Tab */}
                  {isActive && (
                    <div className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br ${tab.color} opacity-10 blur-sm`}></div>
                  )}
                  
                  {/* Icon Container */}
                  <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-br ${tab.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                  }`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    
                    {/* Sparkle Effect for Active Tab */}
                    {isActive && (
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full flex items-center justify-center">
                        <Sparkles className="h-2 w-2 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`font-semibold transition-colors duration-300 text-center leading-tight ${
                    isActive ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-800'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {/* Description */}
                  <span className={`text-xs mt-0.5 sm:mt-1 transition-colors duration-300 text-center leading-tight hidden sm:block ${
                    isActive ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {tab.description}
                  </span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className={`absolute -bottom-0.5 sm:-bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r ${tab.color} rounded-full shadow-lg`}></div>
                  )}
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Description Bar */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-full border border-gray-200/50 shadow-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-700 font-medium">
              {tabs.find(tab => tab.id === activeTab)?.description || 'Select a tab to get started'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Pills */}
      <div className="md:hidden">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as TabType)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};