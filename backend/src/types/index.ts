// Database Entity Types
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Station {
  id: string;
  name: string;
  owner: string;
  completion_rule: 'all_filled' | 'custom';
  estimated_duration: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RouteStation {
  id: string;
  route_id: string;
  station_id: string;
  sequence_order: number;
  is_required: boolean;
  created_at: Date;
}

export interface Field {
  id: string;
  station_id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  is_required: boolean;
  options: string | null; // JSON string for select options
  default_value: string | null;
  validation_rules: string | null; // JSON string for validation
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  model: string;
  route_id: string;
  current_station_id: string | null;
  progress: number;
  status: 'normal' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  estimated_completion: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface StationHistory {
  id: string;
  product_id: string;
  station_id: string;
  station_name: string;
  owner: string;
  start_time: Date;
  end_time: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  notes: string | null;
  created_by: string;
  created_at: Date;
}

export interface FieldData {
  id: string;
  station_history_id: string;
  field_id: string;
  field_name: string;
  value: string;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'create' | 'update' | 'delete';
  old_values: string | null; // JSON string
  new_values: string | null; // JSON string
  changed_by: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken: string;
  expiresIn: string;
}

export interface CreateProductRequest {
  name: string;
  model: string;
  route_id: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface UpdateProductRequest {
  name?: string;
  model?: string;
  route_id?: string;
  current_station_id?: string;
  progress?: number;
  status?: 'normal' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
}

export interface AdvanceProductRequest {
  notes?: string;
  field_data?: Record<string, any>;
}

export interface BulkUpdateRequest {
  product_ids: string[];
  updates: UpdateProductRequest;
}

export interface CreateRouteRequest {
  name: string;
  description: string;
  station_ids: string[];
}

export interface CreateStationRequest {
  name: string;
  owner: string;
  completion_rule: 'all_filled' | 'custom';
  estimated_duration: number;
  fields: CreateFieldRequest[];
}

export interface CreateFieldRequest {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  is_required: boolean;
  options?: string[];
  default_value?: string;
  validation_rules?: Record<string, any>;
}

// Analytics Types
export interface DashboardAnalytics {
  totalProducts: number;
  normalProducts: number;
  overdueProducts: number;
  completedProducts: number;
  inProgressProducts: number;
  averageProgress: number;
  averageCompletionTime: number;
  stationUtilization: StationUtilization[];
  routeUsage: RouteUsage[];
  ownerPerformance: OwnerPerformance[];
}

export interface StationUtilization {
  station_id: string;
  station_name: string;
  owner: string;
  current_products: number;
  completed_today: number;
  average_duration: number;
  utilization_rate: number;
}

export interface RouteUsage {
  route_id: string;
  route_name: string;
  total_products: number;
  completed_products: number;
  average_completion_time: number;
  completion_rate: number;
}

export interface OwnerPerformance {
  owner: string;
  total_assigned: number;
  completed: number;
  overdue: number;
  completion_rate: number;
  average_duration: number;
}

// Database Query Types
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface ProductFilters {
  search?: string;
  status?: 'normal' | 'overdue';
  route_id?: string;
  owner?: string;
  priority?: 'low' | 'medium' | 'high';
  date_from?: string;
  date_to?: string;
}

// JWT Payload Type
export interface JwtPayload {
  id: string;
  username: string;
  name: string;
  role: string;
  department: string;
  iat?: number;
  exp?: number;
}

// Express Request Extension
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}