// API service for ProcureIntel backend
const API_BASE_URL = 'https://0248b1539ceb.ngrok-free.app/api';

export interface StatsResponse {
  articles_analyzed: number;
  sentiment_analysis: {
    negative: number;
    neutral: number;
    positive: number;
  };
  total_commodities: number;
  total_companies: number;
  total_countries: number;
  total_data_news_articles_scraped: number;
  total_tenders: number;
}

export interface TenderResult {
  analysis_mode: string;
  cleaned_text: string;
  commodities: string[];
  contract_value: string | null;
  countries: string[];
  deadline: string | null;
  source: string;
  url: string;
}

export interface CompanySearchParams {
  name: string;
  sentiment?: 'Positive' | 'Negative' | 'Neutral';
  risk_type?: string;
  mode?: 'Tender' | 'Sentiment';
}

export interface CompanySearchResult {
  company_name: string;
  company_id?: number;
  reason: string;
  sentiments: {
    positive: number;
    negative: number;
    neutral: number;
  };
  urls: string[];
  commodities?: {
    top_3: Array<{
      name: string;
      count: number;
    }>;
    total_unique: number;
  };
  countries?: {
    top_3: Array<{
      name: string;
      count: number;
    }>;
    total_unique: number;
  };
  contract_values?: {
    total_unique: number;
  };
  risk_types?: Record<string, number>;
}

export interface CompanySentimentSummary {
  company_id?: number;
  company_name: string;
  positive: number;
  negative: number;
  neutral: number;
  total_sentiments: number;
}

export interface CompanySentimentSummaryParams {
  name?: string;
  risk_type?: string;
  mode?: 'Tender' | 'Sentiment';
  order_by?: 'positive' | 'negative' | 'neutral' | 'total';
  limit?: number;
}

export interface TenderSearchParams {
  query?: string;
  k?: number;
}

export interface ShuffledCompany {
  article_analysis_id: number;
  company_name: string;
  created_at: string;
  id: number;
  reason_for_sentiment: string;
  risk_type: string | null;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface CompanySentimentTimeline {
  company_id: string;
  real_name: string;
  sentiment_timeline: {
    [date: string]: Array<{
      reason: string;
      sentiment: 'Positive' | 'Negative' | 'Neutral';
    }>;
  };
}

export interface CompanyRiskFactors {
  company_id: string;
  risk_counts_by_date: {
    [date: string]: {
      [riskType: string]: number;
    };
  };
}

export interface CompanyCommodityData {
  commodities: string[];
  contract_value: string | null;
  countries: string[];
  deadline: string | null;
  publication_date: string;
}

export const statsApi = {
  async getInsights(): Promise<StatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/insights`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  async searchCompanies(params: CompanySearchParams): Promise<CompanySearchResult[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.name && params.name.trim()) {
        searchParams.append('name', params.name.trim());
      } else {
        throw new Error('Company name is required');
      }
      if (params.sentiment) searchParams.append('sentiment', params.sentiment);
      if (params.risk_type) searchParams.append('risk_type', params.risk_type);
      if (params.mode) searchParams.append('mode', params.mode);

      const response = await fetch(`${API_BASE_URL}/stats/search/companies?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  },

  async getCompanySentimentSummary(params: CompanySentimentSummaryParams = {}): Promise<CompanySentimentSummary[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.name) searchParams.append('name', params.name);
      if (params.risk_type) searchParams.append('risk_type', params.risk_type);
      if (params.mode) searchParams.append('mode', params.mode);
      if (params.order_by) searchParams.append('order_by', params.order_by);
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE_URL}/stats/company-sentiment-summary?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company sentiment summary:', error);
      throw error;
    }
  },

  async getTenders(limit: number = 5): Promise<TenderResult[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/stats/tenders?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tenders:', error);
      throw error;
    }
  },

  async searchTenders(params: TenderSearchParams = {}): Promise<TenderResult[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.query && params.query.trim()) {
        searchParams.append('query', params.query.trim());
      }
      if (params.k) searchParams.append('k', params.k.toString());

      const response = await fetch(`${API_BASE_URL}/stats/search/tender?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching tenders:', error);
      throw error;
    }
  },

  async getShuffledCompanies(): Promise<ShuffledCompany[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/companies/shuffled`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching shuffled companies:', error);
      throw error;
    }
  },

  async getCompanySentiments(companyId: string): Promise<CompanySentimentTimeline> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/company/sentiments?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company sentiments:', error);
      throw error;
    }
  },

  async getCompanyRiskFactors(companyId: string): Promise<CompanyRiskFactors> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/risk-factors/counts?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company risk factors:', error);
      throw error;
    }
  },

  async getCompanyCommodities(companyId: string): Promise<CompanyCommodityData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/search/commo?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company commodities:', error);
      throw error;
    }
  },

  async searchArticles(params: ArticleSearchParams): Promise<ArticleSearchResult[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.query && params.query.trim()) {
        searchParams.append('query', params.query.trim());
      } else {
        throw new Error('Search query is required');
      }
      if (params.k) searchParams.append('k', params.k.toString());

      const response = await fetch(`${API_BASE_URL}/stats/search/articles?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  },

  async summarizeArticle(description: string): Promise<{ summary: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/summarize/article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error summarizing article:', error);
      throw error;
    }
  },

  async summarizeTender(description: string): Promise<{ summary: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/summarize/article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error summarizing tender:', error);
      throw error;
    }
  }
};

// Article Search Types
export interface ArticleSearchParams {
  query: string;
  k?: number;
}

export interface ArticleSearchResult {
  id: number;
  title: string;
  author: string;
  url: string;
  description: string;
  publication_date: string;
}