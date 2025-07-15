import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AlertTriangle, Shield, TrendingUp, Calendar } from 'lucide-react';
import { CompanyRiskFactors } from '../../services/api';

interface RiskFactorsChartProps {
  riskData: CompanyRiskFactors;
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  timestamp: number;
  [riskType: string]: string | number;
}

export const RiskFactorsChart: React.FC<RiskFactorsChartProps> = ({ riskData }) => {
  // Process risk data into chart format
  const processChartData = (): ChartDataPoint[] => {
    const chartData: ChartDataPoint[] = [];
    
    const sortedDates = Object.entries(riskData.risk_counts_by_date)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    
    const allRiskTypes = new Set<string>();
    sortedDates.forEach(([, risks]) => {
      Object.keys(risks).forEach(riskType => allRiskTypes.add(riskType));
    });
    
    sortedDates.forEach(([date, risks]) => {
      const dataPoint: ChartDataPoint = {
        date,
        formattedDate: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        timestamp: new Date(date).getTime()
      };
      
      allRiskTypes.forEach(riskType => {
        dataPoint[riskType] = risks[riskType] || 0;
      });
      
      chartData.push(dataPoint);
    });
    
    return chartData;
  };

  const chartData = processChartData();
  
  const riskTypes = Array.from(new Set(
    Object.values(riskData.risk_counts_by_date)
      .flatMap(risks => Object.keys(risks))
  ));

  // Color palette avoiding black
  const riskColors: Record<string, string> = {
    'Trade Barrier': '#ef4444', // Red
    'Supply Disruption': '#f59e0b', // Amber
    'Compliance': '#10b981', // Emerald
    'Financial': '#3b82f6', // Blue
    'Reputational': '#ec4899' // Pink
  };

  const getRiskColor = (riskType: string) => {
    return riskColors[riskType] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
  };

  const totalRiskCounts = riskTypes.reduce((acc, riskType) => {
    acc[riskType] = chartData.reduce((sum, point) => sum + (point[riskType] as number), 0);
    return acc;
  }, {} as Record<string, number>);

  // Custom tooltip with refined styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <p className="font-semibold text-gray-700 text-sm">
              {new Date(data.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="space-y-2">
            {riskTypes.map(riskType => {
              const count = data[riskType] as number;
              if (count > 0) {
                return (
                  <div key={riskType} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full transition-transform hover:scale-125" 
                        style={{ backgroundColor: getRiskColor(riskType) }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{riskType}</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: getRiskColor(riskType) }}>
                      {count}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Risk Factors Over Time</h2>
              <p className="text-sm text-gray-500">Visualize risk trends with clarity</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(totalRiskCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([riskType, count]) => (
                <div key={riskType} className="text-center">
                  <div className="flex items-center justify-center space-x-1.5">
                    <div 
                      className="w-3 h-3 rounded-full transition-transform hover:scale-125" 
                      style={{ backgroundColor: getRiskColor(riskType) }}
                    ></div>
                    <span className="text-xs font-medium text-gray-600 truncate">{riskType}</span>
                  </div>
                  <p className="text-lg font-bold tracking-tight" style={{ color: getRiskColor(riskType) }}>
                    {count}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {chartData.length > 0 ? (
          <div className="h-80 lg:h-96 animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ 
                  top: 20, 
                  right: 30, 
                  bottom: 80, 
                  left: 20 
                }}
              >
                <defs>
                  {riskTypes.map(riskType => (
                    <linearGradient key={riskType} id={`gradient-${riskType}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getRiskColor(riskType)} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={getRiskColor(riskType)} stopOpacity={0.4}/>
                    </linearGradient>
                  ))}
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="4 4" 
                  stroke="#d1d5db" // Gray-300 instead of black
                  strokeOpacity={1}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="formattedDate"
                  stroke="#4b5563" // Gray-600 instead of black
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: '#4b5563', fontWeight: 500 }} // Gray-600
                />
                
                <YAxis 
                  stroke="#4b5563" // Gray-600 instead of black
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#4b5563', fontWeight: 500 }}
                  label={{ 
                    value: 'Risk Count', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#4b5563', fontSize: '13px', fontWeight: 600 }
                  }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '30px', fontSize: '13px', color: '#4b5563' }} // Gray-600
                  iconType="circle"
                  iconSize={10}
                />
                
                {riskTypes.map((riskType, index) => (
                  <Bar
                    key={`bar-${riskType}`}
                    dataKey={riskType}
                    fill={`url(#gradient-${riskType})`}
                    stroke={getRiskColor(riskType)}
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                    name={riskType}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
                
                {riskTypes.map((riskType, index) => (
                  <Line
                    key={`line-${riskType}`}
                    type="monotone"
                    dataKey={riskType}
                    stroke={getRiskColor(riskType)}
                    strokeWidth={2.5}
                    dot={{ 
                      r: 5, 
                      fill: getRiskColor(riskType),
                      stroke: '#f3f4f6', // Gray-100 instead of white for contrast
                      strokeWidth: 2
                    }}
                    activeDot={{ 
                      r: 7, 
                      fill: getRiskColor(riskType),
                      stroke: '#f3f4f6', // Gray-100
                      strokeWidth: 2,
                      style: { filter: `drop-shadow(0 4px 12px ${getRiskColor(riskType)}50)` }
                    }}
                    connectNulls={false}
                    name={`${riskType} Trend`}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Risk Data Available</h3>
              <p className="text-sm text-gray-500">No risk factors recorded for this company</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Summary */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 animate-fade-in">
          {/* Risk Type Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(totalRiskCounts)
              .sort(([,a], [,b]) => b - a)
              .map(([riskType, count]) => (
                <div 
                  key={riskType} 
                  className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full transition-transform hover:scale-125" 
                      style={{ backgroundColor: getRiskColor(riskType) }}
                    ></div>
                    <p className="text-sm font-semibold text-gray-700 truncate">{riskType}</p>
                  </div>
                  <p className="text-xl font-bold tracking-tight" style={{ color: getRiskColor(riskType) }}>
                    {count}
                  </p>
                  <p className="text-xs text-gray-500">
                    {chartData.length > 0 ? (count / chartData.length).toFixed(1) : '0'} avg/day
                  </p>
                </div>
              ))}
          </div>
          
          {/* Chart Features Info */}
          <div className="pt-4 border-t border-indigo-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                <p className="text-xs font-medium text-gray-600">Bars show daily risk counts</p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                <p className="text-xs font-medium text-gray-600">Lines show risk trends over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};