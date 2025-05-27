'use client';

import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaCheckCircle, FaFileAlt, FaBroom } from 'react-icons/fa';
import Navigation from '@/components/Navigation';
import MetricCard from '@/components/MetricCard';
import DashboardCharts from '@/components/DashboardCharts';
import LotAvailabilityTable from '@/components/LotAvailabilityTable';
import { 
  LandbankData, 
  fetchLandbankData, 
  calculateMetrics,
} from '@/utils/csvUtils';

export default function Dashboard() {
  const [data, setData] = useState<LandbankData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const landbankData = await fetchLandbankData();
        if (landbankData.length === 0) {
          throw new Error('No data found in the CSV file');
        }
        setData(landbankData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(0,49,59)] flex items-center justify-center">
        <div className="text-white text-xl">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(0,49,59)] flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  const metrics = calculateMetrics(data);

  return (
    <div className="min-h-screen bg-[rgb(0,49,59)]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-white text-2xl font-bold mb-8 text-center">
          AKL Landbank Dashboard
        </h1>

        {/* Metrics Grid */}
        <div id="cards-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            title="Total Lots" 
            value={metrics.lotCount} 
            icon={<FaMapMarkerAlt />} 
            type="total-lots" 
          />
          <MetricCard 
            title="Infused Lots" 
            value={metrics.infusedLots} 
            icon={<FaCheckCircle />} 
            type="infused-lots" 
          />
          <MetricCard 
            title="AKL-Owned Titles" 
            value={metrics.aklOwnedTitles} 
            icon={<FaFileAlt />} 
            type="akl-owned" 
          />
          <MetricCard 
            title="Lots for Clean-Up" 
            value={metrics.lotsForCleanup} 
            icon={<FaBroom />} 
            type="cleanup" 
          />
        </div>

        {/* Lot Availability Table */}
        <div className="mb-8">
          <LotAvailabilityTable 
            data={data} 
            onRowClick={(group) => setSelectedGroup(group === selectedGroup ? null : group)} 
          />
        </div>

        {/* Dashboard Charts */}
        <div className="mb-8">
          <DashboardCharts data={data} />
        </div>
      </main>
    </div>
  );
} 