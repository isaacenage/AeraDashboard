'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
    }[];
  };
  title: string;
  height?: number;
  stacked?: boolean;
}

export default function BarChart({ data, title, height = 300, stacked = false }: BarChartProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        color: '#C8C2AE',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        stacked,
        ticks: { color: '#C8C2AE' },
        grid: { color: '#C8C2AE33' },
      },
      x: {
        stacked,
        ticks: { color: '#C8C2AE' },
        grid: { color: '#C8C2AE33' },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar options={options} data={data} />
    </div>
  );
} 