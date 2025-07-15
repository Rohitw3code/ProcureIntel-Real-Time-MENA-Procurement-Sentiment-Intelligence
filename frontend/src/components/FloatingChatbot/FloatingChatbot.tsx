import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Settings, 
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { chatApi, ChatInitializeRequest, AvailableModels } from '../../services/chat_api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface FloatingChatbotProps {
  isMobile: boolean;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ isMobile }) => {
  // Don't render on mobile - use the existing chatbot tab instead
  if (isMobile) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [provider, setProvider] = useState<'openai' | 'groq'>('groq');
  const [modelName, setModelName] = useState('meta-llama/llama-4-scout-17b-16e-instruct');
  const [temperature, setTemperature] = useState(0.1);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const availableModels: AvailableModels = chatApi.getAvailableModels();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    } 
    finally {
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
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat query error:', err);
    } finally {
      setIsLoading(false);
    }
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

  const resetChat = () => {
    setMessages([]);
    setIsInitialized(false);
    setError(null);
    initializeChat();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-90">
                    {isInitialized ? 'Online' : 'Initializing...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Settings Panel */}
              {showSettings && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Provider
                      </label>
                      <select
                        value={provider}
                        onChange={(e) => {
                          setProvider(e.target.value as 'openai' | 'groq');
                          setModelName(availableModels[e.target.value as 'openai' | 'groq'][0]);
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="groq">Groq</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <select
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {availableModels[provider].map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={initializeChat}
                        disabled={isInitializing}
                        className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {isInitializing ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin inline" />
                            Initializing...
                          </>
                        ) : (
                          'Initialize Chat'
                        )}
                      </button>
                      {isInitialized && (
                        <button
                          onClick={resetChat}
                          className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
                          title="Reset Chat"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96">
                {!isInitialized && !isInitializing && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Welcome to AI Assistant</h3>
                    <p className="text-xs text-gray-500 mb-4">Configure your AI model and start chatting</p>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Settings className="h-3 w-3 mr-1 inline" />
                      Configure Chat
                    </button>
                  </div>
                )}

                {isInitializing && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Initializing AI assistant...</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-gray-100' 
                          : 'bg-gradient-to-br from-emerald-500 to-blue-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-3 w-3 text-gray-600" />
                        ) : (
                          <Bot className="h-3 w-3 text-white" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`rounded-xl px-3 py-2 ${
                        message.type === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
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
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-xl px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                          <span className="text-xs text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {isInitialized && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about tenders, companies, or market trends..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-xs"
                        rows={1}
                        style={{ minHeight: '32px', maxHeight: '80px' }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};