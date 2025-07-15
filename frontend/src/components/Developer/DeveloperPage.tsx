import React, { useState, useEffect } from 'react';
import { devApi, GlobalStatusResponse, PipelineStatusResponse, PipelineRun } from '../../services/dev_api';
import { DeveloperHeader } from './DeveloperHeader';
import { TabNavigation, TabType } from './TabNavigation';
import { AlertMessages } from './AlertMessages';
import { LinkScraperTab } from './tabs/LinkScraperTab';
import { ArticleScraperTab } from './tabs/ArticleScraperTab';
import { EmbeddingsTab } from './tabs/EmbeddingsTab';
import { AnalysisTab } from './tabs/AnalysisTab';
import { FullPipelineTab } from './tabs/FullPipelineTab';
import { MonitoringTab } from './tabs/MonitoringTab';

export const DeveloperPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('link-scraper');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scraperNames, setScraperNames] = useState<string[]>([]);
  const [selectedScrapers, setSelectedScrapers] = useState<string[]>([]);
  const [globalStatus, setGlobalStatus] = useState<GlobalStatusResponse | null>(null);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusResponse | null>(null);
  const [availableModels, setAvailableModels] = useState<Record<string, string[]>>({});
  const [selectedModelType, setSelectedModelType] = useState<'openai' | 'groq'>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
      const interval = setInterval(fetchGlobalStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && selectedPipelineId) {
      fetchPipelineStatus(selectedPipelineId);
    }
  }, [isAuthenticated, selectedPipelineId]);

  const fetchInitialData = async () => {
    try {
      const [scrapers, models, runs] = await Promise.all([
        devApi.getScraperNames(),
        devApi.getAvailableModels(),
        devApi.getAllPipelineRuns()
      ]);
      setScraperNames(scrapers);
      setAvailableModels(models);
      setPipelineRuns(runs);
      if (runs.length > 0) {
        setSelectedPipelineId(runs[0].id);
      }
    } catch (err) {
      setError('Failed to load initial data');
    }
  };

  const fetchGlobalStatus = async () => {
    try {
      const status = await devApi.getGlobalStatus();
      setGlobalStatus(status);
      
      if (status.current_stage === 'Idle' && !status.is_running) {
        const runs = await devApi.getAllPipelineRuns();
        setPipelineRuns(runs);
      }
    } catch (err) {
      console.error('Failed to fetch global status:', err);
    }
  };

  const fetchPipelineStatus = async (pipelineId: number) => {
    try {
      const status = await devApi.getPipelineStatus(pipelineId);
      setPipelineStatus(status);
    } catch (err) {
      console.error('Failed to fetch pipeline status:', err);
    }
  };

  const handleScraperToggle = (scraper: string) => {
    setSelectedScrapers(prev => 
      prev.includes(scraper) 
        ? prev.filter(s => s !== scraper)
        : [...prev, scraper]
    );
  };

  const handleSelectAllScrapers = () => {
    setSelectedScrapers(scraperNames);
  };

  const handleClearAllScrapers = () => {
    setSelectedScrapers([]);
  };

  const handleModelTypeChange = (type: 'openai' | 'groq') => {
    setSelectedModelType(type);
    if (availableModels[type]?.length > 0) {
      setSelectedModel(availableModels[type][0]);
    }
  };

  const handleRunLinkFinder = async () => {
    if (selectedScrapers.length === 0) {
      setError('Please select at least one scraper');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runLinkFinder(selectedScrapers);
      setSuccess(`Link finder started successfully. Pipeline ID: ${response.pipeline_id}`);
      setSelectedPipelineId(response.pipeline_id);
      fetchGlobalStatus();
    } catch (err) {
      setError('Failed to start link finder');
    } finally {
      setLoading(false);
    }
  };

  const handleRunArticleScraper = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runArticleScraper();
      setSuccess(`Article scraper started successfully. Pipeline ID: ${response.pipeline_id}`);
      setSelectedPipelineId(response.pipeline_id);
      fetchGlobalStatus();
    } catch (err) {
      setError('Failed to start article scraper');
    } finally {
      setLoading(false);
    }
  };

  const handleRunEmbeddings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runEmbeddings();
      setSuccess(`Embeddings generation started successfully. Pipeline ID: ${response.pipeline_id}`);
      setSelectedPipelineId(response.pipeline_id);
      fetchGlobalStatus();
    } catch (err) {
      setError('Failed to start embeddings generation');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runAnalysis({
        model_type: selectedModelType,
        model_name: selectedModel
      });
      setSuccess(`Analysis started successfully. Pipeline ID: ${response.pipeline_id}`);
      setSelectedPipelineId(response.pipeline_id);
      fetchGlobalStatus();
    } catch (err) {
      setError('Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullPipeline = async () => {
    if (selectedScrapers.length === 0) {
      setError('Please select at least one scraper');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.runFullPipeline({
        scrapers: selectedScrapers,
        model_type: selectedModelType,
        model_name: selectedModel
      });
      setSuccess(`Full pipeline started successfully. Pipeline ID: ${response.pipeline_id}`);
      setSelectedPipelineId(response.pipeline_id);
      fetchGlobalStatus();
    } catch (err) {
      setError('Failed to start full pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleStopPipeline = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await devApi.stopPipeline();
      setSuccess(response.message);
      
      if (globalStatus) {
        setGlobalStatus({
          ...globalStatus,
          current_stage: 'Stopping...',
          details: {
            ...globalStatus.details,
            message: 'Pipeline stop requested. Shutting down gracefully...'
          }
        });
      }
      
      setTimeout(() => {
        fetchGlobalStatus();
      }, 1000);
      
      setTimeout(() => {
        fetchGlobalStatus();
      }, 3000);
      
    } catch (err) {
      setError('Failed to stop pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dev123') {
      setIsAuthenticated(true);
      setPasswordError(null);
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'link-scraper':
        return (
          <LinkScraperTab
            scraperNames={scraperNames}
            selectedScrapers={selectedScrapers}
            loading={loading}
            onScraperToggle={handleScraperToggle}
            onSelectAll={handleSelectAllScrapers}
            onClearAll={handleClearAllScrapers}
            onRun={handleRunLinkFinder}
          />
        );
      case 'article-scraper':
        return (
          <ArticleScraperTab
            loading={loading}
            onRun={handleRunArticleScraper}
          />
        );
      case 'embeddings':
        return (
          <EmbeddingsTab
            loading={loading}
            onRun={handleRunEmbeddings}
          />
        );
      case 'analysis':
        return (
          <AnalysisTab
            availableModels={availableModels}
            selectedModelType={selectedModelType}
            selectedModel={selectedModel}
            loading={loading}
            onModelTypeChange={handleModelTypeChange}
            onModelChange={setSelectedModel}
            onRun={handleRunAnalysis}
          />
        );
      case 'full-pipeline':
        return (
          <FullPipelineTab
            scraperNames={scraperNames}
            selectedScrapers={selectedScrapers}
            availableModels={availableModels}
            selectedModelType={selectedModelType}
            selectedModel={selectedModel}
            loading={loading}
            onScraperToggle={handleScraperToggle}
            onModelTypeChange={handleModelTypeChange}
            onModelChange={setSelectedModel}
            onRun={handleRunFullPipeline}
          />
        );
      case 'monitoring':
        return (
          <MonitoringTab
            pipelineRuns={pipelineRuns}
            selectedPipelineId={selectedPipelineId}
            pipelineStatus={pipelineStatus}
            onPipelineSelect={setSelectedPipelineId}
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">Secure Access</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2 2 4 2 4 2-2.896 2-4zm0 0c0 1.104.896 2 2 2s2-.896 2-2-2-4-2-4-2 2.896-2 4zm7-7H5c-1.104 0-2 .896-2 2v12c0 1.104.896 2 2 2h14c1.104 0 2-.896 2-2V6c0-1.104-.896-2-2-2z"
                  />
                </svg>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-2 font-medium animate-pulse">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DeveloperHeader
        globalStatus={globalStatus}
        onRefresh={fetchGlobalStatus}
        onStop={handleStopPipeline}
        loading={loading}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <AlertMessages
          error={error}
          success={success}
          onClearError={() => setError(null)}
          onClearSuccess={() => setSuccess(null)}
        />

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};