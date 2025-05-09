import apiClient from "./client"
import type { Job, JobApplication, Company } from "@/lib/types"

interface ApiResponse<T> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

// Helper function to ensure a value is an array
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split('\n').filter(Boolean);
  return [];
};

export const employerApi = {
  // Jobs
  getJobs: async (params?: any) => {
    try {
      console.log("Fetching employer jobs");
      const response = await apiClient.get<ApiResponse<Job[]>>("/job/employer/jobs/", { params })
      
      if (response.data) {
        console.log("Successfully fetched employer jobs:", response.data);
        return response.data;
      } else {
        console.warn("Unexpected response format from jobs API:", response);
        throw new Error("Invalid response format from jobs API");
      }
    } catch (error: any) {
      console.error("Error fetching employer jobs:", error)
      throw error
    }
  },

  getJob: async (jobId: string) => {
    try {
      const response = await apiClient.get<ApiResponse<Job>>(`/job/${jobId}/`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching job ${jobId}:`, error)
      throw error
    }
  },

  createJob: async (jobData: Partial<Job>) => {
    try {
      // Format the job data to match backend expectations
      const formattedData = {
        ...jobData,
        // Ensure these fields are arrays as expected by the backend
        requirements: ensureArray(jobData.requirements),
        responsibilities: ensureArray(jobData.responsibilities),
        benefits: ensureArray(jobData.benefits),
        is_active: true,
        status: 'active'
      };
      
      console.log("Creating job with data:", formattedData);
      const response = await apiClient.post<ApiResponse<Job>>("/job/", formattedData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  updateJob: async (jobId: string, jobData: Partial<Job>) => {
    try {
      const response = await apiClient.put<ApiResponse<Job>>(`/job/employer/jobs/${jobId}/`, jobData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating job ${jobId}:`, error)
      throw error
    }
  },

  deleteJob: async (jobId: string) => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/job/${jobId}/`)
      return response.data
    } catch (error: any) {
      console.error(`Error deleting job ${jobId}:`, error)
      throw error
    }
  },

  // Applications
  getApplications: async (params?: any) => {
    try {
      console.log("Fetching employer applications");
      // Use the specific endpoint for employer applications
      const response = await apiClient.get<ApiResponse<JobApplication[]>>("/application/employer/", { params })
      
      if (response.data) {
        console.log("Successfully fetched employer applications:", response.data);
        return response.data;
      } else {
        console.warn("Unexpected response format from applications API:", response);
        throw new Error("Invalid response format from applications API");
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error)
      throw error
    }
  },

  getApplication: async (id: string) => {
    const response = await apiClient.get<ApiResponse<JobApplication>>(`/application/${id}/`)
    return response.data
  },

  updateApplicationStatus: async (applicationId: string, status: string) => {
    try {
      const response = await apiClient.patch<ApiResponse<{ success: boolean }>>(`/application/${applicationId}/`, {
        status,
      })
      return response.data
    } catch (error: any) {
      console.error(`Error updating application ${applicationId}:`, error)
      throw error
    }
  },

  // Students
  createStudent: async (data: any) => {
    const response = await apiClient.post<ApiResponse<any>>("/students/", data)
    return response.data
  },

  // Company Profile
  getCompanyProfile: async () => {
    // Try company profile endpoint
    try {
      console.log("Fetching company profile from /company/employer/company/");
      const response = await apiClient.get<ApiResponse<Company>>("/company/employer/company/");
      
      if (response?.data) {
        console.log("Successfully fetched company profile");
        return response.data;
      }
    } catch (error: any) {
      console.error("Error fetching company profile:", error.message);
    }
    
    // Return empty profile as fallback
    console.warn("Could not fetch company profile, returning default empty profile");
    return {
      status: "success",
      message: "Default profile",
      data: {
        company_name: "",
        industry: "",
        website: "",
        description: "",
        company: "",
        company_id: ""
      }
    };
  },

  updateCompanyProfile: async (profileData: any) => {
    try {
      console.log("Updating company profile via POST to /company/employer/update/");
      console.log("Profile data being sent:", JSON.stringify(profileData, null, 2));
      
      // Используем метод POST к новому эндпоинту
      const response = await apiClient.post<ApiResponse<Company>>("/company/employer/update/", profileData);
      
      console.log("Company profile updated successfully!");
      console.log("Response data:", JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error("Error updating company profile:", error.message);
      // Логирование деталей ошибки
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      throw error;
    }
  },

  // Analytics
  getAnalytics: async (params?: { period?: string }) => {
    try {
      console.log("Calling analytics API at /analytics/employer/analytics/");
      const response = await apiClient.get<ApiResponse<any>>("/analytics/employer/analytics/", { params });
      console.log("Analytics API response:", response);
      
      if (response.data) {
        return {
          status: "success",
          data: response.data,
          message: "Analytics retrieved successfully",
        }
      } else {
        console.warn("API response didn't have expected data structure:", response.data);
        return {
          status: "error",
          message: "API returned unexpected data format",
          data: null,
        }
      }
    } catch (error: any) {
      console.error("Error fetching employer analytics:", error);
      // Extract detailed error message if available
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          "Failed to fetch analytics data";
      
      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Interviews
  getInterviews: async (filters?: any) => {
    const response = await apiClient.get<ApiResponse<any>>("/interviews/", { params: filters })
    return response.data
  },

  scheduleInterview: async (applicationId: string, data: any) => {
    const response = await apiClient.post<ApiResponse<any>>(`/application/${applicationId}/interview/`, data)
    return response.data
  },

  // Settings
  getSettings: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/settings/")
    return response.data
  },

  updateSettings: async (data: any) => {
    const response = await apiClient.put<ApiResponse<any>>("/settings/", data)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>("/change-password/", data)
    return response.data
  },
} 