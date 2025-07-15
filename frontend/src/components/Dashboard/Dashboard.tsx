import React from 'react';
import { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { CompactMetricsGrid } from './CompactMetricsGrid';
import { CompanySearch } from './CompanySearch';
import { CompanySentimentSummary } from './CompanySentimentSummary';
import { TenderSection } from './TenderSection';
import { CompanyAnalysisPage } from '../CompanyAnalysis/CompanyAnalysisPage';
import { CompanyTimelinePage } from '../CompanyTimeline/CompanyTimelinePage';

export const Dashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<{id: string, name: string} | null>(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCompanyDetailsClick = (companyId: string, companyName: string) => {
    setSelectedCompanyDetails({ id: companyId, name: companyName });
  };

  const handleBackToDashboard = () => {
    setSelectedCompanyDetails(null);
  };

  // If company details are selected, show the analysis page
  if (selectedCompanyDetails) {
    return (
      <CompanyAnalysisPage 
        companyId={selectedCompanyDetails.id}
        companyName={selectedCompanyDetails.name}
        onBack={handleBackToDashboard} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRefresh={handleRefresh} />
      <CompactMetricsGrid key={refreshKey} />
      
      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
          {/* Left Column: Company Search + Company Sentiment */}
          <div className="space-y-8">
            {/* Featured Companies Section - Always Visible */}
            <CompanySentimentSummary 
              isVisible={true} 
              onCompanyDetailsClick={handleCompanyDetailsClick}
            />
            
            {/* Company Search Section */}
            <CompanySearch 
              onCompanyDetailsClick={handleCompanyDetailsClick}
            />
          </div>

          {/* Right Column: Tender Section */}
          <div className="h-[800px]">
            <TenderSection isVisible={true} />
          </div>
        </div>
      </div>
    </div>
  );
};