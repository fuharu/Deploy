// Company Types
export interface Company {
  id: string
  name: string
  url: string | null
  address: string | null
  industry: number | null
  created_at?: string
  updated_at?: string
}

export interface UserCompanySelection {
  id: string
  user_id: string
  company_id: string
  status: CompanyStatus
  motivation_level: number | null
  mypage_url: string | null
  login_id: string | null
  login_mailaddress: string | null
  encrypted_password: string | null
  created_at: string
  updated_at?: string
  companies: Company
}

export type CompanyStatus =
  | 'Interested'
  | 'Entry'
  | 'ES_Submit'
  | 'Interview'
  | 'Offer'
  | 'Rejected'

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  Interested: '気になる',
  Entry: 'エントリー',
  ES_Submit: 'ES提出済',
  Interview: '面接選考中',
  Offer: '内定',
  Rejected: 'お見送り',
}

// Event Types
export interface Event {
  id: string
  company_id: string | null
  title: string
  type: EventType
  start_time: string
  end_time: string | null
  location: string | null
  description: string | null
  created_at?: string
  companies?: { name: string } | null
}

export type EventType = 'Interview' | 'Seminar' | 'Other'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  Interview: '面接',
  Seminar: '説明会',
  Other: 'その他',
}

// Task Types
export interface Task {
  id: string
  user_id: string
  company_id: string | null
  title: string
  due_date: string | null
  is_completed: boolean
  created_at?: string
  companies?: { name: string } | null
}

// ES Entry Types
export interface ESEntry {
  id: string
  user_id: string
  company_id: string
  content: string | null
  file_url: string | null
  status: string | null
  submitted_at: string | null
  created_at?: string
  updated_at?: string
}

// Notification Types
export interface Notification {
  id: string
  user_id: string
  title: string
  content: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

// Chart Data Types
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface ActivityDataPoint {
  date: string
  events: number
  es: number
}

export interface ProgressDataPoint {
  date: string
  count: number
}

// Form Types
export interface CompanyFormData {
  name: string
  url?: string
  status: CompanyStatus
  motivation_level: number
}

export interface EventFormData {
  company_id: string
  title: string
  type: EventType
  start_time: string
  end_time?: string
  location?: string
  description?: string
}

export interface TaskFormData {
  company_id?: string
  title: string
  due_date?: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Search Types
export interface SearchFilters {
  query?: string
  status?: CompanyStatus | 'all'
  motivation?: number | 'all'
  page?: number
}

