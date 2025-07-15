import React, { useState } from 'react';
import { ArrowLeft, Bot, Send, User, Loader2, MessageCircle, Sparkles, Brain, Zap, Settings, RefreshCw } from 'lucide-react';
import { chatApi, AvailableModels } from '../../services/chat_api';

interface ChatbotPageProps {
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const SAMPLE_QUESTIONS = [
  "What are the latest infrastructure projects in Saudi Arabia?",
  "Show me renewable energy tenders in the UAE",
  "Which companies have positive sentiment in Qatar?",
  "What are the major construction contracts in Egypt?",
  "Tell me about NEOM project developments"
];

export const ChatbotPage: React.FC<ChatbotPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI assistant for MENA procurement intelligence. Please configure your AI model settings below to get started.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  
  // Settings
  const [provider, setProvider] = useState<'openai' | 'groq'>('groq');
  const [modelName, setModelName] = useState('meta-llama/llama-4-scout-17b-16e-instruct');
  const [temperature, setTemperature] = useState(0.1);
  
  const availableModels: AvailableModels = chatApi.getAvailableModels();

  const initializeChat = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      const response = await chatApi.initializeChat({
        provider,
        model_name: modelName,
        temperature
      });
      
      setIsInitialized(true);
      setMessages([{
        id: '1',
        type: 'bot',
        content: `Hello! I'm your AI assistant powered by ${provider} (${modelName}). I can help you discover tenders, analyze company sentiment, and extract insights from our MENA procurement database. What would you like to know?`,
        timestamp: new Date()
      }]);
      setShowSettings(false);
    } catch (err) {
      setError('Failed to initialize chat. Please try again.');
      console.error('Chat initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendQuery({ query: inputMessage });
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setIsInitialized(false);
    setError(null);
    setShowSettings(true);
  };

  const handleSampleQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  AI Procurement Assistant
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Chat with our AI to discover insights from MENA procurement data
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-600 font-medium hidden sm:inline">Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              {isInitialized && (
                <button
                  onClick={resetChat}
                  className="p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100"
                  title="Reset Chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value as 'openai' | 'groq');
                    setModelName(availableModels[e.target.value as 'openai' | 'groq'][0]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="openai">OpenAI</option>
                  <option value="groq">Groq</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {availableModels[provider].map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={initializeChat}
                disabled={isInitializing}
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Initialize Chat
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 py-4 sm:py-6 space-y-4 overflow-y-auto">
          {!isInitialized && !isInitializing && !showSettings && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Assistant Not Initialized</h3>
              <p className="text-gray-500 mb-4">Please configure your AI model to start chatting</p>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2 inline" />
                Configure AI Model
              </button>
            </div>
          )}

          {isInitializing && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing AI assistant...</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 sm:space-x-3 max-w-xs sm:max-w-md lg:max-w-lg ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gray-100' 
                    : 'bg-gradient-to-br from-emerald-500 to-blue-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  ) : (
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                  message.type === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                }`}>
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-emerald-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Message */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sample Questions */}
        {isInitialized && messages.length === 1 && (
          <div className="py-4 border-t border-gray-200">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Try asking about:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuestion(question)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-sm text-gray-700 hover:text-emerald-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        {isInitialized && (
          <div className="py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <div className="flex items-end space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about tenders, companies, or market trends..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm sm:text-base bg-white"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 sm:p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
          
          {/* Features Info */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>Natural Language</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};