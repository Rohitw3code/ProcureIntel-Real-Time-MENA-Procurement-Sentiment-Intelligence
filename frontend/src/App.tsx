import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Globe, TrendingUp, Shield, Search, Zap, Users, Building2, FileText, MessageCircle, Bot } from 'lucide-react';
import { FloatingChatbot } from './components/FloatingChatbot/FloatingChatbot';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ArticleSearchPage } from './components/ArticleSearch/ArticleSearchPage';
import { TendersPage } from './components/Tenders/TendersPage';
import { ChatbotPage } from './components/Chatbot/ChatbotPage';
import { DeveloperPage } from './components/Developer/DeveloperPage';

const sampleArticles = [
  {
    headline: "UAE announces $2.5B infrastructure tender for renewable energy projects",
    source: "Gulf Business",
    sentiment: "positive",
    companies: ["ADNOC", "Emirates Steel", "Masdar"]
  },
  {
    headline: "Saudi Arabia's NEOM project seeks construction contractors for smart city development",
    source: "Arab News",
    sentiment: "positive",
    companies: ["Saudi Aramco", "SABIC", "ACWA Power"]
  },
  {
    headline: "Egypt's Suez Canal expansion project opens new procurement opportunities",
    source: "Al-Ahram",
    sentiment: "positive",
    companies: ["Orascom", "Hassan Allam", "Arab Contractors"]
  },
  {
    headline: "Qatar's World Cup legacy projects announce major infrastructure tenders",
    source: "The Peninsula",
    sentiment: "positive",
    companies: ["Qatargas", "Industries Qatar", "Ooredoo"]
  },
  {
    headline: "Morocco's green hydrogen initiative attracts international investment partnerships",
    source: "Morocco World News",
    sentiment: "positive",
    companies: ["OCP Group", "ONEE", "Masen"]
  }
];

function App() {
  const [currentArticle, setCurrentArticle] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentArticle((prev) => (prev + 1) % sampleArticles.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextArticle = () => {
    setCurrentArticle((prev) => (prev + 1) % sampleArticles.length);
  };

  const prevArticle = () => {
    setCurrentArticle((prev) => (prev - 1 + sampleArticles.length) % sampleArticles.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Chatbot - Desktop Only */}
      <FloatingChatbot isMobile={isMobile} />
      
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3 lg:ml-4">
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    ProcureIntel
                  </span>
                  <div className="hidden lg:block text-xs text-gray-500 font-medium">
                    MENA Intelligence Platform
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1 lg:space-x-2">
                <button 
                  onClick={() => setActiveSection('home')}
                  className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-200 rounded-lg group ${
                    activeSection === 'home' 
                      ? 'text-emerald-600 bg-emerald-50 shadow-sm' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Home
                  {activeSection === 'home' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-200 rounded-lg group ${
                    activeSection === 'dashboard' 
                      ? 'text-emerald-600 bg-emerald-50 shadow-sm' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Dashboard
                  {activeSection === 'dashboard' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => setActiveSection('tenders')}
                  className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-200 rounded-lg group ${
                    activeSection === 'tenders' 
                      ? 'text-emerald-600 bg-emerald-50 shadow-sm' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Tenders
                  {activeSection === 'tenders' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => { setActiveSection('articles'); setIsMenuOpen(false); }}
                  className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-200 rounded-lg group ${
                    activeSection === 'articles' 
                      ? 'text-emerald-600 bg-emerald-50 shadow-sm' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Articles
                  {activeSection === 'articles' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => setActiveSection('chatbot')}
                  className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-200 rounded-lg group ${
                    activeSection === 'chatbot' 
                      ? 'text-emerald-600 bg-emerald-50 shadow-sm' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>AI Chat</span>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  </span>
                  {activeSection === 'chatbot' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => setActiveSection('developer')}
                  className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-200 rounded-lg group ${
                    activeSection === 'developer' 
                      ? 'text-emerald-600 bg-emerald-50 shadow-sm' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Developer
                  {activeSection === 'developer' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative p-2 text-gray-600 hover:text-emerald-600 focus:outline-none focus:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-200"
              >
                <div className="relative">
                  <svg className="h-6 w-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                      className={isMenuOpen ? "rotate-45" : ""}
                    />
                  </svg>
                  {!isMenuOpen && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <button 
                onClick={() => { setActiveSection('home'); setIsMenuOpen(false); }}
                className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  activeSection === 'home' 
                    ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                Home
              </button>
              <button 
                onClick={() => { setActiveSection('dashboard'); setIsMenuOpen(false); }}
                className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  activeSection === 'dashboard' 
                    ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Dashboard
              </button>
              <button 
                onClick={() => { setActiveSection('tenders'); setIsMenuOpen(false); }}
                className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  activeSection === 'tenders' 
                    ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                Tenders
              </button>
              <button 
                onClick={() => { setActiveSection('articles'); setIsMenuOpen(false); }}
                className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  activeSection === 'articles' 
                    ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Articles
              </button>
              <button 
                onClick={() => { setActiveSection('chatbot'); setIsMenuOpen(false); }}
                className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  activeSection === 'chatbot' 
                    ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3 animate-pulse"></div>
                AI Chat
              </button>
              <button 
                onClick={() => { setActiveSection('developer'); setIsMenuOpen(false); }}
                className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  activeSection === 'developer' 
                    ? 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                Developer
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Render Content Based on Active Section */}
      {activeSection === 'home' && (
        <>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-emerald-50 via-blue-50 to-white py-6 sm:py-6 lg:py-10 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-600 rounded-full"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-blue-600 rounded-full"></div>
              <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-600 rounded-full"></div>
              <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-orange-600 rounded-full"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      AI-Powered Procurement Intelligence
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      Smart <span className="text-emerald-600">Procurement</span> & <span className="text-blue-600">Sentiment</span> Intelligence for MENA
                    </h1>
                    <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                      Discover tender opportunities, analyze company sentiment, and extract actionable insights from thousands of MENA news sources. Our AI-powered platform transforms procurement intelligence.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={() => setActiveSection('dashboard')}
                      className="bg-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Go to Dashboard
                    </button>
                    <button 
                      onClick={() => setActiveSection('tenders')}
                      className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      View Tenders
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={() => setActiveSection('chatbot')}
                      className="border-2 border-emerald-600 text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <Bot className="h-5 w-5 mr-2" />
                      Talk to Our Data
                    </button>
                    <button 
                      onClick={() => setActiveSection('articles')}
                      className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Articles
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Live Updates
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      AI-Powered Analysis
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Sentiment Tracking
                    </div>
                  </div>
                </div>

                {/* Sliding News Articles */}
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Latest Procurement Intelligence</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={prevArticle}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={nextArticle}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative overflow-hidden">
                        <div 
                          className="flex transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${currentArticle * 100}%)` }}
                        >
                          {sampleArticles.map((article, index) => (
                            <div key={index} className="w-full flex-shrink-0">
                              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                                    {article.source}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    article.sentiment === 'positive' 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {article.sentiment}
                                  </span>
                                </div>
                                <h4 className="font-medium text-gray-900 text-xs sm:text-sm leading-relaxed mb-3">
                                  {article.headline}
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">Key Players:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {article.companies.map((company, companyIndex) => (
                                      <span 
                                        key={companyIndex}
                                        className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200"
                                      >
                                        {company}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Article indicators */}
                      <div className="flex justify-center space-x-2">
                        {sampleArticles.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentArticle(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentArticle ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 sm:py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                  <Zap className="h-4 w-4 mr-2" />
                  Comprehensive Intelligence Platform
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need for Procurement Intelligence
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                  From automated news monitoring to AI-powered sentiment analysis and tender discovery, ProcureIntel gives you the competitive edge in MENA procurement markets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <Search className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">AI-Powered News Monitoring</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Continuously scan thousands of MENA news sources with AI-powered content filtering and entity extraction for procurement intelligence.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Real-Time Sentiment Analysis</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Track company sentiment, risk factors, and market perception with advanced NLP models trained specifically for MENA markets.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <FileText className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Smart Tender Discovery</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Never miss procurement opportunities with automated tender detection, contract value extraction, and deadline tracking.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <MessageCircle className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Interactive AI Chatbot</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Ask questions about companies, tenders, or market trends. Our AI understands context and provides instant insights from our database.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200 group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <Zap className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Automated Entity Extraction</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Automatically extract company names, countries, commodities, and contract details from every article with high accuracy.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 group">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <BarChart3 className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Interactive Dashboards</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Visualize trends with real-time dashboards, compare companies, track sentiment evolution, and access data through our API.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chatbot Highlight Section */}
          <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      Chat with Your News Data
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    Instead of scrolling through hundreds of articles, just ask our AI chatbot. Want to know about recent Saudi infrastructure projects? Ask. Curious about UAE renewable energy tenders? Just type your question.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <p className="text-sm sm:text-base text-gray-600">Ask questions in plain English about any company, country, or sector</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <p className="text-sm sm:text-base text-gray-600">Get instant answers with source references and sentiment analysis</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <p className="text-sm sm:text-base text-gray-600">Discover connections and trends you might have missed</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveSection('chatbot')}
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Bot className="h-5 w-5 mr-2" />
                    Try Our AI Chatbot
                  </button>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-2 sm:p-3 max-w-xs">
                        <p className="text-xs sm:text-sm text-gray-800">What are the latest infrastructure projects in Saudi Arabia?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-emerald-600 rounded-lg p-2 sm:p-3 max-w-xs">
                        <p className="text-xs sm:text-sm text-white">I found 12 recent infrastructure projects in Saudi Arabia, including NEOM's $2.5B smart city development and the Red Sea Project's transportation network. The sentiment is overwhelmingly positive with strong government backing.</p>
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-2 sm:p-3 max-w-xs">
                        <p className="text-xs sm:text-sm text-gray-800">Which companies are involved?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-emerald-600 rounded-lg p-2 sm:p-3 max-w-xs">
                        <p className="text-xs sm:text-sm text-white">Key players include Saudi Aramco, SABIC, ACWA Power, and several international contractors. I can show you the complete breakdown with contract values if you'd like.</p>
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Procurement Intelligence?
              </h2>
              <p className="text-base sm:text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
                Join procurement teams and analysts who use ProcureIntel to discover opportunities faster, analyze sentiment trends, and make data-driven decisions with AI-powered market intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className="bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Explore Dashboard
                </button>
                <button 
                  onClick={() => setActiveSection('chatbot')}
                  className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center"
                >
                  <Bot className="h-5 w-5 mr-2" />
                  Try AI Chat
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-8 w-8 text-emerald-400" />
                    <span className="ml-2 text-xl font-bold">ProcureIntel</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-400 max-w-md">
                    AI-powered procurement intelligence for the MENA region. Discover tenders, analyze sentiment, and extract insights from news data to stay ahead of the market.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Platform</h3>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Dashboard</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Tenders</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">AI Chat</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Articles</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Resources</h3>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">API</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Support</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm text-gray-400">
                <p>&copy; 2025 ProcureIntel. Transforming MENA procurement with AI intelligence.</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && <Dashboard />}

      {/* Tenders Section */}
      {activeSection === 'tenders' && <TendersPage onBack={() => setActiveSection('home')} />}

      {/* Articles Section */}
      {activeSection === 'articles' && (
        <ArticleSearchPage onBack={() => setActiveSection('home')} />
      )}

      {/* Chatbot Section */}
      {activeSection === 'chatbot' && <ChatbotPage onBack={() => setActiveSection('home')} />}

      {/* Developer Section */}
      {activeSection === 'developer' && (
        <DeveloperPage onBack={() => setActiveSection('home')} />
      )}
    </div>
  );
}

export default App;