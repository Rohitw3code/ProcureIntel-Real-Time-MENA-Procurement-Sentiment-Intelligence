import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Globe, TrendingUp, Shield, Search, Zap, Users, Building2, FileText, MessageCircle, Bot } from 'lucide-react';
import { Dashboard } from './components/Dashboard/Dashboard';

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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BarChart3 className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ProcureIntel</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => setActiveSection('home')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === 'home' 
                      ? 'text-emerald-600' 
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === 'dashboard' 
                      ? 'text-emerald-600' 
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveSection('developer')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === 'developer' 
                      ? 'text-emerald-600' 
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  Developer
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-emerald-600 focus:outline-none focus:text-emerald-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button 
                onClick={() => { setActiveSection('home'); setIsMenuOpen(false); }}
                className={`block px-3 py-2 text-base font-medium w-full text-left ${
                  activeSection === 'home' ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => { setActiveSection('dashboard'); setIsMenuOpen(false); }}
                className={`block px-3 py-2 text-base font-medium w-full text-left ${
                  activeSection === 'dashboard' ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setActiveSection('developer'); setIsMenuOpen(false); }}
                className={`block px-3 py-2 text-base font-medium w-full text-left ${
                  activeSection === 'developer' ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
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
          <section className="relative bg-gradient-to-br from-emerald-50 to-white py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      Smart <span className="text-emerald-600">Procurement</span> Intelligence for MENA
                    </h1>
                    <p className="mt-6 text-lg lg:text-xl text-gray-600 leading-relaxed">
                      Track procurement opportunities, analyze market sentiment, and chat with news data. We scan thousands of MENA news sources so you don't have to.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Start Exploring
                    </button>
                    <button className="border border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                      Try the Chatbot
                    </button>
                  </div>

                  <div className="flex items-center space-x-8 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Live Updates
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Production Ready
                    </div>
                  </div>
                </div>

                {/* Sliding News Articles */}
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Latest Opportunities</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={prevArticle}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={nextArticle}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 text-gray-600" />
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
                              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
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
                                <h4 className="font-medium text-gray-900 text-sm leading-relaxed mb-3">
                                  {article.headline}
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-500">Key Players:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {article.companies.map((company, companyIndex) => (
                                      <span 
                                        key={companyIndex}
                                        className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
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
          <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need to Stay Ahead
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  From news monitoring to tender discovery, ProcureIntel gives you the tools to spot opportunities before your competition does.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <Search className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart News Monitoring</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We continuously scan major MENA news sources and clean up the content so you get only what matters for your business.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <MessageCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive News Chatbot</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Ask questions about any news article or trend. Our chatbot understands the context and gives you instant insights from our database.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <Zap className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Automatic Data Extraction</h3>
                  <p className="text-gray-600 leading-relaxed">
                    No more manual reading. We automatically pull out company names, countries, commodities, and tender details from every article.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Sentiment Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Know how the market feels about companies and projects. Our models predict sentiment and risk levels based on regional news patterns.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tender Discovery</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Never miss a procurement opportunity again. We spot new tenders, track contract values, and monitor project developments across the region.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Visual Dashboards</h3>
                  <p className="text-gray-600 leading-relaxed">
                    See trends at a glance with our real-time dashboards. Compare companies, track sentiment over time, and export data through our API.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chatbot Highlight Section */}
          <section className="py-20 bg-emerald-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      Chat with Your News Data
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Instead of scrolling through hundreds of articles, just ask our chatbot. Want to know about recent Saudi infrastructure projects? Ask. Curious about UAE renewable energy tenders? Just type your question.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <p className="text-gray-600">Ask questions in plain English about any company, country, or sector</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <p className="text-gray-600">Get instant answers with source references and sentiment analysis</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <p className="text-gray-600">Discover connections and trends you might have missed</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-800">What are the latest infrastructure projects in Saudi Arabia?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-emerald-600 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-white">I found 12 recent infrastructure projects in Saudi Arabia, including NEOM's $2.5B smart city development and the Red Sea Project's transportation network. The sentiment is overwhelmingly positive with strong government backing.</p>
                      </div>
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-800">Which companies are involved?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-emerald-600 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-white">Key players include Saudi Aramco, SABIC, ACWA Power, and several international contractors. I can show you the complete breakdown with contract values if you'd like.</p>
                      </div>
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-emerald-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to Get Ahead of the Competition?
              </h2>
              <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
                Join procurement teams and analysts who use ProcureIntel to spot opportunities faster and make better decisions with real-time market intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg">
                  Start Free Trial
                </button>
                <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                  Book a Demo
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-8 w-8 text-emerald-400" />
                    <span className="ml-2 text-xl font-bold">ProcureIntel</span>
                  </div>
                  <p className="text-gray-400 max-w-md">
                    Smart procurement intelligence for the MENA region. Track opportunities, analyze sentiment, and chat with news data to stay ahead of the market.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">API</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2025 ProcureIntel. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && <Dashboard />}

      {/* Developer Section */}
      {activeSection === 'developer' && (
        <div className="min-h-screen bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Developer Portal</h1>
            <p className="text-lg text-gray-600">API documentation and integration guides coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;