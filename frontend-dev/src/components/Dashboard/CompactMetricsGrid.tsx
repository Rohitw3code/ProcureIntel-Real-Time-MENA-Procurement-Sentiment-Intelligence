import React from 'react';
import { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { statsApi, StatsResponse } from '../../services/api';
import { 
  FileText, 
  Search, 
  Building2, 
  FileCheck
} from 'lucide-react';

export const CompactMetricsGrid: React.FC = () => {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Compact Main Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="News Articles"
          value={stats.total_data_news_articles_scraped}
          icon={FileText}
          color="emerald"
        />
        
        <MetricCard
          title="Analyzed"
          value={stats.articles_analyzed}
          icon={Search}
          color="blue"
        />
        
        <MetricCard
          title="Companies"
          value={stats.total_companies}
          icon={Building2}
          color="purple"
        />
        
        <MetricCard
          title="Tenders"
          value={stats.total_tenders}
          icon={FileCheck}
          color="orange"
        />
      </div>
    </div>
  );
};