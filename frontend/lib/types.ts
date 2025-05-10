export type UserRole = "student" | "employer" | "admin" | "campus";

// Тип пользователя
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  avatar?: string;
  company?: string;
  company_id?: string;
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points?: number;
  icon?: string;
}

export interface Education {
  id: string;
  university: string;
  field: string;
  degree: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description?: string;
  current?: boolean;
}

export interface BaseProfileData { // Общие редактируемые поля для всех профилей
  phone?: string;
  location?: string;
  description?: string; // Общее описание (bio для студента, company_desc для компании и т.д.)
}

// Новый тип для профиля студента, используется в объединенной странице
export interface StudentProfile extends User, BaseProfileData {
  // `description` из BaseProfileData будет использоваться как bio
  skills?: string[]; 
  achievements?: string[]; // Массив строк для ввода, на бэке может быть ListField(child=CharField)
  education?: Education[];
  experience?: Experience[];
  // Статистика (profileCompletion, missingFields) вычисляется на фронте для студента
}

// Новый тип для профиля работодателя
export interface EmployerProfile extends User, BaseProfileData {
  company_name?: string; // Если отличается от user.name. Если user.name это и есть название компании, то это поле не нужно.
  company_website?: string;
  // `description` из BaseProfileData будет описанием компании
  company_skills_tags?: string[]; // Ключевые навыки/теги компании
  // Статистика с бэка (эти поля только для чтения на фронте)
  totalJobsPosted?: number;
  activeApplications?: number;
  totalHires?: number;
}

// Новый тип для профиля кампуса
export interface CampusProfile extends User, BaseProfileData {
  // `university_name` - если user.name это ФИО представителя, а не название кампуса
  // `description` из BaseProfileData будет описанием кампуса
  programs_offered?: string[];
  // Статистика с бэка
  totalStudents?: number;
  activePrograms?: number;
  partnerCompanies?: number;
}

// Новый тип для профиля админа
export interface AdminProfile extends User, BaseProfileData {
  // `description` из BaseProfileData - личное описание админа, если нужно
  system_name?: string;
  system_description?: string;
  // Статистика с бэка
  totalUsers?: number;
  activeCampuses?: number;
  totalJobs?: number;
}

// Объединенный тип, который будет использоваться для состояния profileData в UnifiedProfilePage
export type AnyFullProfile = StudentProfile | EmployerProfile | CampusProfile | AdminProfile;


// --- Существующий UserProfile (для студента) --- 
// Оставляем его пока что, так как он может использоваться в других местах (например, userApi.updateProfile)
// Постепенно можно будет его заменить или убедиться, что StudentProfile совместим.
// Если StudentProfile полностью заменяет его для новой страницы, то в userApi.updateProfile 
// нужно будет принимать Partial<AnyFullProfile>.
export interface UserProfile extends User { 
  bio?: string; // Это будет соответствовать `description` в StudentProfile/BaseProfileData
  phone?: string; // Есть в BaseProfileData
  location?: string; // Есть в BaseProfileData
  skills?: string[]; // Есть в StudentProfile
  education?: Education[]; // Есть в StudentProfile
  experience?: Experience[]; // Есть в StudentProfile
  achievements?: Achievement[]; // ВАЖНО: здесь Achievement[], а в StudentProfile мы сделали string[] для простоты ввода
                               // Это потребует согласования с бэкендом или конвертации на фронте если мы используем StudentProfile.achievements: string[]
} 