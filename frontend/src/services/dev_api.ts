// Dev API service for development and pipeline management
const DEV_API_BASE_URL = 'https://0248b1539ceb.ngrok-free.app/api';

export interface ScraperRunResponse {
  message: string;
  pipeline_id: number;
}

export interface PipelineStatus {
  current_pipeline_id: number | null;
  current_stage: string;
  details: {
    message: string;
  };
  is_running: boolean;
  last_update: string;
  progress: number;
  total: number;
}

export interface PipelineRunStatus {
  analysis_cost: number;
  articles_analyzed: number;
  articles_embedded: number;
  articles_scraped: number;
  details: string;
  embedding_cost: number;
  end_time: string | null;
  id: number;
  new_links_found: number;
  scraper_stats: string;
  start_time: string;
  status: string;
  total_cost: number;
}

export const devApi = {
  async getAvailableScrapers(): Promise<string[]> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/scraper/scraper-names`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching available scrapers:', error);
      throw error;
    }
  },

  async runLinkScraper(scrapers: string[]): Promise<ScraperRunResponse> {
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
      console.error('Error running link scraper:', error);
      throw error;
    }
  },

  async getPipelineStatus(): Promise<PipelineStatus> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pipeline status:', error);
      throw error;
    }
  },

  async getPipelineRunStatus(pipelineId: number): Promise<PipelineRunStatus> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/pipeline/runs/${pipelineId}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pipeline run status:', error);
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

  async runAnalysis(modelType: string, modelName: string): Promise<ScraperRunResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/analysis/run-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          model_type: modelType, 
          model_name: modelName 
        }),
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

  async runFullPipeline(scrapers: string[], modelType: string, modelName: string): Promise<ScraperRunResponse> {
    try {
      const response = await fetch(`${DEV_API_BASE_URL}/pipeline/run-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scrapers,
          model_type: modelType,
          model_name: modelName
        }),
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
  }
};