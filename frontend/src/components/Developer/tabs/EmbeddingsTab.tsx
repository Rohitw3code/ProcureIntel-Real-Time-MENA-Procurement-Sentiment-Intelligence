import React from 'react';
import { Database, Upload, RefreshCw, Sparkles, Zap, Shield, Cpu, Clock, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

interface EmbeddingsTabProps {
  loading: boolean;
  onRun: () => void;
}

export const EmbeddingsTab: React.FC<EmbeddingsTabProps> = ({
  loading,
  onRun
}) => {
  return (
    <div className="p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 w-12 h-12 bg-purple-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-violet-700 bg-clip-text text-transparent">
              Vector Embeddings Engine
            </h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Transform article content into high-dimensional vectors for semantic search and AI analysis
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Model Type</p>
                <p className="text-xl font-bold text-purple-800">OpenAI</p>
              </div>
              <Database className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Dimensions</p>
                <p className="text-xl font-bold text-blue-800">1536</p>
              </div>
              <Cpu className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600">Status</p>
                <p className="text-xl font-bold text-emerald-800">{loading ? 'Processing' : 'Ready'}</p>
              </div>
              <Zap className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600">Quality</p>
                <p className="text-xl font-bold text-orange-800">Premium</p>
              </div>
              <Shield className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Process Overview */}
        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-200/50 p-6 lg:p-8 shadow-lg">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Cpu className="h-5 w-5 mr-2 text-purple-600" />
              Vector Embedding Process
            </h3>
            <p className="text-gray-600 text-sm lg:text-base">
              Our advanced embedding system converts cleaned article text into high-dimensional vectors using OpenAI's text-embedding-3-small model, 
              enabling semantic search, similarity matching, and AI-powered content analysis.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">1. Data Retrieval</h4>
                <p className="text-xs text-gray-600">Fetch cleaned article content from database</p>
              </div>
              {/* Connector */}
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-purple-300 to-violet-300"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-3">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">2. AI Processing</h4>
                <p className="text-xs text-gray-600">Generate embeddings using OpenAI models</p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-purple-300 to-violet-300"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">3. Vector Storage</h4>
                <p className="text-xs text-gray-600">Store vectors in optimized database</p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-purple-300 to-violet-300"></div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">4. Index Creation</h4>
                <p className="text-xs text-gray-600">Build search indexes for fast retrieval</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-200/30">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">High Performance</p>
                <p className="text-xs text-gray-600">Optimized vector operations</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-200/30">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Semantic Search</p>
                <p className="text-xs text-gray-600">Meaning-based content matching</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-200/30">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Cost Tracking</p>
                <p className="text-xs text-gray-600">Monitor API usage and costs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 lg:p-8 border border-gray-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Info Section */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Ready to Generate Embeddings</h3>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm lg:text-base leading-relaxed">
                The embedding generator will process all scraped articles with pending embedding status. 
                It converts cleaned text content into 1536-dimensional vectors using OpenAI's advanced 
                text-embedding-3-small model, enabling powerful semantic search capabilities.
              </p>
              
              {/* Status Indicators */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200/50">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-purple-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs font-medium text-gray-700">
                    {loading ? 'Generating Embeddings' : 'Ready to Process'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                  <Cpu className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">OpenAI text-embedding-3-small</span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-emerald-200/50">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-medium text-gray-700">Cost Monitoring Enabled</span>
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
                    ? 'bg-gradient-to-r from-purple-400 to-violet-400 animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-purple-500/25 hover:shadow-purple-500/40'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                    Generating Embeddings...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    Generate Embeddings
                  </>
                )}
                
                {/* Button Glow Effect */}
                {!loading && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                )}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="mt-6 pt-6 border-t border-purple-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing Articles</span>
                <span className="text-sm text-gray-500">In Progress...</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-purple-600" />
            Technical Specifications
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Embedding Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>1536-dimensional vectors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>OpenAI text-embedding-3-small model</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>Semantic similarity search</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>Cosine distance optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>Batch processing support</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Performance & Monitoring</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Real-time cost tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Processing speed optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Error handling and retry logic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Vector index management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Quality assurance checks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};