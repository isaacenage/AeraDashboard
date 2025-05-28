'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { FaMapMarkerAlt, FaFileContract, FaBalanceScale, FaCheckCircle } from 'react-icons/fa';

const MetricCard = dynamic(() => import('@/components/MetricCard'), { ssr: false });
const InfusionGauge = dynamic(() => import('@/components/charts/InfusionGauge'), { ssr: false });
const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });

import { 
  LandbankData, 
  fetchLandbankData, 
  formatNumber, 
  groupByField,
  CHART_COLORS,
  AGREEMENT_AREAS
} from '@/utils/csvUtils';

export default function MJCIPage() {
  const [data, setData] = useState<LandbankData[]>([]);
  const [metrics, setMetrics] = useState({
    totalMJCILots: 0,
    totalMJCIArea: 0,
    infusedMJCILots: 0,
    infusedMJCIArea: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const landbankData = await fetchLandbankData();
        const mjciLots = landbankData?.filter(row => 
          row['AGREEMENT GROUP'] === 'Manila Jockey Club'
        ) ?? [];
        setData(mjciLots);
        
        // Calculate MJCI-specific metrics
        setMetrics({
          totalMJCILots: mjciLots.length,
          totalMJCIArea: mjciLots?.reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0) ?? 0,
          infusedMJCILots: mjciLots?.filter(row => row['INFUSION AREA (HA)'] > 0).length ?? 0,
          infusedMJCIArea: mjciLots?.reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0) ?? 0,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const mjciByStatus = groupByField(data, 'LOT AVAILABILITY STATUS', 'AREA (HA)');
  const mjciByGISStatus = groupByField(data, 'GIS STATUS', 'AREA (HA)');

  return (
    <div className="min-h-screen bg-[rgb(0,49,59)]">
      <Navigation />
      
      <main className="p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#34E4EA]">MJCI Properties</h1>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Total MJCI Lots" 
              value={metrics.totalMJCILots} 
              icon={<FaMapMarkerAlt />} 
              type="total-lots" 
            />
            <MetricCard 
              title="Total MJCI Area" 
              value={metrics.totalMJCIArea} 
              suffix="ha" 
              icon={<FaBalanceScale />} 
              type="total-area" 
            />
            <MetricCard 
              title="Infused MJCI Lots" 
              value={metrics.infusedMJCILots} 
              icon={<FaCheckCircle />} 
              type="infused-lots" 
            />
            <MetricCard 
              title="Infused MJCI Area" 
              value={metrics.infusedMJCIArea} 
              suffix="ha" 
              icon={<FaFileContract />} 
              type="infused-area" 
            />
          </div>

          {/* Infusion Progress Gauge */}
          <div className="max-w-md mx-auto mb-8">
            <InfusionGauge
              label="MJCI MOA"
              percentage={(metrics.infusedMJCIArea / AGREEMENT_AREAS['Manila Jockey Club']) * 100}
              color={CHART_COLORS.primary}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart: MJCI Lots by Status */}
            <BarChart
              data={{
                labels: mjciByStatus.labels,
                datasets: [{
                  label: 'Area (Ha)',
                  data: mjciByStatus.values,
                  backgroundColor: CHART_COLORS.primary,
                }],
              }}
              title="MJCI Lots by Status"
            />

            {/* Pie Chart: MJCI Lots by GIS Status */}
            <PieChart
              data={{
                labels: mjciByGISStatus.labels,
                datasets: [{
                  label: 'Area Distribution',
                  data: mjciByGISStatus.values,
                  backgroundColor: [
                    CHART_COLORS.primary,
                    CHART_COLORS.secondary,
                    CHART_COLORS.tertiary,
                    CHART_COLORS.neutral,
                  ],
                }],
              }}
              title="MJCI Lots by GIS Status"
            />
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-[rgb(0,35,42)] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-[#34E4EA]">MJCI Agreement Details</h2>
            <div className="text-[#C8C2AE] space-y-4">
              <p>
                Key points of the MJCI Memorandum of Agreement:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Total agreement area: 60.8712 hectares</li>
                <li>Properties located in strategic areas of Aera Estate</li>
                <li>Integration with overall masterplan development</li>
                <li>Specific development guidelines and restrictions</li>
              </ul>
              <p>
                Current focus areas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Completion of property documentation</li>
                <li>Technical validation of boundaries</li>
                <li>Integration with existing infrastructure plans</li>
                <li>Coordination with MJCI for development timelines</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 