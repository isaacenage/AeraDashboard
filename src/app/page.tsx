'use client';

import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaCheckCircle, FaFileAlt, FaBroom } from 'react-icons/fa';
import Navigation from '@/components/Navigation';
import MetricCard from '@/components/MetricCard';
import DashboardCharts from '@/components/DashboardCharts';
import LotAvailabilityTable from '@/components/LotAvailabilityTable';
import dynamic from 'next/dynamic';

const InfusionGauge = dynamic(() => import('@/components/charts/InfusionGauge'), { ssr: false });

import { 
  LandbankData, 
  fetchLandbankData, 
  calculateMetrics,
  AGREEMENT_AREAS,
  CHART_COLORS,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-soft)] text-xl animate-pulse glow-text">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--neon-aqua)] text-xl glow-text">Error: {error}</div>
      </div>
    );
  }

  const metrics = calculateMetrics(data);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title */}
        <h1 className="text-[var(--text-soft)] text-4xl font-bold mb-12 text-center glow-text tracking-wide">
          AKL Landbank Dashboard
        </h1>

        {/* Metrics Grid */}
        <div id="cards-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard 
            title="Total Lots" 
            value={metrics.lotCount} 
            icon={<FaMapMarkerAlt className="text-2xl" />} 
            type="total-lots" 
          />
          <MetricCard 
            title="Infused Lots" 
            value={metrics.infusedLots} 
            icon={<FaCheckCircle className="text-2xl" />} 
            type="infused-lots" 
          />
          <MetricCard 
            title="AKL-Owned Titles" 
            value={metrics.aklOwnedTitles} 
            icon={<FaFileAlt className="text-2xl" />} 
            type="akl-owned" 
          />
          <MetricCard 
            title="Lots for Clean-Up" 
            value={metrics.lotsForCleanup} 
            icon={<FaBroom className="text-2xl" />} 
            type="cleanup" 
          />
        </div>

        {/* Lot Availability Table */}
        <div className="glass-card mb-12">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-soft)] glow-text tracking-wide">Lot Availability</h2>
          <LotAvailabilityTable 
            data={data} 
            onRowClick={(group) => setSelectedGroup(group === selectedGroup ? null : group)} 
          />
        </div>

        {/* Infusion Progress Gauges */}
        <div className="glass-card mb-12">
          <h2 className="text-2xl font-bold mb-8 text-[var(--text-soft)] text-center glow-text tracking-wide">
            Infusion Progress by Land Group
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Royal Asia Land */}
            <div className="glass-card-hover">
              <InfusionGauge
                label="RALI JVA"
                percentage={(data
                  .filter(row => row['LAND GROUP'] === 'RALI')
                  .reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0) / 936.45) * 100}
                color={CHART_COLORS.primary}
              />
            </div>
            
            {/* Manila Jockey Club */}
            <div className="glass-card-hover">
              <InfusionGauge
                label="MJCI MoA"
                percentage={(data
                  .filter(row => row['LAND GROUP'] === 'MJCI')
                  .reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0) / 60.8712) * 100}
                color={CHART_COLORS.primary}
              />
            </div>
            
            {/* Congressman Roy Loyola */}
            <div className="glass-card-hover">
              <InfusionGauge
                label="CRL MoA"
                percentage={(data
                  .filter(row => row['LAND GROUP'] === 'CARMONA GAP')
                  .reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0) / 164.509) * 100}
                color={CHART_COLORS.primary}
              />
            </div>
            
            {/* Dionido */}
            <div className="glass-card-hover">
              <InfusionGauge
                label="Dionido MoA"
                percentage={(data
                  .filter(row => row['LAND GROUP'] === 'SILANG GAP')
                  .reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0) / 60.0) * 100}
                color={CHART_COLORS.primary}
              />
            </div>
          </div>
        </div>

        {/* Dashboard Charts */}
        <div className="glass-card">
          <DashboardCharts data={data} />
        </div>
      </main>
    </div>
  );
} 