import { Product, Route, Station, Field, StationHistoryEntry } from '@/types';

const fields: Field[] = [
  {
    id: 'quality_check',
    name: 'Quality Check',
    type: 'select',
    required: true,
    options: ['Pass', 'Fail', 'Recheck Required']
  },
  {
    id: 'notes',
    name: 'Notes',
    type: 'textarea',
    required: false
  },
  {
    id: 'temperature',
    name: 'Temperature (°C)',
    type: 'number',
    required: true
  },
  {
    id: 'operator_signature',
    name: 'Operator Signature',
    type: 'text',
    required: true
  }
];

const stations: Station[] = [
  {
    id: 'station_1',
    name: 'Material Preparation',
    owner: 'John Smith',
    completionRule: 'all_filled',
    fields: fields.slice(0, 2),
    estimatedDuration: 120
  },
  {
    id: 'station_2',
    name: 'Processing',
    owner: 'Jane Doe',
    completionRule: 'all_filled',
    fields: fields.slice(0, 3),
    estimatedDuration: 180
  },
  {
    id: 'station_3',
    name: 'Quality Inspection',
    owner: 'Mike Johnson',
    completionRule: 'all_filled',
    fields: fields,
    estimatedDuration: 90
  },
  {
    id: 'station_4',
    name: 'Packaging & Shipping',
    owner: 'Sarah Wilson',
    completionRule: 'all_filled',
    fields: fields.slice(1, 4),
    estimatedDuration: 60
  }
];

const routes: Route[] = [
  {
    id: 'route_standard',
    name: 'Standard Production Process',
    description: 'Standard manufacturing process for most products',
    stations: stations
  },
  {
    id: 'route_express',
    name: 'Express Production Process',
    description: 'Fast manufacturing process for urgent orders',
    stations: stations.slice(0, 3)
  }
];

const createStationHistory = (stationId: string, stationName: string, owner: string, status: StationHistoryEntry['status']): StationHistoryEntry => ({
  id: `history_${Math.random().toString(36).substr(2, 9)}`,
  stationId,
  stationName,
  owner,
  startTime: new Date(Date.now() - Math.random() * 86400000 * 3),
  endTime: status === 'completed' ? new Date(Date.now() - Math.random() * 86400000 * 2) : undefined,
  status,
  formData: {
    quality_check: 'Pass',
    notes: 'Normal operation',
    temperature: 25,
    operator_signature: owner
  }
});

export const mockProducts: Product[] = [
  {
    id: 'product_1',
    name: 'iPhone 15 Pro',
    model: 'A2849',
    currentStation: 'station_2',
    progress: 50,
    status: 'normal',
    route: routes[0],
    stationHistory: [
      createStationHistory('station_1', 'Material Preparation', 'John Smith', 'completed'),
      createStationHistory('station_2', 'Processing', 'Jane Doe', 'in_progress')
    ],
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'product_2',
    name: 'MacBook Air M3',
    model: 'MBA13-M3',
    currentStation: 'station_3',
    progress: 75,
    status: 'overdue',
    route: routes[0],
    stationHistory: [
      createStationHistory('station_1', 'Material Preparation', 'John Smith', 'completed'),
      createStationHistory('station_2', 'Processing', 'Jane Doe', 'completed'),
      createStationHistory('station_3', 'Quality Inspection', 'Mike Johnson', 'in_progress')
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'product_3',
    name: 'iPad Pro 12.9"',
    model: 'IPAD-PRO-12',
    currentStation: 'station_1',
    progress: 25,
    status: 'normal',
    route: routes[1],
    stationHistory: [
      createStationHistory('station_1', 'Material Preparation', 'John Smith', 'in_progress')
    ],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'product_4',
    name: 'Apple Watch Series 9',
    model: 'AWS9-45MM',
    currentStation: 'station_4',
    progress: 100,
    status: 'normal',
    route: routes[0],
    stationHistory: [
      createStationHistory('station_1', 'Material Preparation', 'John Smith', 'completed'),
      createStationHistory('station_2', 'Processing', 'Jane Doe', 'completed'),
      createStationHistory('station_3', 'Quality Inspection', 'Mike Johnson', 'completed'),
      createStationHistory('station_4', 'Packaging & Shipping', 'Sarah Wilson', 'completed')
    ],
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 900000)
  },
  {
    id: 'product_5',
    name: 'AirPods Pro 2',
    model: 'APP2-USB-C',
    currentStation: 'station_2',
    progress: 50,
    status: 'normal',
    route: routes[1],
    stationHistory: [
      createStationHistory('station_1', 'Material Preparation', 'John Smith', 'completed'),
      createStationHistory('station_2', 'Processing', 'Jane Doe', 'in_progress')
    ],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 1200000)
  },
  {
    id: 'product_6',
    name: 'Mac Studio M2',
    model: 'MS-M2-MAX',
    currentStation: 'station_1',
    progress: 25,
    status: 'overdue',
    route: routes[0],
    stationHistory: [
      createStationHistory('station_1', 'Material Preparation', 'John Smith', 'in_progress')
    ],
    createdAt: new Date(Date.now() - 86400000 * 4),
    updatedAt: new Date(Date.now() - 14400000)
  }
];

export const mockRoutes = routes;
export const mockStations = stations;