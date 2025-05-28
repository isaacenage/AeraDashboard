'use client';

import React from 'react';
import { IconType } from 'react-icons';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactElement<IconType>;
  type: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, type }) => {
  const getIconColor = () => {
    switch (type) {
      case 'total-lots':
        return 'text-[var(--neon-aqua)]';
      case 'infused-lots':
        return 'text-[var(--neon-yellow)]';
      case 'akl-owned':
        return 'text-[var(--neon-blue)]';
      case 'cleanup':
        return 'text-[var(--neon-aqua)]';
      default:
        return 'text-[var(--neon-aqua)]';
    }
  };

  return (
    <div className="metric-card group">
      <div className={`mb-4 transform group-hover:scale-110 transition-transform duration-300 ${getIconColor()}`}>
        {icon}
      </div>
      <h3 className="text-[var(--text-soft)] text-lg font-medium mb-2 tracking-wide">{title}</h3>
      <p className="text-[var(--text-muted)] text-3xl font-bold glow-text">
        {value.toLocaleString()}
      </p>
    </div>
  );
};

export default MetricCard; 