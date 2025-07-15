import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Code, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Settings,
  Database,
  Search,
  BarChart3,
  Link,
  FileText,
  Brain,
  Zap,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { devApi, PipelineStatus, PipelineRunStatus } from '../../services/dev_api';

interface DeveloperPageProps {
  onBack: () => void;
}

type TabType = 'link-scraper' | 'article-scraper' | 'analysis' | 'embeddings' | 'full-pipeline';

export const DeveloperPage: React.FC<DeveloperPageProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [activeTab, setActiveTab] = useState<TabType>('link-scraper');
  const [availableScrapers, setAvailableScrapers] = useState<string[]>([]);
  const [selectedScrapers, setSelectedScrapers] = useState<string[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [pipelineRunStatus, setPipelineRunStatus] = useState<PipelineRunStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPipelineId, setCurrentPipelineId] = useState<number | null>(null);
  const [modelType, setModelType] = useState('openai');
  const [modelName, setModelName] = useState('gpt-4o');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dev123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password');
      setPassword('');
    }
  };

  // If not authenticated, show password form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Developer Access
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Enter password to access developer tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Protected Area</h2>
              <p className="text-gray-600">This section requires developer access</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-12"
                    placeholder="Enter developer password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Access Developer Portal
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Auto-refresh status every 3 seconds when pipeline is running
  useEffect(() => {
    const interval = setInterval(() => {
      if (pipelineStatus?.is_running || currentPipelineId) {
        fetchPipelineStatus();
        if (currentPipelineId) {
          fetchPipelineRunStatus(currentPipelineId);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pipelineStatus?.is_running, currentPipelineId]);

  useEffect(() => {
    fetchAvailableScrapers();
    fetchPipelineStatus();
  }, []);

  const fetchAvailableScrapers = async () => {
    try {
      const scrapers = await devApi.getAvailableScrapers();
      setAvailableScrapers(scrapers);
      // Select all scrapers by default
      setSelectedScrapers(scrapers);
    } catch (err) {
      setError('Failed to fetch available scrapers');
    }
  };

  const fetchPipelineStatus = async () => {
    try {
      const status = await devApi.getPipelineStatus();
      setPipelineStatus(status);
    } catch (err) {
      console.error('Failed to fetch pipeline status:', err);
    }
  };

  const fetchPipelineRunStatus = async (pipelineId: number) => {
    try {
      const status = await devApi.getPipelineRunStatus(pipelineId);
      setPipelineRunStatus(status);
    } catch (err) {
      console.error('Failed to fetch pipeline run status:', err);
    }
  };

  const handleScraperToggle = (scraper: string) => {
    setSelectedScrapers(prev => 
      prev.includes(scraper) 
        ? prev.filter(s => s !== scraper)
        : [...prev, scraper]
    );
  };

  const runLinkScraper = async () => {
    if (selectedScrapers.length === 0) {
      setError('Please select at least one scraper');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runLinkScraper(selectedScrapers);
      setSuccess(response.message);
      setCurrentPipelineId(response.pipeline_id);
      fetchPipelineStatus();
      fetchPipelineRunStatus(response.pipeline_id);
    } catch (err) {
      setError('Failed to start link scraper');
    } finally {
      setLoading(false);
    }
  };

  const runArticleScraper = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runArticleScraper();
      setSuccess(response.message);
      setCurrentPipelineId(response.pipeline_id);
      fetchPipelineStatus();
      fetchPipelineRunStatus(response.pipeline_id);
    } catch (err) {
      setError('Failed to start article scraper');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runAnalysis(modelType, modelName);
      setSuccess(response.message);
      setCurrentPipelineId(response.pipeline_id);
      fetchPipelineStatus();
      fetchPipelineRunStatus(response.pipeline_id);
    } catch (err) {
      setError('Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  const runEmbeddings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runEmbeddings();
      setSuccess(response.message);
      setCurrentPipelineId(response.pipeline_id);
      fetchPipelineStatus();
      fetchPipelineRunStatus(response.pipeline_id);
    } catch (err) {
      setError('Failed to start embeddings generation');
    } finally {
      setLoading(false);
    }
  };

  const runFullPipeline = async () => {
    if (selectedScrapers.length === 0) {
      setError('Please select at least one scraper');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runFullPipeline(selectedScrapers, modelType, modelName);
      setSuccess(response.message);
      setCurrentPipelineId(response.pipeline_id);
      fetchPipelineStatus();
      fetchPipelineRunStatus(response.pipeline_id);
    } catch (err) {
      setError('Failed to start full pipeline');
    } finally {
      setLoading(false);
    }
  };

  const stopPipeline = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await devApi.stopPipeline();
      setSuccess(response.message);
      fetchPipelineStatus();
    } catch (err) {
      setError('Failed to stop pipeline');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'RUNNING':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'STOPPED':
        return <Square className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'link-scraper', label: 'Link Scraper', icon: Link },
    { id: 'article-scraper', label: 'Article Scraper', icon: FileText },
    { id: 'analysis', label: 'Analysis', icon: Brain },
    { id: 'embeddings', label: 'Embeddings', icon: Zap },
    { id: 'full-pipeline', label: 'Full Pipeline', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Code className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Developer Portal
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Pipeline management and development tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Pipeline Status Overview */}
        {pipelineStatus && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pipeline Status</h2>
              <button
                onClick={fetchPipelineStatus}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {pipelineStatus.is_running ? (
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {pipelineStatus.is_running ? 'Running' : 'Idle'}
                </p>
                <p className="text-xs text-gray-500">{pipelineStatus.current_stage}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {pipelineStatus.progress} / {pipelineStatus.total}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: pipelineStatus.total > 0 
                        ? `${(pipelineStatus.progress / pipelineStatus.total) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Pipeline ID</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {pipelineStatus.current_pipeline_id || 'None'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Last Update</span>
                </div>
                <p className="text-sm text-gray-900">
                  {new Date(pipelineStatus.last_update).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{pipelineStatus.details.message}</p>
            </div>

            {pipelineStatus.is_running && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={stopPipeline}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Pipeline
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pipeline Run Details */}
        {pipelineRunStatus && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pipeline Run #{pipelineRunStatus.id}
              </h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(pipelineRunStatus.status)}
                <span className="text-sm font-medium text-gray-700">
                  {pipelineRunStatus.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Links Found</p>
                <p className="text-lg font-bold text-emerald-600">{pipelineRunStatus.new_links_found}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Articles Scraped</p>
                <p className="text-lg font-bold text-blue-600">{pipelineRunStatus.articles_scraped}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Articles Embedded</p>
                <p className="text-lg font-bold text-purple-600">{pipelineRunStatus.articles_embedded}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Articles Analyzed</p>
                <p className="text-lg font-bold text-orange-600">{pipelineRunStatus.articles_analyzed}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Total Cost</p>
                <p className="text-lg font-bold text-red-600">${(pipelineRunStatus.total_cost ?? 0).toFixed(4)}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Duration</p>
                <p className="text-sm font-medium text-gray-900">
                  {pipelineRunStatus.end_time ? (
                    `${Math.round((new Date(pipelineRunStatus.end_time).getTime() - new Date(pipelineRunStatus.start_time).getTime()) / 1000)}s`
                  ) : (
                    'Running...'
                  )}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Started:</strong> {formatDate(pipelineRunStatus.start_time)}</p>
              {pipelineRunStatus.end_time && (
                <p><strong>Ended:</strong> {formatDate(pipelineRunStatus.end_time)}</p>
              )}
              <p><strong>Details:</strong> {pipelineRunStatus.details}</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
              <p className="text-emerald-600">{success}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Link Scraper Tab */}
            {activeTab === 'link-scraper' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Link Scraper</h3>
                  <p className="text-gray-600">Find new article links from selected news sources.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Scrapers ({selectedScrapers.length} selected)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableScrapers.map((scraper) => (
                      <label key={scraper} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedScrapers.includes(scraper)}
                          onChange={() => handleScraperToggle(scraper)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">{scraper}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={runLinkScraper}
                    disabled={loading || selectedScrapers.length === 0 || pipelineStatus?.is_running}
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Link Scraper
                  </button>
                </div>
              </div>
            )}

            {/* Article Scraper Tab */}
            {activeTab === 'article-scraper' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Scraper</h3>
                  <p className="text-gray-600">Scrape content from pending article links.</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={runArticleScraper}
                    disabled={loading || pipelineStatus?.is_running}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Article Scraper
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Analysis</h3>
                  <p className="text-gray-600">Extract entities and analyze sentiment from scraped articles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
                    <select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="groq">Groq</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                    <select
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {modelType === 'openai' ? (
                        <>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </>
                      ) : (
                        <>
                          <option value="llama3-8b-8192">Llama3 8B</option>
                          <option value="llama3-70b-8192">Llama3 70B</option>
                          <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                          <option value="gemma-7b-it">Gemma 7B</option>
                          <option value="meta-llama/llama-4-scout-17b-16e-instruct">Llama 4 Scout 17B</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={runAnalysis}
                    disabled={loading || pipelineStatus?.is_running}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Embeddings Tab */}
            {activeTab === 'embeddings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Embeddings</h3>
                  <p className="text-gray-600">Generate vector embeddings for scraped articles.</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={runEmbeddings}
                    disabled={loading || pipelineStatus?.is_running}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Generate Embeddings
                  </button>
                </div>
              </div>
            )}

            {/* Full Pipeline Tab */}
            {activeTab === 'full-pipeline' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Pipeline</h3>
                  <p className="text-gray-600">Run the complete pipeline: link scraping, article scraping, and analysis.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Scrapers ({selectedScrapers.length} selected)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableScrapers.map((scraper) => (
                      <label key={scraper} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedScrapers.includes(scraper)}
                          onChange={() => handleScraperToggle(scraper)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">{scraper}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
                    <select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="groq">Groq</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                    <select
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {modelType === 'openai' ? (
                        <>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </>
                      ) : (
                        <>
                          <option value="llama3-8b-8192">Llama3 8B</option>
                          <option value="llama3-70b-8192">Llama3 70B</option>
                          <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                          <option value="gemma-7b-it">Gemma 7B</option>
                          <option value="meta-llama/llama-4-scout-17b-16e-instruct">Llama 4 Scout 17B</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={runFullPipeline}
                    disabled={loading || selectedScrapers.length === 0 || pipelineStatus?.is_running}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Full Pipeline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};