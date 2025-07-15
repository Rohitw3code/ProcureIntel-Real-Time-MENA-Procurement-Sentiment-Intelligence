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

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchGlobalStatus, 1000); // Poll every 1 second for more responsive UI
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPipelineId) {
      fetchPipelineStatus(selectedPipelineId);
    }
  }, [selectedPipelineId]);

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
      
      // If pipeline was stopped, refresh the pipeline runs list
      if (status.current_stage === 'Idle' && !status.is_running) {
        // Refresh pipeline runs to get the latest data
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

  // Handler functions
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
      
      // Immediately update the global status to show stopping state
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
      
      // Force refresh global status after a short delay
      setTimeout(() => {
        fetchGlobalStatus();
      }, 1000);
      
      // Refresh again after 3 seconds to ensure we get the final state
      setTimeout(() => {
        fetchGlobalStatus();
      }, 3000);
      
    } catch (err) {
      setError('Failed to stop pipeline');
    } finally {
      setLoading(false);
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