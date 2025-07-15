import React from 'react';
import { Brain, Cpu, RefreshCw, Sparkles, Zap, Shield, Bot, Clock, BarChart3, CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface AnalysisTabProps {
  availableModels: Record<string, string[]>;
  selectedModelType: 'openai' | 'groq';
  selectedModel: string;
  loading: boolean;
  onModelTypeChange: (type: 'openai' | 'groq') => void;
  onModelChange: (model: string) => void;
  onRun: () => void;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  availableModels,
  selectedModelType,
  selectedModel,
  loading,
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

  return (
    <div className="p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 w-12 h-12 bg-orange-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-700 bg-clip-text text-transparent">
              AI Entity Analysis Engine
            </h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Advanced AI-powered extraction of companies, sentiments, risks, and procurement intelligence
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`bg-gradient-to-br ${getProviderBg(selectedModelType)} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Provider</p>
                <p className="text-xl font-bold text-gray-800 capitalize">{selectedModelType}</p>
              </div>
              <Bot className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Model</p>
                <p className="text-xl font-bold text-blue-800 truncate">{selectedModel}</p>
              </div>
              <Cpu className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Status</p>
                <p className="text-xl font-bold text-purple-800">{loading ? 'Analyzing' : 'Ready'}</p>
              </div>
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600">Quality</p>
                <p className="text-xl font-bold text-emerald-800">Premium</p>
              </div>
              <Shield className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Model Configuration */}
        <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl border border-orange-200/50 p-6 lg:p-8 shadow-lg">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-orange-600" />
              AI Model Configuration
            </h3>
            <p className="text-gray-600 text-sm lg:text-base">
              Choose your preferred AI provider and model for entity extraction and sentiment analysis. 
              Different models offer varying capabilities, speed, and cost characteristics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Model Provider Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                AI Provider
              </label>
              <div className="space-y-3">
                {Object.keys(availableModels).map((provider) => (
                  <label 
                    key={provider}
                    className={`group relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedModelType === provider
                        ? `bg-gradient-to-br ${getProviderBg(provider)} border-orange-300 shadow-lg shadow-orange-100/50 transform scale-105`
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/50'
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
                    
                    <div className="flex items-center space-x-4 w-full">
                      {/* Custom Radio */}
                      <div className={`relative w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                        selectedModelType === provider
                          ? `bg-gradient-to-br ${getProviderColor(provider)} border-transparent shadow-lg`
                          : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }`}>
                        {selectedModelType === provider && (
                          <CheckCircle className="absolute inset-0 w-5 h-5 text-white animate-scale-in" />
                        )}
                      </div>
                      
                      {/* Provider Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            selectedModelType === provider
                              ? `bg-gradient-to-br ${getProviderColor(provider)} shadow-lg`
                              : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            <Bot className={`h-4 w-4 transition-colors duration-300 ${
                              selectedModelType === provider ? 'text-white' : 'text-gray-600 group-hover:text-gray-700'
                            }`} />
                          </div>
                          
                          <div>
                            <p className={`font-semibold capitalize transition-colors duration-300 ${
                              selectedModelType === provider ? 'text-orange-800' : 'text-gray-900 group-hover:text-gray-800'
                            }`}>
                              {provider}
                            </p>
                            <p className={`text-xs transition-colors duration-300 ${
                              selectedModelType === provider ? 'text-orange-600' : 'text-gray-500 group-hover:text-gray-600'
                            }`}>
                              {provider === 'openai' ? 'Premium AI models' : 'Fast & efficient models'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        selectedModelType === provider
                          ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50'
                          : 'bg-gray-300 group-hover:bg-gray-400'
                      }`}></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Specific Model
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableModels[selectedModelType]?.map((model) => (
                  <label 
                    key={model}
                    className={`group flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-102 ${
                      selectedModel === model
                        ? 'bg-orange-50 border-orange-300 shadow-md'
                        : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="specificModel"
                      value={model}
                      checked={selectedModel === model}
                      onChange={(e) => onModelChange(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        selectedModel === model
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-300 group-hover:border-orange-300'
                      }`}>
                        {selectedModel === model && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <span className={`text-sm font-medium transition-colors duration-200 ${
                          selectedModel === model ? 'text-orange-800' : 'text-gray-700 group-hover:text-orange-700'
                        }`}>
                          {model}
                        </span>
                      </div>
                      
                      {selectedModel === model && (
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200/30">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Entity Extraction</p>
                <p className="text-xs text-gray-600">Companies, countries, commodities</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200/30">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sentiment Analysis</p>
                <p className="text-xs text-gray-600">Positive, negative, neutral</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200/30">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Risk Assessment</p>
                <p className="text-xs text-gray-600">Financial, compliance, reputation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Info Section */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Ready to Analyze Content</h3>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm lg:text-base leading-relaxed">
                The AI analysis engine will process all articles with pending analysis status using the selected 
                {' '}<span className="font-semibold text-orange-700">{selectedModelType}</span> model 
                {' '}<span className="font-mono text-sm bg-orange-100 px-2 py-1 rounded">{selectedModel}</span>. 
                It extracts entities, analyzes sentiment, and identifies risks with high accuracy.
              </p>
              
              {/* Status Indicators */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-orange-200/50">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs font-medium text-gray-700">
                    {loading ? 'Analyzing Articles' : 'Ready to Process'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                  <Bot className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">{selectedModelType} • {selectedModel}</span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-emerald-200/50">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-medium text-gray-700">Cost Tracking Active</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex-shrink-0">
              <button
                onClick={onRun}
                disabled={loading}
                className={`group relative inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl ${
                  loading 
                    ? 'bg-gradient-to-r from-orange-400 to-red-400 animate-pulse'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-orange-500/25 hover:shadow-orange-500/40'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Cpu className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    Start Analysis
                  </>
                )}
                
                {/* Button Glow Effect */}
                {!loading && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                )}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="mt-6 pt-6 border-t border-orange-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing Articles</span>
                <span className="text-sm text-gray-500">In Progress...</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
            Analysis Capabilities
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Entity Extraction</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Company names and organizations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Countries and geographical regions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Commodities and industry sectors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Contract values and deadlines</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span>Tender and procurement details</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Intelligence Analysis</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Sentiment classification (Positive/Negative/Neutral)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Risk assessment and categorization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Contextual reasoning and explanations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Multi-language content support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Real-time processing and updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};