import Papa, { ParseResult } from 'papaparse';

export interface LandbankData {
  'MAP INDEX': string;
  'MUNICIPALITY': string;
  'BARANGAY': string;
  'AREA (SQM)': number;
  'AREA (HA)': number;
  'AGREEMENT GROUP': string;
  'AGREEMENT DOC TYPE': string;
  'AGREEMENT AREA (HA)': number;
  'INFUSION STATUS': string;
  'INFUSED AREA (SQM)': number;
  'INFUSION AREA (HA)': number;
  'INFUSION DATE': string;
  'INFUSION YEAR': string;
  'LOT AVAILABILITY STATUS': string;
  'ACQUISITION GROUP': string;
  'ACQUISITION CLASS': string;
  'GIS STATUS': string;
  'CLEAN-UP STATUS': string;
  'CLEAN-UP TIMELINE': string;
  'PROJECT': string;
  'LAND GROUP': string;
  'AGREEMENT TYPE': string;
  [key: string]: string | number | null | undefined;
}

export const AGREEMENT_AREAS = {
  'Royal Asia Land': 450.25,
  'Manila Jockey Club': 300.50,
  'Congressman Roy Loyola': 250.75,
  'Dionido MoA': 180.25,
  'ALI-owned lots': 59.50,
};

export const CHART_COLORS = {
  primary: '#34E4EA',
  secondary: '#4ECDC4',
  tertiary: '#3498DB',
  quaternary: '#2C3E50',
  success: '#2ECC71',
  warning: '#F1C40F',
  danger: '#E74C3C',
};

export const fetchLandbankData = async (): Promise<LandbankData[]> => {
  try {
    const response = await fetch('/data/landbank.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      try {
        Papa.parse<LandbankData>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results: ParseResult<LandbankData>) => {
            resolve(results.data);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    throw error;
  }
};

// Calculate total area by agreement group
export const calculateTotalAreaByAgreement = (data: LandbankData[]) => {
  const totals = new Map<string, number>();
  
  data.forEach(row => {
    const group = row['AGREEMENT GROUP'];
    const area = row['AREA (HA)'] || 0;
    
    if (group) {
      totals.set(group, (totals.get(group) || 0) + area);
    }
  });
  
  return totals;
};

// Calculate infusion progress by agreement group
export const calculateInfusionProgress = (data: LandbankData[]) => {
  const progress = new Map<string, { total: number; infused: number }>();
  
  data.forEach(row => {
    const group = row['AGREEMENT GROUP'];
    if (!group) return;
    
    const total = row['AREA (HA)'] || 0;
    const infused = row['INFUSION AREA (HA)'] || 0;
    
    if (!progress.has(group)) {
      progress.set(group, { total: 0, infused: 0 });
    }
    
    const current = progress.get(group)!;
    progress.set(group, {
      total: current.total + total,
      infused: current.infused + infused
    });
  });
  
  return progress;
};

// Calculate clean-up status distribution
export const calculateCleanupStatus = (data: LandbankData[]) => {
  const status = new Map<string, number>();
  
  data.forEach(row => {
    const cleanupStatus = row['CLEAN-UP STATUS'] || 'Unknown';
    const area = row['AREA (HA)'] || 0;
    
    status.set(cleanupStatus, (status.get(cleanupStatus) || 0) + area);
  });
  
  return status;
};

// Calculate lot availability status
export const calculateLotAvailability = (data: LandbankData[]) => {
  const availability = new Map<string, number>();
  
  data.forEach(row => {
    const status = row['LOT AVAILABILITY STATUS'] || 'Unknown';
    const area = row['AREA (HA)'] || 0;
    
    availability.set(status, (availability.get(status) || 0) + area);
  });
  
  return availability;
};

export const calculateMetrics = (data: LandbankData[]) => {
  return {
    lotCount: data.length,
    infusedLots: data.filter(row => (row['INFUSION AREA (HA)'] || 0) > 0).length,
    aklOwnedTitles: data.filter(row => row['ACQUISITION CLASS'] === 'AKL - TITLED').length,
    lotsForCleanup: data.filter(row => row['CLEAN-UP TIMELINE'] !== 'Launched').length,
    totalArea: data.reduce((sum, row) => sum + (row['AREA (HA)'] || 0), 0),
    infusedArea: data.reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0),
    percentInfused: (data.reduce((sum, row) => sum + (row['INFUSION AREA (HA)'] || 0), 0) / 1241.25) * 100,
  };
};

export const formatNumber = (value: number, decimals: number = 0) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const groupByYear = (data: LandbankData[], field: keyof LandbankData) => {
  const groupedData = data.reduce((acc, row) => {
    const year = row['INFUSION YEAR'];
    if (year && !isNaN(Number(year))) {
      acc[year] = (acc[year] || 0) + (Number(row[field]) || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedYears = Object.keys(groupedData).sort();
  return {
    labels: sortedYears,
    values: sortedYears.map(year => groupedData[year]),
  };
};

export const groupByField = (data: LandbankData[], groupField: keyof LandbankData, valueField: keyof LandbankData) => {
  const groupedData = data.reduce((acc, row) => {
    const group = row[groupField]?.toString() || 'Unknown';
    acc[group] = (acc[group] || 0) + (Number(row[valueField]) || 0);
    return acc;
  }, {} as Record<string, number>);

  const sortedGroups = Object.keys(groupedData).sort();
  return {
    labels: sortedGroups,
    values: sortedGroups.map(group => groupedData[group]),
  };
}; 