'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { FaMapMarkerAlt, FaHandshake, FaFileContract, FaBalanceScale } from 'react-icons/fa';

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

export default function ExternalGapLotsPage() {
  const [data, setData] = useState<LandbankData[]>([]);
  const [metrics, setMetrics] = useState({
    totalGapLots: 0,
    totalGapArea: 0,
    moaSignedLots: 0,
    moaSignedArea: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const landbankData = await fetchLandbankData();
        const gapLots = landbankData?.filter(row => 
          row['LOT AVAILABILITY STATUS']?.includes('GAP') ||
          row['LOT AVAILABILITY STATUS']?.includes('MOA')
        ) ?? [];
        setData(gapLots);
        
        // Calculate gap lots specific metrics
        const moaLots = gapLots?.filter(row => 
          row['LOT AVAILABILITY STATUS']?.includes('MOA')
        ) ?? [];
        
        setMetrics({
          totalGapLots: gapLots.length,
          totalGapArea: gapLots?.reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0) ?? 0,
          moaSignedLots: moaLots.length,
          moaSignedArea: moaLots?.reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0) ?? 0,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const gapLotsByLocation = groupByField(data, 'LOT AVAILABILITY STATUS', 'AREA (HA)');
  const gapLotsByStatus = groupByField(data, 'GIS STATUS', 'AREA (HA)');

  return (
    <div className="min-h-screen bg-[rgb(0,49,59)]">
      <Navigation />
      
      <main className="p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#34E4EA]">External Gap Lots</h1>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Total Gap Lots" 
              value={metrics.totalGapLots} 
              icon={<FaMapMarkerAlt />} 
              type="total-lots" 
            />
            <MetricCard 
              title="Total Gap Area" 
              value={metrics.totalGapArea} 
              suffix="ha" 
              icon={<FaBalanceScale />} 
              type="total-area" 
            />
            <MetricCard 
              title="MOA Signed Lots" 
              value={metrics.moaSignedLots} 
              icon={<FaFileContract />} 
              type="infused-lots" 
            />
            <MetricCard 
              title="MOA Signed Area" 
              value={metrics.moaSignedArea} 
              suffix="ha" 
              icon={<FaHandshake />} 
              type="infused-area" 
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart: Gap Lots by Location */}
            <BarChart
              data={{
                labels: gapLotsByLocation.labels,
                datasets: [{
                  label: 'Area (Ha)',
                  data: gapLotsByLocation.values,
                  backgroundColor: CHART_COLORS.primary,
                }],
              }}
              title="Gap Lots by Location"
            />

            {/* Pie Chart: Gap Lots by Status */}
            <PieChart
              data={{
                labels: gapLotsByStatus.labels,
                datasets: [{
                  label: 'Area Distribution',
                  data: gapLotsByStatus.values,
                  backgroundColor: [
                    CHART_COLORS.primary,
                    CHART_COLORS.secondary,
                    CHART_COLORS.tertiary,
                    CHART_COLORS.neutral,
                  ],
                }],
              }}
              title="Gap Lots by Status"
            />
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-[rgb(0,35,42)] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-[#34E4EA]">Gap Lots Information</h2>
            <div className="text-[#C8C2AE] space-y-4">
              <p>
                Gap lots are properties that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Are located within the Aera Estate development area</li>
                <li>Are not currently owned by AKL or its partners</li>
                <li>Are strategic for the overall development plan</li>
                <li>May require negotiation or acquisition</li>
              </ul>
              <p>
                Current priorities for gap lots:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Completion of MOA negotiations</li>
                <li>Technical validation of boundaries</li>
                <li>Integration with existing development plans</li>
                <li>Resolution of any ownership or documentation issues</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 