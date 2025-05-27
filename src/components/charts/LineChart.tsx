'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }[];
  };
  title: string;
  height?: number;
}

export default function LineChart({ data, title, height = 300 }: LineChartProps) {
  const options: ChartOptions<'line'> = {
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
        ticks: { color: '#C8C2AE' },
        grid: { color: '#C8C2AE33' },
      },
      x: {
        ticks: { color: '#C8C2AE' },
        grid: { color: '#C8C2AE33' },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line options={options} data={data} />
    </div>
  );
} 