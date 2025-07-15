import React from 'react';
import { BarChart3, Activity, CheckCircle, XCircle, AlertCircle, Square } from 'lucide-react';
import { PipelineRun, PipelineStatusResponse } from '../../../services/dev_api';

interface MonitoringTabProps {
  pipelineRuns: PipelineRun[];
  selectedPipelineId: number | null;
  pipelineStatus: PipelineStatusResponse | null;
  onPipelineSelect: (id: number) => void;
}

export const MonitoringTab: React.FC<MonitoringTabProps> = ({
  pipelineRuns,
  selectedPipelineId,
  pipelineStatus,
  onPipelineSelect
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'STOPPED':
        return <Square className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'STOPPED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCost = (cost: number) => {
    return `$${(cost || 0).toFixed(4)}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Pipeline Monitoring</h2>
      </div>
      
      <div className="space-y-6">
        {/* Pipeline Runs List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Pipeline Runs</h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Results
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pipelineRuns.slice(0, 10).map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => onPipelineSelect(run.id)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedPipelineId === run.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{run.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(run.status)}`}>
                        {getStatusIcon(run.status)}
                        <span className="ml-1">{run.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(run.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {run.end_time ? (
                        `${Math.round((new Date(run.end_time).getTime() - new Date(run.start_time).getTime()) / 1000)}s`
                      ) : (
                        'Running...'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>Links: {run.new_links_found}</div>
                        <div>Articles: {run.articles_scraped}</div>
                        <div>Analyzed: {run.articles_analyzed}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCost(run.total_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Pipeline Details */}
        {pipelineStatus && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pipeline #{pipelineStatus.id} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Links Found</div>
                <div className="text-2xl font-bold text-blue-600">{pipelineStatus.new_links_found}</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Articles Scraped</div>
                <div className="text-2xl font-bold text-emerald-600">{pipelineStatus.articles_scraped}</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Articles Analyzed</div>
                <div className="text-2xl font-bold text-purple-600">{pipelineStatus.articles_analyzed}</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Total Cost</div>
                <div className="text-2xl font-bold text-orange-600">{formatCost(pipelineStatus.total_cost)}</div>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-2">Details</div>
              <div className="text-sm text-gray-700">
                {typeof pipelineStatus.details === 'object' 
                  ? pipelineStatus.details.message 
                  : pipelineStatus.details}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};