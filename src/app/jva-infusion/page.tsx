'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const MetricCard = dynamic(() => import('@/components/MetricCard'), { ssr: false });
const InfusionGauge = dynamic(() => import('@/components/charts/InfusionGauge'), { ssr: false });
const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });

import { 
  LandbankData, 
  fetchLandbankData, 
  formatNumber, 
  calculateMetrics,
  groupByYear,
  groupByField,
  CHART_COLORS,
  AGREEMENT_AREAS
} from '@/utils/csvUtils';

export default function JVAInfusionPage() {
  const [data, setData] = useState<LandbankData[]>([]);
  const [metrics, setMetrics] = useState({
    totalJVALots: 0,
    infusedJVALots: 0,
    totalJVAArea: 0,
    infusedJVAArea: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const landbankData = await fetchLandbankData();
        const jvaData = landbankData.filter(row => 
          row['AGREEMENT GROUP'] === 'Royal Asia Land'
        );
        setData(jvaData);
        
        // Calculate JVA-specific metrics
        setMetrics({
          totalJVALots: jvaData.length,
          infusedJVALots: jvaData.filter(row => row['INFUSION AREA (HA)'] > 0).length,
          totalJVAArea: jvaData.reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0),
          infusedJVAArea: jvaData.reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0),
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const infusionByYear = groupByYear(data, 'INFUSION AREA (HA)');
  const infusionByStatus = groupByField(data, 'LOT AVAILABILITY STATUS', 'INFUSION AREA (HA)');

  return (
    <div className="min-h-screen bg-[rgb(0,49,59)]">
      <Navigation />
      
      <main className="p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#34E4EA]">JVA Infusion Progress</h1>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Total JVA Lots" 
              value={metrics.totalJVALots} 
              icon={<FaMapMarkerAlt />} 
              type="total-lots" 
            />
            <MetricCard 
              title="Infused JVA Lots" 
              value={metrics.infusedJVALots} 
              icon={<FaCheckCircle />} 
              type="infused-lots" 
            />
            <MetricCard 
              title="Total JVA Area" 
              value={metrics.totalJVAArea} 
              suffix="ha" 
              type="total-area" 
            />
            <MetricCard 
              title="Infused JVA Area" 
              value={metrics.infusedJVAArea} 
              suffix="ha" 
              type="infused-area" 
            />
          </div>

          {/* Infusion Progress Gauge */}
          <div className="max-w-md mx-auto mb-8">
            <InfusionGauge
              label="Royal Asia Land JVA"
              percentage={(metrics.infusedJVAArea / AGREEMENT_AREAS['Royal Asia Land']) * 100}
              color={CHART_COLORS.primary}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart: JVA Lot Infusion Per Year */}
            <LineChart
              data={{
                labels: infusionByYear.labels,
                datasets: [{
                  label: 'Infusion Area (Ha)',
                  data: infusionByYear.values,
                  borderColor: CHART_COLORS.primary,
                  backgroundColor: CHART_COLORS.primary + '33',
                }],
              }}
              title="JVA Lot Infusion Per Year"
            />

            {/* Bar Chart: Infusion by Lot Status */}
            <BarChart
              data={{
                labels: infusionByStatus.labels,
                datasets: [{
                  label: 'Infusion Area (Ha)',
                  data: infusionByStatus.values,
                  backgroundColor: CHART_COLORS.secondary,
                }],
              }}
              title="Infusion by Lot Status"
            />
          </div>
        </div>
      </main>
    </div>
  );
} 