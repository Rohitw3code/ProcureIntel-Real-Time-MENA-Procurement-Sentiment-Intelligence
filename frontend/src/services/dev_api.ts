// Dev API service for pipeline management and monitoring
const DEV_API_BASE_URL = 'https://0248b1539ceb.ngrok-free.app/api';

export interface ScraperRunResponse {
  message: string;
  pipeline_id: number;
}

export interface GlobalStatusResponse {
  current_pipeline_id: number | null;
  current_stage: string;
  details: {
    message: string;
    scraper_stats?: Record<string, number>;
  };
  is_running: boolean;
  last_update: string;
  progress: number;
  total: number;
}

export interface PipelineStatusResponse {
  analysis_cost: number;
  articles_analyzed: number;
  articles_embedded: number;
  articles_scraped: number;
  details: string | { message: string; scraper_stats?: Record<string, number>; };
  embedding_cost: number;
  end_time: string | null;
  id: number;
  new_links_found: number;
  scraper_stats: string | Record<string, number>;
  start_time: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'STOPPED';
  total_cost: number;
}

export interface PipelineRun {
  id: number;
  start_time: string;
  end_time: string | null;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'STOPPED';
  details: string;
  scraper_stats: string;
  new_links_found: number;
  articles_scraped: number;
  articles_embedded: number;
  articles_analyzed: number;
  analysis_cost: number;
  embedding_cost: number;
  total_cost: number;
}

export interface AnalysisRunRequest {
  model_type: 'openai' | 'groq';
  model_name: string;
}

export interface FullPipelineRequest {
  scrapers: string[];
  model_type?: 'openai' | 'groq';
  model_name?: string;
}

export const devApi = {
  // Scraper endpoints
  async getScraperNames(): Promise<string[]> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/scraper/scraper-names`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching scraper names:', error);
      throw error;
    }
  },

  async runLinkFinder(scrapers: string[]): Promise<ScraperRunResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/scraper/run-link-finder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scrapers }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error running link finder:', error);
      throw error;
    }
  },

  async runArticleScraper(): Promise<ScraperRunResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/scraper/run-article-scraper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error running article scraper:', error);
      throw error;
    }
  },

  // Analysis endpoints
  async runEmbeddings(): Promise<ScraperRunResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/analysis/run-embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error running embeddings:', error);
      throw error;
    }
  },

  async runAnalysis(request: AnalysisRunRequest): Promise<ScraperRunResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/analysis/run-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error running analysis:', error);
      throw error;
    }
  },

  // Pipeline endpoints
  async runFullPipeline(request: FullPipelineRequest): Promise<ScraperRunResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/pipeline/run-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error running full pipeline:', error);
      throw error;
    }
  },

  async getAllPipelineRuns(): Promise<PipelineRun[]> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/pipeline/runs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pipeline runs:', error);
      throw error;
    }
  },

  // Status endpoints
  async getGlobalStatus(): Promise<GlobalStatusResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching global status:', error);
      throw error;
    }
  },

  async getPipelineStatus(pipelineId: number): Promise<PipelineStatusResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/pipeline/runs/${pipelineId}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pipeline status:', error);
      throw error;
    }
  },

  async stopPipeline(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/stop-pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error stopping pipeline:', error);
      throw error;
    }
  },

  // Model endpoints
  async getAvailableModels(): Promise<Record<string, string[]>> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching available models:', error);
      throw error;
    }
  }
};