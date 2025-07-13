// API service for ProcureIntel backend
const API_BASE_URL = 'https://301ab07338c4.ngrok-free.app/api';

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
  commodities: string[];
  contract_value: string | null;
  countries: string[];
  deadline: string | null;
  publication_date: string;
  title: string;
  url: string;
}

export interface CompanySearchParams {
  name: string;
  sentiment?: 'Positive' | 'Negative' | 'Neutral';
  risk_type?: string;
  mode?: 'Tender' | 'Sentiment';
}

export interface CompanySearchResult {
  article_title: string;
  article_url: string;
  commodities: string[];
  company_name: string;
  countries: string[];
  mode: string;
  publication_date: string;
  reason_for_sentiment: string;
  risk_type: string | null;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface CompanySentimentSummary {
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

export interface ShuffledCompany {
  article_analysis_id: number;
  company_name: string;
  created_at: string;
  id: number;
  reason_for_sentiment: string;
  risk_type: string | null;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
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
      searchParams.append('name', params.name);
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
  }
};