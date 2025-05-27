'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

interface InfusionGaugeProps {
  label: string;
  percentage: number;
  color: string;
}

export default function InfusionGauge({ label, percentage, color }: InfusionGaugeProps) {
  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, '#2B4141'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="flex flex-col items-center p-4 bg-[rgb(0,35,42)] rounded-lg h-48">
      <h3 className="text-lg font-semibold mb-4 text-[#C8C2AE] text-center">{label}</h3>
      <div className="relative flex-1 w-full flex flex-col items-center">
        <div className="h-28 w-full">
          <Doughnut data={data} options={options} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-[#34E4EA]">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
} 