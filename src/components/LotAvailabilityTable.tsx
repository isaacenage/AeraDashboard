'use client';

import React from 'react';
import { LandbankData } from '@/utils/csvUtils';

interface TableRowProps {
  label: string;
  lotCount: number;
  actualArea: number;
  jvaArea: number;
  infusedArea: number;
  infusionPercent: number;
  mappedParcels: number;
  mappedArea: number;
  toBeMapCount: number;
  toBeMapArea: number;
  isGroup?: boolean;
  isSubGroup?: boolean;
  isTotal?: boolean;
  isNestedGroup?: boolean;
  onClick?: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
  label,
  lotCount,
  actualArea,
  jvaArea,
  infusedArea,
  infusionPercent,
  mappedParcels,
  mappedArea,
  toBeMapCount,
  toBeMapArea,
  isGroup,
  isSubGroup,
  isNestedGroup,
  isTotal,
  onClick,
}) => {
  const baseClasses = "border-b border-gray-700 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer";
  let rowClasses = baseClasses;
  let indentLevel = "px-4";

  if (isGroup) {
    rowClasses += " bg-[#1E3D59] font-bold";
  } else if (isNestedGroup) {
    rowClasses += " bg-[#2B4141] font-semibold";
    indentLevel = "px-6";
  } else if (isSubGroup) {
    indentLevel = isNestedGroup ? "px-8" : "px-6";
  } else if (isTotal) {
    rowClasses += " bg-[#34E4EA] text-[rgb(0,35,42)] font-bold";
  }

  return (
    <tr className={rowClasses} onClick={onClick}>
      <td className={`${indentLevel} py-2`}>{label}</td>
      <td className="px-4 py-2 text-right">{lotCount.toLocaleString()}</td>
      <td className="px-4 py-2 text-right">{actualArea.toFixed(2)}</td>
      <td className="px-4 py-2 text-right">{jvaArea.toFixed(2)}</td>
      <td className="px-4 py-2 text-right">{infusedArea.toFixed(2)}</td>
      <td className="px-4 py-2 text-right">{infusionPercent.toFixed(2)}%</td>
      <td className="px-4 py-2 text-right">{mappedParcels.toLocaleString()}</td>
      <td className="px-4 py-2 text-right">{mappedArea.toFixed(2)}</td>
      <td className="px-4 py-2 text-right">{toBeMapCount.toLocaleString()}</td>
      <td className="px-4 py-2 text-right">{toBeMapArea.toFixed(2)}</td>
    </tr>
  );
};

interface LotAvailabilityTableProps {
  data: LandbankData[];
  onRowClick?: (group: string) => void;
}

const TOTAL_AERA_ESTATE = 1241.25; // Total Aera Estate area in hectares

export default function LotAvailabilityTable({ data, onRowClick }: LotAvailabilityTableProps) {
  const calculateGroupMetrics = (filterFn: (row: LandbankData) => boolean) => {
    const filteredData = data.filter(filterFn);
    const jvaArea = filteredData.reduce((sum, row) => sum + (row['AGREEMENT AREA (HA)'] || 0), 0);
    const infusedArea = filteredData.reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0);
    
    return {
      lotCount: filteredData.length,
      actualArea: filteredData.reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0),
      jvaArea,
      infusedArea,
      infusionPercent: (infusedArea / TOTAL_AERA_ESTATE) * 100,
      mappedParcels: filteredData.filter(row => row['GIS STATUS']?.toLowerCase() === 'mapped').length,
      mappedArea: filteredData.reduce((sum, row) => 
        row['GIS STATUS']?.toLowerCase() === 'mapped' ? sum + (row['AREA (HA)'] || 0) : sum, 0),
      toBeMapCount: filteredData.filter(row => row['GIS STATUS']?.toLowerCase() === 'unmapped').length,
      toBeMapArea: filteredData.reduce((sum, row) => 
        row['GIS STATUS']?.toLowerCase() === 'unmapped' ? sum + (row['AREA (HA)'] || 0) : sum, 0),
    };
  };

  // Helper function to create subtotal metrics
  const createSubtotalMetrics = (childMetrics: ReturnType<typeof calculateGroupMetrics>[]) => {
    const totalInfusedArea = childMetrics.reduce((sum, m) => sum + m.infusedArea, 0);
    return {
      lotCount: childMetrics.reduce((sum, m) => sum + m.lotCount, 0),
      actualArea: childMetrics.reduce((sum, m) => sum + m.actualArea, 0),
      jvaArea: childMetrics.reduce((sum, m) => sum + m.jvaArea, 0),
      infusedArea: totalInfusedArea,
      infusionPercent: (totalInfusedArea / TOTAL_AERA_ESTATE) * 100,
      mappedParcels: childMetrics.reduce((sum, m) => sum + m.mappedParcels, 0),
      mappedArea: childMetrics.reduce((sum, m) => sum + m.mappedArea, 0),
      toBeMapCount: childMetrics.reduce((sum, m) => sum + m.toBeMapCount, 0),
      toBeMapArea: childMetrics.reduce((sum, m) => sum + m.toBeMapArea, 0),
    };
  };

  // AKL LOTS
  const aklDoasMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'AKL - DOAS'
  );
  const aklTitledMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'AKL - TITLED'
  );
  const aklMetrics = createSubtotalMetrics([aklDoasMetrics, aklTitledMetrics]);

  // JVA LOTS
  const raliForInfusionMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'RALI - FOR INFUSION'
  );
  const raliJvaAdditionalMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'RALI - JVA ADDITIONAL'
  );
  const jvaMetrics = createSubtotalMetrics([raliForInfusionMetrics, raliJvaAdditionalMetrics]);

  // ALI
  const aliControlledMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'ALI - CONTROLLED'
  );
  const aliMetrics = aliControlledMetrics; // Direct assignment since it's just one child

  // Carmona Gap Lots
  const carmonaMoaOrigMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'CGAP - MOA ORIGINAL'
  );
  const carmonaMoaAddMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'CGAP - MOA ADDITIONAL'
  );
  const carmonaMetrics = createSubtotalMetrics([carmonaMoaOrigMetrics, carmonaMoaAddMetrics]);

  // Silang Gap Lots
  const silangMoaOrigMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'SGAP - MOA ORIGINAL'
  );
  const silangMoaAddMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'SGAP - MOA ADDITIONAL'
  );
  const silangMetrics = createSubtotalMetrics([silangMoaOrigMetrics, silangMoaAddMetrics]);

  // MJCI
  const mjciMoaOrigMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'MJCI - MOA ORIGINAL'
  );
  const mjciMoaAddMetrics = calculateGroupMetrics(row => 
    row['ACQUISITION CLASS'] === 'MJCI - MOA ADDITIONAL'
  );
  const mjciMetrics = createSubtotalMetrics([mjciMoaOrigMetrics, mjciMoaAddMetrics]);

  // GAP LOTS (sum of all gap categories)
  const gapMetrics = createSubtotalMetrics([aliMetrics, carmonaMetrics, silangMetrics, mjciMetrics]);

  // Total metrics (sum of all top-level categories)
  const totalMetrics = createSubtotalMetrics([aklMetrics, jvaMetrics, gapMetrics]);

  return (
    <div className="overflow-x-auto bg-[rgb(0,35,42)] rounded-lg shadow-lg">
      <table className="min-w-full text-sm text-[#C8C2AE]">
        <thead>
          <tr className="bg-[rgb(0,49,59)] border-b border-gray-700">
            <th className="px-4 py-3 text-left">Lot Availability Status</th>
            <th className="px-4 py-3 text-right">Lot Count</th>
            <th className="px-4 py-3 text-right">Actual Area (Ha)</th>
            <th className="px-4 py-3 text-right">JVA Area (Ha)</th>
            <th className="px-4 py-3 text-right">Infused Area (Ha)</th>
            <th className="px-4 py-3 text-right">% Infusion</th>
            <th className="px-4 py-3 text-right">Mapped Parcels</th>
            <th className="px-4 py-3 text-right">Area (Ha)</th>
            <th className="px-4 py-3 text-right">To Be Mapped</th>
            <th className="px-4 py-3 text-right">Area (Ha)</th>
          </tr>
        </thead>
        <tbody>
          {/* AKL LOTS */}
          <TableRow
            label="AKL LOTS"
            {...aklMetrics}
            isGroup
            onClick={() => onRowClick?.('AKL')}
          />
          <TableRow
            label="AKL - DOAS"
            {...aklDoasMetrics}
            isSubGroup
            onClick={() => onRowClick?.('AKL - DOAS')}
          />
          <TableRow
            label="AKL - TITLED"
            {...aklTitledMetrics}
            isSubGroup
            onClick={() => onRowClick?.('AKL - TITLED')}
          />

          {/* JVA LOTS */}
          <TableRow
            label="JVA LOTS"
            {...jvaMetrics}
            isGroup
            onClick={() => onRowClick?.('JVA')}
          />
          <TableRow
            label="RALI - FOR INFUSION"
            {...raliForInfusionMetrics}
            isSubGroup
            onClick={() => onRowClick?.('RALI - FOR INFUSION')}
          />
          <TableRow
            label="RALI - JVA ADDITIONAL"
            {...raliJvaAdditionalMetrics}
            isSubGroup
            onClick={() => onRowClick?.('RALI - JVA ADDITIONAL')}
          />

          {/* GAP LOTS */}
          <TableRow
            label="GAP LOTS"
            {...gapMetrics}
            isGroup
            onClick={() => onRowClick?.('GAP')}
          />

          {/* Ayala Land Inc. */}
          <TableRow
            label="AYALA LAND INC."
            {...aliMetrics}
            isNestedGroup
            onClick={() => onRowClick?.('ALI')}
          />
          <TableRow
            label="ALI - CONTROLLED"
            {...aliControlledMetrics}
            isSubGroup
            onClick={() => onRowClick?.('ALI - CONTROLLED')}
          />

          {/* Carmona Gap Lots */}
          <TableRow
            label="CARMONA GAP LOTS"
            {...carmonaMetrics}
            isNestedGroup
            onClick={() => onRowClick?.('CARMONA')}
          />
          <TableRow
            label="CGAP - MOA ORIGINAL"
            {...carmonaMoaOrigMetrics}
            isSubGroup
            onClick={() => onRowClick?.('CARMONA - MOA ORIGINAL')}
          />
          <TableRow
            label="CGAP - MOA ADDITIONAL"
            {...carmonaMoaAddMetrics}
            isSubGroup
            onClick={() => onRowClick?.('CARMONA - MOA ADDITIONAL')}
          />

          {/* Silang Gap Lots */}
          <TableRow
            label="SILANG GAP LOTS"
            {...silangMetrics}
            isNestedGroup
            onClick={() => onRowClick?.('SILANG')}
          />
          <TableRow
            label="SGAP - MOA ORIGINAL"
            {...silangMoaOrigMetrics}
            isSubGroup
            onClick={() => onRowClick?.('SILANG - MOA ORIGINAL')}
          />
          <TableRow
            label="SGAP - MOA ADDITIONAL"
            {...silangMoaAddMetrics}
            isSubGroup
            onClick={() => onRowClick?.('SILANG - MOA ADDITIONAL')}
          />

          {/* Manila Jockey Club Inc. */}
          <TableRow
            label="MJCI LOTS"
            {...mjciMetrics}
            isNestedGroup
            onClick={() => onRowClick?.('MJCI')}
          />
          <TableRow
            label="MJCI - MOA ORIGINAL"
            {...mjciMoaOrigMetrics}
            isSubGroup
            onClick={() => onRowClick?.('MJCI - MOA ORIGINAL')}
          />
          <TableRow
            label="MJCI - MOA ADDITIONAL"
            {...mjciMoaAddMetrics}
            isSubGroup
            onClick={() => onRowClick?.('MJCI - MOA ADDITIONAL')}
          />

          {/* GRAND TOTAL */}
          <TableRow
            label="GRAND TOTAL"
            {...totalMetrics}
            isTotal
          />
        </tbody>
      </table>
    </div>
  );
} 