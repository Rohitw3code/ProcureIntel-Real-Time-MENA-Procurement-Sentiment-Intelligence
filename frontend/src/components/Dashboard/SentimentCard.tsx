import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentCardProps {
  type: 'positive' | 'negative' | 'neutral';
  count: number;
  percentage: number;
}

export const SentimentCard: React.FC<SentimentCardProps> = ({ type, count, percentage }) => {
  const config = {
    positive: {
      title: 'Positive',
      icon: TrendingUp,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      borderColor: 'border-emerald-100'
    },
    negative: {
      title: 'Negative',
      icon: TrendingDown,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      iconBg: 'bg-red-100',
      borderColor: 'border-red-100'
    },
    neutral: {
      title: 'Neutral',
      icon: Minus,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
      borderColor: 'border-gray-100'
    }
  };

  const { title, icon: Icon, bgColor, textColor, iconBg, borderColor } = config[type];

  return (
    <div className={`${bgColor} rounded-xl border ${borderColor} p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title} Sentiment</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{count.toLocaleString()}</p>
          <div className="flex items-center mt-2">
            <span className={`text-xs font-medium ${textColor}`}>
              {percentage.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">of total articles</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg} ${textColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};