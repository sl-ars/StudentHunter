// Тип пользователя
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "employer" | "admin";
  is_active: boolean;
  date_joined: string;
}

// Типы для вакансий
export interface Job {
  id: string;
  title: string;
  company: string;
  company_id: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[] | null;
  responsibilities: string[] | null;
  benefits: string[] | null;
  posted_date: string;
  deadline: string | null;
  featured: boolean;
  logo: string | null;
  industry: string | null;
  view_count: number;
  application_count: number;
  status: string;
  created_by: string | null;
  is_active: boolean;
  company_name?: string;
  created_by_name?: string;
  application_stats?: Record<string, number>;
  is_applied?: boolean;
}

// Типы для заявок на вакансии
export interface Application {
  id: string;
  job: Job | string;
  job_title?: string;
  job_company?: string;
  job_location?: string;
  job_type?: string;
  job_details?: Partial<Job>;
  applicant: User | string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_profile?: {
    education?: string;
    skills?: string[];
    experience?: string;
  };
  status: "pending" | "reviewing" | "interviewed" | "accepted" | "rejected";
  status_history?: {
    status: string;
    timestamp: string;
    notes: string;
  }[];
  cover_letter: string;
  resume: string;
  created_at: string;
  updated_at: string;
  interview_date: string | null;
  notes: string;
}

// Типы для административных функций
export interface ModerationLog {
  id: string;
  admin: string;
  admin_email: string;
  action: string;
  timestamp: string;
  notes: string;
  content_type: string;
  content_type_name: string;
  object_id: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  content_type: string | null;
  object_id: string | null;
}

export interface AdminDashboardStats {
  total_users: number;
  new_users_today: number;
  total_jobs: number;
  new_jobs_today: number;
  total_applications: number;
  new_applications_today: number;
  total_companies: number;
  new_companies_today: number;
  pending_verifications: number;
  active_jobs: number;
  total_students: number;
  total_employers: number;
}

export interface Company {
  id: string;
  name: string;
  company_name?: string;
  description: string;
  website: string | null;
  location: string;
  industry: string;
  size: string | null;
  founded: string | null;
  logo: string | null;
  cover_image: string | null;
  verified: boolean;
  featured: boolean;
  culture: string | null;
  benefits: Record<string, any> | null;
  social_links: Record<string, string> | null;
  company?: string;
  company_id?: string;
} 