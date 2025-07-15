import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Minus, Calendar } from 'lucide-react';
import { CompanySentimentTimeline } from '../../services/api';

interface SentimentTrendChartProps {
  timelineData: CompanySentimentTimeline;
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  timestamp: number;
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ timelineData }) => {
  // Process timeline data into line chart format
  const processChartData = (): ChartDataPoint[] => {
    const chartData: ChartDataPoint[] = [];
    
    const sortedDates = Object.entries(timelineData.sentiment_timeline)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    
    sortedDates.forEach(([date, entries]) => {
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
      
      entries.forEach(entry => {
        if (entry.sentiment === 'Positive') sentimentCounts.positive++;
        else if (entry.sentiment === 'Negative') sentimentCounts.negative++;
        else sentimentCounts.neutral++;
      });
      
      const total = sentimentCounts.positive + sentimentCounts.negative + sentimentCounts.neutral;
      
      chartData.push({
        date,
        formattedDate: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        positive: sentimentCounts.positive,
        negative: sentimentCounts.negative,
        neutral: sentimentCounts.neutral,
        total,
        timestamp: new Date(date).getTime()
      });
    });
    
    return chartData;
  };

  const chartData = processChartData();

  // Calculate overall statistics
  const totalStats = chartData.reduce(
    (acc, point) => {
      acc.positive += point.positive;
      acc.negative += point.negative;
      acc.neutral += point.neutral;
      acc.total += point.total;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0, total: 0 }
  );

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl max-w-xs">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-4 w-4 text-blue-600" />
            <p className="font-semibold text-gray-900">
              {new Date(data.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-700">Positive</span>
              </div>
              <span className="font-bold text-emerald-600">{data.positive}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Negative</span>
              </div>
              <span className="font-bold text-red-600">{data.negative}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm text-gray-700">Neutral</span>
              </div>
              <span className="font-bold text-gray-600">{data.neutral}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Mentions</span>
                <span className="font-bold text-blue-600">{data.total}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot component
  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    let color = '#6b7280';
    
    if (dataKey === 'positive') color = '#10b981';
    else if (dataKey === 'negative') color = '#ef4444';
    else if (dataKey === 'neutral') color = '#6b7280';
    
    const size = Math.max(4, Math.min(8, payload[dataKey] + 2));
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={color}
        stroke="white"
        strokeWidth={2}
        className="drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sentiment Trends Over Time</h2>
              <p className="text-xs sm:text-sm text-gray-600">Connected timeline showing sentiment evolution</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Positive</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-emerald-600">{totalStats.positive}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Negative</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-red-600">{totalStats.negative}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Neutral</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-gray-600">{totalStats.neutral}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-3 sm:p-6">
        {chartData.length > 0 ? (
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ 
                  top: 20, 
                  right: 30, 
                  bottom: 60, 
                  left: 20 
                }}
              >
                {/* Beautiful gradient background */}
                <defs>
                  <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e2e8f0" 
                  strokeOpacity={0.5}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="formattedDate"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: '#64748b' }}
                />
                
                <YAxis 
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b' }}
                  label={{ 
                    value: 'Mentions', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#64748b', fontSize: '12px' }
                  }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* Positive Sentiment Line */}
                <Line
                  type="monotone"
                  dataKey="positive"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={<CustomDot dataKey="positive" />}
                  activeDot={{ 
                    r: 8, 
                    fill: '#10b981',
                    stroke: 'white',
                    strokeWidth: 3,
                    style: { filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))' }
                  }}
                  connectNulls={false}
                  strokeDasharray="0"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.2))'
                  }}
                />
                
                {/* Negative Sentiment Line */}
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={<CustomDot dataKey="negative" />}
                  activeDot={{ 
                    r: 8, 
                    fill: '#ef4444',
                    stroke: 'white',
                    strokeWidth: 3,
                    style: { filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))' }
                  }}
                  connectNulls={false}
                  strokeDasharray="0"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2))'
                  }}
                />
                
                {/* Neutral Sentiment Line */}
                <Line
                  type="monotone"
                  dataKey="neutral"
                  stroke="#6b7280"
                  strokeWidth={3}
                  dot={<CustomDot dataKey="neutral" />}
                  activeDot={{ 
                    r: 8, 
                    fill: '#6b7280',
                    stroke: 'white',
                    strokeWidth: 3,
                    style: { filter: 'drop-shadow(0 4px 8px rgba(107, 114, 128, 0.3))' }
                  }}
                  connectNulls={false}
                  strokeDasharray="0"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(107, 114, 128, 0.2))'
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              </div>
              <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-2">No trend data available</h3>
              <p className="text-xs sm:text-base text-gray-500">Not enough data points to generate a trend chart</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Legend and Summary */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-100">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
                <div className="w-6 h-0.5 bg-emerald-500 rounded"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Positive Trend</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                <div className="w-6 h-0.5 bg-red-500 rounded"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Negative Trend</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm"></div>
                <div className="w-6 h-0.5 bg-gray-500 rounded"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Neutral Trend</span>
            </div>
          </div>
          
          {/* Enhanced Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-medium text-gray-600">Days Tracked</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {chartData.length}
              </p>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-medium text-gray-600">Avg Positive</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-600">
                {chartData.length > 0 ? (totalStats.positive / chartData.length).toFixed(1) : '0'}
              </p>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-xs font-medium text-gray-600">Avg Negative</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-red-600">
                {chartData.length > 0 ? (totalStats.negative / chartData.length).toFixed(1) : '0'}
              </p>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-medium text-gray-600">Total</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{totalStats.total}</p>
            </div>
          </div>
          
          {/* Chart Features Info */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-600">Connected timeline shows sentiment evolution</p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-600">Hover over points for detailed information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};