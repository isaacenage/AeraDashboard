'use client';

import React from 'react';
import { IconType } from 'react-icons';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  type: 'total-lots' | 'infused-lots' | 'akl-owned' | 'cleanup';
  suffix?: string;
}

export default function MetricCard({ title, value, icon, type, suffix }: MetricCardProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'total-lots':
        return 'bg-[#1E3D59]';
      case 'infused-lots':
        return 'bg-[#2B4141]';
      case 'akl-owned':
        return 'bg-[#34495E]';
      case 'cleanup':
        return 'bg-[#2C3E50]';
      default:
        return 'bg-[#1E3D59]';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'total-lots':
        return 'text-[#34E4EA]';
      case 'infused-lots':
        return 'text-[#4ECDC4]';
      case 'akl-owned':
        return 'text-[#3498DB]';
      case 'cleanup':
        return 'text-[#E74C3C]';
      default:
        return 'text-[#34E4EA]';
    }
  };

  return (
    <div className={`${getBackgroundColor()} rounded-lg shadow-lg p-6 flex items-start h-full print:bg-white print:shadow-none print:border print:border-black`}>
      <div className="flex items-start w-full print:flex-col print:items-center print:justify-center print:gap-2">
        <div className={`${getIconColor()} text-2xl flex-shrink-0 mr-3 mt-1 print:text-black print:mt-0 print:mr-0`}>
          {icon}
        </div>
        <div className="card-text flex flex-col flex-grow min-w-0">
          <h3 className="text-[#C8C2AE] text-base font-medium mb-2 truncate print:text-black print:truncate-none print:whitespace-normal print:break-words print:text-center">
            {title}
          </h3>
          <p className="text-white text-3xl font-bold print:text-black print:text-2xl print:text-center">
            {value.toLocaleString()}{suffix ? ` ${suffix}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
} 