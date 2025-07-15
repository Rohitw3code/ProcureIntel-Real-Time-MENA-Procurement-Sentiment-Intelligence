import React from 'react';
import { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { SentimentCard } from './SentimentCard';
import { statsApi, StatsResponse } from '../../services/api';
import { 
  FileText, 
  Search, 
  Building2, 
  FileCheck, 
  Globe, 
  Package,
  Users
} from 'lucide-react';

export const MetricsGrid: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsApi.getInsights();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load data'}</p>
          <button 
            onClick={fetchStats}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate sentiment percentages
  const totalSentiments = stats.sentiment_analysis.positive + stats.sentiment_analysis.negative + stats.sentiment_analysis.neutral;
  const sentimentData = {
    positive: { 
      count: stats.sentiment_analysis.positive, 
      percentage: totalSentiments > 0 ? (stats.sentiment_analysis.positive / totalSentiments) * 100 : 0 
    },
    negative: { 
      count: stats.sentiment_analysis.negative, 
      percentage: totalSentiments > 0 ? (stats.sentiment_analysis.negative / totalSentiments) * 100 : 0 
    },
    neutral: { 
      count: stats.sentiment_analysis.neutral, 
      percentage: totalSentiments > 0 ? (stats.sentiment_analysis.neutral / totalSentiments) * 100 : 0 
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total News Articles"
          value={stats.total_data_news_articles_scraped}
          icon={FileText}
          trend={{ value: 12.5, isPositive: true }}
          color="emerald"
        />
        
        <MetricCard
          title="Articles Analyzed"
          value={stats.articles_analyzed}
          icon={Search}
          trend={{ value: 8.3, isPositive: true }}
          color="blue"
        />
        
        <MetricCard
          title="Total Companies"
          value={stats.total_companies}
          icon={Building2}
          trend={{ value: 15.2, isPositive: true }}
          color="purple"
        />
        
        <MetricCard
          title="Total Tenders"
          value={stats.total_tenders}
          icon={FileCheck}
          trend={{ value: 22.1, isPositive: true }}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Countries Covered"
          value={stats.total_countries}
          icon={Globe}
          color="emerald"
        />
        
        <MetricCard
          title="Commodities Tracked"
          value={stats.total_commodities}
          icon={Package}
          color="blue"
        />
        
        <MetricCard
          title="Active Users"
          value={1247}
          icon={Users}
          trend={{ value: 5.7, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Sentiment Analysis Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sentiment Analysis Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SentimentCard
            type="positive"
            count={sentimentData.positive.count}
            percentage={sentimentData.positive.percentage}
          />
          
          <SentimentCard
            type="negative"
            count={sentimentData.negative.count}
            percentage={sentimentData.negative.percentage}
          />
          
          <SentimentCard
            type="neutral"
            count={sentimentData.neutral.count}
            percentage={sentimentData.neutral.percentage}
          />
        </div>
      </div>
    </div>
  );
};