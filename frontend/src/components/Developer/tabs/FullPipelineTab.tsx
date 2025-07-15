import React from 'react';
import { Zap, RefreshCw, Sparkles, Shield, Globe, Database, Brain, CheckCircle, AlertCircle, Settings, Play, Cpu } from 'lucide-react';

interface FullPipelineTabProps {
  scraperNames: string[];
  selectedScrapers: string[];
  availableModels: Record<string, string[]>;
  selectedModelType: 'openai' | 'groq';
  selectedModel: string;
  loading: boolean;
  onScraperToggle: (scraper: string) => void;
  onModelTypeChange: (type: 'openai' | 'groq') => void;
  onModelChange: (model: string) => void;
  onRun: () => void;
}

export const FullPipelineTab: React.FC<FullPipelineTabProps> = ({
  scraperNames,
  selectedScrapers,
  availableModels,
  selectedModelType,
  selectedModel,
  loading,
  onScraperToggle,
  onModelTypeChange,
  onModelChange,
  onRun
}) => {
  const getProviderColor = (provider: string) => {
    return provider === 'openai' 
      ? 'from-emerald-500 to-green-500' 
      : 'from-orange-500 to-red-500';
  };

  const getProviderBg = (provider: string) => {
    return provider === 'openai' 
      ? 'from-emerald-50 to-green-50 border-emerald-200/50' 
      : 'from-orange-50 to-red-50 border-orange-200/50';
  };

  const getScraperIcon = (scraperName: string) => {
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
    <div className="p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 w-12 h-12 bg-yellow-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-yellow-800 to-amber-700 bg-clip-text text-transparent">
              Complete Intelligence Pipeline
            </h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              End-to-end automated workflow: Link discovery → Content extraction → Vector embeddings → AI analysis
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600">Sources</p>
                <p className="text-xl font-bold text-yellow-800">{selectedScrapers.length}/{scraperNames.length}</p>
              </div>
              <Globe className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          
          <div className={`bg-gradient-to-br ${getProviderBg(selectedModelType)} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">AI Provider</p>
                <p className="text-xl font-bold text-gray-800 capitalize">{selectedModelType}</p>
              </div>
              <Brain className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Status</p>
                <p className="text-xl font-bold text-purple-800">{loading ? 'Running' : 'Ready'}</p>
              </div>
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600">Mode</p>
                <p className="text-xl font-bold text-emerald-800">Full Auto</p>
              </div>
              <Shield className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Pipeline Overview */}
        <div className="bg-gradient-to-br from-white to-yellow-50/30 rounded-2xl border border-yellow-200/50 p-6 lg:p-8 shadow-lg">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Complete Workflow Pipeline
            </h3>
            <p className="text-gray-600 text-sm lg:text-base">
              This comprehensive pipeline executes all stages sequentially: discovers article links, extracts content, 
              generates embeddings, and performs AI analysis. Perfect for complete data processing workflows.
            </p>
          </div>

          {/* Pipeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">1. Link Discovery</h4>
                <p className="text-xs text-gray-600">Scan news sources for article URLs</p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  {selectedScrapers.length} sources selected
                </div>
              </div>
              {/* Connector */}
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-yellow-300 to-amber-300"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mb-3">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">2. Content Extraction</h4>
                <p className="text-xs text-gray-600">Extract and clean article content</p>
                <div className="mt-2 text-xs text-emerald-600 font-medium">
                  Smart parsing enabled
                </div>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-yellow-300 to-amber-300"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-3">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">3. Vector Embeddings</h4>
                <p className="text-xs text-gray-600">Generate semantic vectors</p>
                <div className="mt-2 text-xs text-purple-600 font-medium">
                  OpenAI embeddings
                </div>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-yellow-300 to-amber-300"></div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">4. AI Analysis</h4>
                <p className="text-xs text-gray-600">Extract entities and sentiment</p>
                <div className="mt-2 text-xs text-orange-600 font-medium">
                  {selectedModelType} • {selectedModel}
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-yellow-200/30">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Automated Workflow</p>
                <p className="text-xs text-gray-600">End-to-end processing</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-yellow-200/30">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Error Recovery</p>
                <p className="text-xs text-gray-600">Robust failure handling</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-yellow-200/30">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Quality Assurance</p>
                <p className="text-xs text-gray-600">Data validation at each step</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scraper Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                News Sources
              </h3>
              <span className="text-sm text-gray-500">
                {selectedScrapers.length} of {scraperNames.length} selected
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {scraperNames.map((scraper) => {
                const isSelected = selectedScrapers.includes(scraper);
                const gradientColor = getScraperIcon(scraper);
                
                return (
                  <label 
                    key={scraper} 
                    className={`group flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-102 ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onScraperToggle(scraper)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                        isSelected
                          ? `bg-gradient-to-br ${gradientColor} border-transparent`
                          : 'border-gray-300 group-hover:border-blue-300'
                      }`}>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <span className={`text-sm font-medium transition-colors duration-200 ${
                          isSelected ? 'text-blue-800' : 'text-gray-700 group-hover:text-blue-700'
                        }`}>
                          {formatScraperName(scraper)}
                        </span>
                        <p className="text-xs text-gray-500">{scraper}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Model Configuration */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-orange-600" />
              AI Configuration
            </h3>
            
            <div className="space-y-4">
              {/* Model Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(availableModels).map((provider) => (
                    <label 
                      key={provider}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedModelType === provider
                          ? `bg-gradient-to-br ${getProviderBg(provider)} border-orange-300`
                          : 'bg-white border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modelProvider"
                        value={provider}
                        checked={selectedModelType === provider}
                        onChange={(e) => onModelTypeChange(e.target.value as 'openai' | 'groq')}
                        className="sr-only"
                      />
                      
                      <div className="flex items-center space-x-2 w-full">
                        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                          selectedModelType === provider
                            ? `bg-gradient-to-br ${getProviderColor(provider)} border-transparent`
                            : 'border-gray-300'
                        }`}>
                          {selectedModelType === provider && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium capitalize">{provider}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specific Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                >
                  {availableModels[selectedModelType]?.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-gradient-to-br from-gray-50 to-yellow-50 rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Info Section */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Ready to Launch Full Pipeline</h3>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm lg:text-base leading-relaxed">
                Execute the complete intelligence pipeline with {selectedScrapers.length} news sources 
                and {selectedModelType} AI analysis. This will run all stages sequentially: link discovery, 
                content extraction, embedding generation, and entity analysis.
              </p>
              
              {/* Configuration Summary */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-yellow-200/50">
                  <Globe className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {selectedScrapers.length} sources
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-orange-200/50">
                  <Brain className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {selectedModelType} • {selectedModel}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-emerald-200/50">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-medium text-gray-700">
                    Full automation enabled
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex-shrink-0">
              <button
                onClick={onRun}
                disabled={loading || selectedScrapers.length === 0}
                className={`group relative inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl ${
                  loading 
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-400 animate-pulse'
                    : selectedScrapers.length > 0
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 shadow-yellow-500/25 hover:shadow-yellow-500/40'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                    Running Pipeline...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    Launch Full Pipeline
                  </>
                )}
                
                {/* Button Glow Effect */}
                {!loading && selectedScrapers.length > 0 && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                )}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="mt-6 pt-6 border-t border-yellow-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing Pipeline</span>
                <span className="text-sm text-gray-500">In Progress...</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Benefits */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
            Pipeline Benefits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Automation Advantages</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  <span>Complete end-to-end automation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  <span>Consistent data processing workflow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  <span>Reduced manual intervention</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  <span>Optimized resource utilization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  <span>Comprehensive error handling</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quality & Performance</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Data validation at each stage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Cost tracking and optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Real-time progress monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Scalable processing architecture</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Comprehensive logging and analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};