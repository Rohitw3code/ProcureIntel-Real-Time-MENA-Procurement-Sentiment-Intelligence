// Chat API service for chatbot functionality
const CHAT_API_BASE_URL = 'https://0248b1539ceb.ngrok-free.app/api';

export interface ChatInitializeRequest {
  provider: 'openai' | 'groq';
  model_name: string;
  temperature?: number;
}

export interface ChatInitializeResponse {
  message: string;
}

export interface ChatQueryRequest {
  query: string;
}

export interface ChatQueryResponse {
  query: string;
  response: string;
}

export interface AvailableModels {
  openai: string[];
  groq: string[];
}

export const chatApi = {
  async initializeChat(params: ChatInitializeRequest): Promise<ChatInitializeResponse> {
    try {
      const response = await fetch(`${CHAT_API_BASE_URL}/chat/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  },

  async sendQuery(params: ChatQueryRequest): Promise<ChatQueryResponse> {
    try {
      const response = await fetch(`${CHAT_API_BASE_URL}/chat/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending chat query:', error);
      throw error;
    }
  },

  // Available models based on the agent_manager.py file
  getAvailableModels(): AvailableModels {
    return {
      openai: [
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-3.5-turbo'
      ],
      groq: [
        'llama3-8b-8192',
        'llama3-70b-8192',
        'mixtral-8x7b-32768',
        'gemma-7b-it',
        'meta-llama/llama-4-scout-17b-16e-instruct'
      ]
    };
  }
};