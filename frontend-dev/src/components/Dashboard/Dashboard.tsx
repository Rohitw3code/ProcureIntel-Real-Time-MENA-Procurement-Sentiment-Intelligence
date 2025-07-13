import React from 'react';
import { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { CompactMetricsGrid } from './CompactMetricsGrid';
import { CompanySearch } from './CompanySearch';
import { CompanySentimentSummary } from './CompanySentimentSummary';
import { TenderSection } from './TenderSection';
import { CompanyAnalysisPage } from '../CompanyAnalysis/CompanyAnalysisPage';

export const Dashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSearchStateChange = (searched: boolean) => {
    setHasSearched(searched);
  };

  const handleCompanyClick = (companyName: string) => {
    setSelectedCompany(companyName);
  };

  const handleBackToDashboard = () => {
    setSelectedCompany(null);
  };

  // If a company is selected, show the analysis page
  if (selectedCompany) {
    return (
      <CompanyAnalysisPage 
        companyName={selectedCompany} 
        onBack={handleBackToDashboard} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRefresh={handleRefresh} />
      <CompactMetricsGrid key={refreshKey} />
      
{/* Two Column Layout with 70/30 split */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
    {/* Left Column: Sentiment + Search */}
    <div className="flex flex-col gap-8">
      <div>
        <CompanySentimentSummary isVisible={!hasSearched} />
      </div>
      <div>
        <CompanySearch 
          onSearchStateChange={handleSearchStateChange} 
          onCompanyClick={handleCompanyClick}
        />
      </div>
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