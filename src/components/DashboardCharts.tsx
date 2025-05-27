'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { LandbankData } from '@/utils/csvUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const THEME_COLORS = {
  primary: '#34e4ea',
  secondary: '#3498db',
  tertiary: '#1e3d59',
  accent: '#e74c3c',
  background: '#0f222b',
  text: '#ffffff',
  gridLines: '#1e3d59',
  // Print colors
  printText: '#000000',
  printBackground: '#ffffff',
  printGridLines: '#cccccc',
  printBars: ['#666666', '#999999', '#cccccc', '#eeeeee'],
};

interface DashboardChartsProps {
  data: LandbankData[];
}

// Helper function to get acquisition classes for a group
const getAcquisitionClassesByGroup = (group: string): string[] => {
  switch (group) {
    case 'ALI':
      return ['ALI - CONTROLLED'];
    case 'CARMONA GAP':
      return ['CGAP - MOA ORIGINAL', 'CGAP - MOA ADDITIONAL'];
    case 'SILANG GAP':
      return ['SGAP - MOA ORIGINAL', 'SGAP - MOA ADDITIONAL'];
    case 'MJCI':
      return ['MJCI - MOA ORIGINAL', 'MJCI - MOA ADDITIONAL'];
    case 'RALI':
      return ['AKL - TITLED', 'AKL - DOAS', 'RALI - FOR INFUSION', 'RALI - JVA ADDITIONAL'];
    case 'AKL LOTS':
      return ['AKL - TITLED', 'AKL - DOAS'];
    case 'JVA LOTS':
      return ['RALI - FOR INFUSION', 'RALI - JVA ADDITIONAL'];
    case 'GAP LOTS':
      return [
        'ALI - CONTROLLED',
        'CGAP - MOA ORIGINAL',
        'CGAP - MOA ADDITIONAL',
        'SGAP - MOA ORIGINAL',
        'SGAP - MOA ADDITIONAL',
        'MJCI - MOA ORIGINAL',
        'MJCI - MOA ADDITIONAL'
      ];
    default:
      return [];
  }
};

const defaultPlugins = {
  legend: {
    position: 'bottom' as const,
    align: 'center' as const,
    labels: {
      color: '#ffffff',
      padding: 12,
      font: {
        size: 12,
        weight: 'normal' as const,
        family: 'system-ui, -apple-system, sans-serif',
      },
      usePointStyle: true,
      boxWidth: 12,
      boxHeight: 12,
    },
  },
  tooltip: {
    enabled: true,
    backgroundColor: '#0f222b',
    titleColor: '#ffffff',
    bodyColor: '#ffffff',
    borderColor: '#1e3d59',
    borderWidth: 1,
  },
  title: {
    display: true,
    color: '#ffffff',
    font: {
      size: 14,
      weight: 'normal' as const,
      family: 'system-ui, -apple-system, sans-serif',
    },
    padding: {
      top: 10,
      bottom: 20
    }
  }
};

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const [isPrintMode, setIsPrintMode] = useState(false);
  const chartRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    const mediaQuery = window.matchMedia('print');
    const handlePrintChange = (e: MediaQueryListEvent) => {
      setIsPrintMode(e.matches);
      updateChartColors(e.matches);
    };

    mediaQuery.addEventListener('change', handlePrintChange);
    setIsPrintMode(mediaQuery.matches);
    updateChartColors(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handlePrintChange);
    };
  }, []);

  const updateChartColors = (isPrinting: boolean) => {
    Object.values(chartRefs.current).forEach((chartRef: any) => {
      if (!chartRef?.current) return;
      
      const chart = chartRef.current;
      
      if (chart.options) {
        // Update legend colors
        if (chart.options.plugins?.legend?.labels) {
          chart.options.plugins.legend.labels.color = isPrinting ? THEME_COLORS.printText : THEME_COLORS.text;
        }
        
        // Update title color
        if (chart.options.plugins?.title) {
          chart.options.plugins.title.color = isPrinting ? THEME_COLORS.printText : THEME_COLORS.text;
        }
        
        // Update axis colors
        if (chart.options.scales) {
          ['x', 'y'].forEach(axis => {
            if (chart.options.scales[axis]) {
              chart.options.scales[axis].ticks.color = isPrinting ? THEME_COLORS.printText : THEME_COLORS.text;
              chart.options.scales[axis].grid.color = isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines;
              chart.options.scales[axis].border.color = isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines;
            }
          });
        }

        // Update dataset colors for print
        if (chart.data?.datasets) {
          chart.data.datasets.forEach((dataset: any, index: number) => {
            if (isPrinting) {
              dataset.backgroundColor = THEME_COLORS.printBars[index % THEME_COLORS.printBars.length];
              if (dataset.borderColor) {
                dataset.borderColor = THEME_COLORS.printText;
              }
            } else {
              // Restore original colors
              dataset.backgroundColor = dataset.originalColor || dataset.backgroundColor;
              dataset.borderColor = dataset.originalBorderColor || dataset.borderColor;
            }
          });
        }

        chart.update('none');
      }
    });
  };

  // Calculate infused area by land group
  const landGroups = ['ALI', 'CARMONA GAP', 'SILANG GAP', 'MJCI', 'RALI'];
  const infusedAreaData = {
    labels: landGroups,
    datasets: [{
      label: 'Infused Area (Ha)',
      data: landGroups.map(group => {
        const classes = getAcquisitionClassesByGroup(group);
        return data
          .filter(row => classes.includes(row['ACQUISITION CLASS'] || ''))
          .reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0);
      }),
      backgroundColor: THEME_COLORS.primary,
      borderColor: 'transparent',
      borderWidth: 1,
    }],
  };

  // Calculate mapped parcels by group
  const groups = ['AKL LOTS', 'JVA LOTS', 'GAP LOTS'];
  const mappedParcelsData = {
    labels: groups,
    datasets: [{
      label: 'Mapped Parcels',
      data: groups.map(group => {
        const classes = getAcquisitionClassesByGroup(group);
        return data
          .filter(row => classes.includes(row['ACQUISITION CLASS'] || '') && 
                        row['GIS STATUS']?.toLowerCase() === 'mapped')
          .length;
      }),
      backgroundColor: THEME_COLORS.secondary,
    }],
  };

  // Calculate AKL ownership breakdown by lot count
  const aklClasses = ['AKL - DOAS', 'AKL - TITLED'];
  const aklOwnershipData = {
    labels: aklClasses,
    datasets: [{
      data: aklClasses.map(cls => 
        data.filter(row => row['ACQUISITION CLASS'] === cls).length
      ),
      backgroundColor: [THEME_COLORS.accent, THEME_COLORS.secondary],
      borderColor: 'transparent',
    }],
  };

  // Calculate group area comparison
  const groupAreaData = {
    labels: groups,
    datasets: [
      {
        label: 'ACTUAL AREA (HA)',
        data: groups.map(group => {
          const classes = getAcquisitionClassesByGroup(group);
          return data
            .filter(row => classes.includes(row['ACQUISITION CLASS'] || ''))
            .reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0);
        }),
        backgroundColor: THEME_COLORS.primary,
      },
      {
        label: 'JVA AREA (HA)',
        data: groups.map(group => {
          const classes = getAcquisitionClassesByGroup(group);
          return data
            .filter(row => classes.includes(row['ACQUISITION CLASS'] || ''))
            .reduce((sum, row) => sum + (row['AGREEMENT AREA (HA)'] || 0), 0);
        }),
        backgroundColor: THEME_COLORS.secondary,
      },
      {
        label: 'INFUSION AREA (HA)',
        data: groups.map(group => {
          const classes = getAcquisitionClassesByGroup(group);
          return data
            .filter(row => classes.includes(row['ACQUISITION CLASS'] || ''))
            .reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0);
        }),
        backgroundColor: THEME_COLORS.accent,
      },
    ],
  };

  const getBarChartOptions = (isPrinting: boolean): ChartOptions<'bar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: isPrinting ? THEME_COLORS.printBackground : THEME_COLORS.background,
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        ...defaultPlugins.legend,
        labels: {
          ...defaultPlugins.legend.labels,
          color: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
        },
      },
      tooltip: {
        ...defaultPlugins.tooltip,
        backgroundColor: isPrinting ? THEME_COLORS.printBackground : THEME_COLORS.background,
        titleColor: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
        bodyColor: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
        borderColor: isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines,
      },
      title: {
        ...defaultPlugins.title,
        color: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
      },
    },
    scales: {
      x: {
        grid: {
          color: isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines,
          lineWidth: 0.5,
        },
        border: {
          color: isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines,
          width: 0.5,
        },
        ticks: {
          color: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
          font: {
            size: 11,
            weight: 'normal' as const,
            family: 'system-ui, -apple-system, sans-serif',
          },
          padding: 5,
        },
      },
      y: {
        grid: {
          color: isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines,
          lineWidth: 0.5,
        },
        border: {
          color: isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines,
          width: 0.5,
        },
        ticks: {
          color: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
          font: {
            size: 11,
            weight: 'normal' as const,
            family: 'system-ui, -apple-system, sans-serif',
          },
          padding: 5,
        },
      },
    },
  });

  const getDoughnutChartOptions = (isPrinting: boolean): ChartOptions<'doughnut'> => ({
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: isPrinting ? THEME_COLORS.printBackground : THEME_COLORS.background,
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          color: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
          padding: 12,
          font: {
            size: 12,
            weight: 'normal' as const,
            family: 'system-ui, -apple-system, sans-serif',
          },
          usePointStyle: true,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: isPrinting ? THEME_COLORS.printBackground : THEME_COLORS.background,
        titleColor: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
        bodyColor: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
        borderColor: isPrinting ? THEME_COLORS.printGridLines : THEME_COLORS.gridLines,
        borderWidth: 1,
      },
      title: {
        display: true,
        color: isPrinting ? THEME_COLORS.printText : THEME_COLORS.text,
        font: {
          size: 14,
          weight: 'normal' as const,
          family: 'system-ui, -apple-system, sans-serif',
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
  });

  return (
    <div className="space-y-4 print:space-y-8 print:bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-8 print:grid-cols-2">
        {/* Infused Area Chart */}
        <div id="infused-area-chart" className="bg-[#0f222b] rounded-lg p-6 h-[400px] print:bg-white print:shadow-none print:border print:border-black">
          <h3 className="text-white text-lg font-semibold mb-4 text-center print:text-black print:font-bold">
            Infused Area by Land Group
          </h3>
          <div className="h-[300px] print:h-[250px]">
            <Bar
              ref={el => chartRefs.current['infusedArea'] = el}
              data={{
                ...infusedAreaData,
                datasets: infusedAreaData.datasets.map((dataset, index) => ({
                  ...dataset,
                  backgroundColor: isPrintMode ? THEME_COLORS.printBars[index % THEME_COLORS.printBars.length] : dataset.backgroundColor,
                })),
              }}
              options={{
                ...getBarChartOptions(isPrintMode),
                indexAxis: 'y' as const,
              }}
            />
          </div>
        </div>

        {/* Mapped Parcels Chart */}
        <div id="mapped-parcels-chart" className="bg-[#0f222b] rounded-lg p-6 h-[400px] print:bg-white print:shadow-none print:border print:border-black">
          <h3 className="text-white text-lg font-semibold mb-4 text-center print:text-black print:font-bold">
            Mapped Parcels per Group
          </h3>
          <div className="h-[300px] print:h-[250px]">
            <Bar
              ref={el => chartRefs.current['mappedParcels'] = el}
              data={{
                ...mappedParcelsData,
                datasets: mappedParcelsData.datasets.map((dataset, index) => ({
                  ...dataset,
                  backgroundColor: isPrintMode ? THEME_COLORS.printBars[index % THEME_COLORS.printBars.length] : dataset.backgroundColor,
                })),
              }}
              options={getBarChartOptions(isPrintMode)}
            />
          </div>
        </div>

        {/* AKL Ownership Breakdown */}
        <div id="akl-ownership-chart" className="bg-[#0f222b] rounded-lg p-6 h-[400px] print:bg-white print:shadow-none print:border print:border-black">
          <h3 className="text-white text-lg font-semibold mb-4 text-center print:text-black print:font-bold">
            AKL Ownership Breakdown
          </h3>
          <div className="h-[300px] print:h-[250px] flex items-center justify-center">
            <Doughnut
              ref={el => chartRefs.current['aklOwnership'] = el}
              data={{
                ...aklOwnershipData,
                datasets: aklOwnershipData.datasets.map((dataset, index) => ({
                  ...dataset,
                  backgroundColor: isPrintMode ? THEME_COLORS.printBars : dataset.backgroundColor,
                })),
              }}
              options={getDoughnutChartOptions(isPrintMode)}
            />
          </div>
        </div>

        {/* Area Comparison Chart */}
        <div id="area-comparison-chart" className="bg-[#0f222b] rounded-lg p-6 h-[400px] print:bg-white print:shadow-none print:border print:border-black">
          <h3 className="text-white text-lg font-semibold mb-4 text-center print:text-black print:font-bold">
            Area Comparison by Group
          </h3>
          <div className="h-[300px] print:h-[250px]">
            <Bar
              ref={el => chartRefs.current['areaComparison'] = el}
              data={{
                ...groupAreaData,
                datasets: groupAreaData.datasets.map((dataset, index) => ({
                  ...dataset,
                  backgroundColor: isPrintMode ? THEME_COLORS.printBars[index % THEME_COLORS.printBars.length] : dataset.backgroundColor,
                })),
              }}
              options={getBarChartOptions(isPrintMode)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 