'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { FaBroom, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const MetricCard = dynamic(() => import('@/components/MetricCard'), { ssr: false });
const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });

import { 
  LandbankData, 
  fetchLandbankData, 
  formatNumber, 
  groupByField,
  CHART_COLORS,
} from '@/utils/csvUtils';

export default function CleanUpPage() {
  const [data, setData] = useState<LandbankData[]>([]);
  const [metrics, setMetrics] = useState({
    totalLotsForCleanup: 0,
    cleanedLots: 0,
    pendingCleanup: 0,
    totalCleanupArea: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const landbankData = await fetchLandbankData();
        setData(landbankData);
        
        // Calculate clean-up specific metrics
        const cleanupLots = landbankData.filter(row => row['TO BE MAPPED'] > 0);
        setMetrics({
          totalLotsForCleanup: cleanupLots.length,
          cleanedLots: landbankData.filter(row => row['MAPPED PARCELS'] > 0).length,
          pendingCleanup: cleanupLots.length,
          totalCleanupArea: cleanupLots.reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0),
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const cleanupByStatus = groupByField(data, 'GIS STATUS', 'AREA (HA)');
  const cleanupByGroup = groupByField(data, 'AGREEMENT GROUP', 'TO BE MAPPED');

  return (
    <div className="min-h-screen bg-[rgb(0,49,59)]">
      <Navigation />
      
      <main className="p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#34E4EA]">Clean-Up Progress</h1>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Total Lots for Clean-Up" 
              value={metrics.totalLotsForCleanup} 
              icon={<FaBroom />} 
              type="cleanup" 
            />
            <MetricCard 
              title="Cleaned Lots" 
              value={metrics.cleanedLots} 
              icon={<FaCheckCircle />} 
              type="infused-lots" 
            />
            <MetricCard 
              title="Pending Clean-Up" 
              value={metrics.pendingCleanup} 
              icon={<FaExclamationTriangle />} 
              type="total-lots" 
            />
            <MetricCard 
              title="Total Clean-Up Area" 
              value={metrics.totalCleanupArea} 
              suffix="ha" 
              icon={<FaMapMarkerAlt />} 
              type="total-area" 
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart: Clean-Up Status Distribution */}
            <BarChart
              data={{
                labels: cleanupByStatus.labels,
                datasets: [{
                  label: 'Area (Ha)',
                  data: cleanupByStatus.values,
                  backgroundColor: CHART_COLORS.primary,
                }],
              }}
              title="Clean-Up Status Distribution"
            />

            {/* Pie Chart: Clean-Up Requirements by Agreement Group */}
            <PieChart
              data={{
                labels: cleanupByGroup.labels,
                datasets: [{
                  label: 'Lots to be Mapped',
                  data: cleanupByGroup.values,
                  backgroundColor: [
                    CHART_COLORS.primary,
                    CHART_COLORS.secondary,
                    CHART_COLORS.tertiary,
                    CHART_COLORS.neutral,
                  ],
                }],
              }}
              title="Clean-Up Requirements by Agreement Group"
            />
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-[rgb(0,35,42)] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-[#34E4EA]">Clean-Up Guidelines</h2>
            <div className="text-[#C8C2AE] space-y-4">
              <p>
                Clean-up activities involve the following steps:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verification of lot boundaries and technical descriptions</li>
                <li>Resolution of overlapping claims and boundary disputes</li>
                <li>Updating of GIS mapping data</li>
                <li>Documentation of clean-up activities and results</li>
              </ul>
              <p>
                Priority is given to lots that are:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Part of immediate development plans</li>
                <li>Located in strategic areas</li>
                <li>Subject to ongoing negotiations or agreements</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 