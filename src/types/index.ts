export interface Product {
  id: string;
  name: string;
  model: string;
  currentStation: string;
  progress: number;
  status: "overdue" | "normal";
  route: Route;
  stationHistory: StationHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  stations: Station[];
}

export interface Station {
  id: string;
  name: string;
  owner: string;
  completionRule: "all_filled" | "custom";
  fields: Field[];
  estimatedDuration: number;
}

export interface Field {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "textarea";
  required: boolean;
  options?: string[];
  defaultValue?: string | number | boolean;
}

export interface StationHistoryEntry {
  id: string;
  stationId: string;
  stationName: string;
  owner: string;
  startTime: Date;
  endTime?: Date;
  status: "pending" | "in_progress" | "completed" | "skipped";
  formData: Record<string, any>;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "operator" | "viewer";
  department: string;
}