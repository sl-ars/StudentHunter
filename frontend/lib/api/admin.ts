import axios from 'axios';
import apiClient from './client';
import { 
  User, 
  Job, 
  Company, 
  Application, 
  ModerationLog, 
  AdminNotification, 
  AdminDashboardStats
} from '@/lib/types';
import { API_URL } from '../utils/config';

// Исправляем путь API чтобы он соответствовал бэкенду
const API_PATH = `/admin`;

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  ordering?: string;
  [key: string]: any; // Для дополнительных фильтров
}

export interface CreateUserData {
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  password: string;
  role: string;
  university?: string;
  company?: string;
  company_id?: string;
  sendWelcomeEmail?: boolean;
  activateImmediately?: boolean;
}

export const adminApi = {
  // ПОЛЬЗОВАТЕЛИ
  
  // Получение списка пользователей
  getUsers: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/users/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Получение отдельного пользователя
  getUser: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Удаление пользователя
  deleteUser: async (id: string) => {
    try {
      const response = await apiClient.delete(`${API_PATH}/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  // Обновление данных пользователя
  updateUser: async (id: string, userData: any) => {
    try {
      console.log("Starting user update for ID:", id);
      console.log("Raw update data received:", userData);
      
      // 1. Создаем копию данных для отправки
      const dataToSend = { ...userData };
      
      // 2. Всегда обновляем name из first_name и last_name
      if (userData.first_name !== undefined || userData.last_name !== undefined) {
        dataToSend.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        console.log("Generated name field:", dataToSend.name);
      }
      
      // 3. Удаляем поля first_name и last_name перед отправкой на сервер,
      // так как бэкенд ожидает только поле name
      delete dataToSend.first_name;
      delete dataToSend.last_name;
      
      console.log("Final data to be sent to API:", dataToSend);
      
      // 4. Отправляем запрос
      const response = await apiClient.patch(`${API_PATH}/users/${id}/`, dataToSend);
      console.log("Update response status:", response.status);
      console.log("Update response data:", response.data);
      
      return {
        status: 'success',
        message: 'User updated successfully',
        data: response.data.data || response.data
      };
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      console.error('Error response:', error.response?.data);
      
      return {
        status: 'error',
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to update user',
        data: null
      };
    }
  },

  // Создание нового пользователя
  createUser: async (userData: CreateUserData) => {
    try {
      console.log("Admin API: Creating user with data:", userData);
      
      // Если переданы first_name и last_name, но не name, то объединяем их в name
      if ((userData.first_name || userData.last_name) && !userData.name) {
        userData.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      }
      
      // Создаем новый объект без first_name и last_name
      const cleanedData: Omit<CreateUserData, 'first_name' | 'last_name'> = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        university: userData.university,
        company: userData.company,
        company_id: userData.company_id,
        sendWelcomeEmail: userData.sendWelcomeEmail,
        activateImmediately: userData.activateImmediately
      };
      
      console.log("Sending cleaned user data to API:", cleanedData);
      
      const response = await apiClient.post(`${API_PATH}/users/`, cleanedData);
      console.log("User creation response:", response.data);
      
      return {
        status: 'success',
        message: 'User created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to create user',
        data: null
      };
    }
  },

  // Массовое создание пользователей
  bulkCreateUsers: async (usersData: CreateUserData[]) => {
    try {
      const response = await apiClient.post(`${API_PATH}/users/bulk/`, { users: usersData });
      return {
        status: 'success',
        message: 'Users created successfully',
        data: {
          success: response.data.success || 0,
          failed: response.data.failed || 0,
          details: response.data.details || []
        }
      };
    } catch (error: any) {
      console.error('Error bulk creating users:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to create users',
        data: {
          success: 0,
          failed: usersData.length,
          details: []
        }
      };
    }
  },

  // Изменение статуса пользователя (активен/заблокирован)
  toggleUserActive: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/users/${id}/toggle_active/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling user status ${id}:`, error);
      throw error;
    }
  },

  // Статистика по пользователям
  getUserStats: async () => {
    try {
      const response = await apiClient.get(`${API_PATH}/users/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // ВАКАНСИИ
  
  // Получение списка вакансий
  getJobs: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/jobs/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Получение отдельной вакансии
  getJob: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  // Изменение статуса вакансии (активна/не активна)
  toggleJobActive: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/jobs/${id}/toggle_active/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling job status ${id}:`, error);
      throw error;
    }
  },

  // Добавление/удаление вакансии из рекомендуемых
  toggleJobFeatured: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/jobs/${id}/feature/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling job featured status ${id}:`, error);
      throw error;
    }
  },

  // КОМПАНИИ
  
  // Получение списка компаний
  getCompanies: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/companies/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Получение отдельной компании
  getCompany: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },
  
  // Alias for getCompany for backward compatibility
  getCompanyById: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  // Создание новой компании
  createCompany: async (companyData: any) => {
    try {
      console.log("Creating company with data:", companyData);
      const response = await apiClient.post(`${API_PATH}/companies/`, companyData);
      return {
        status: 'success',
        message: 'Company created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating company:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to create company',
        data: null
      };
    }
  },

  // Удаление компании
  deleteCompany: async (id: string) => {
    try {
      const response = await apiClient.delete(`${API_PATH}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  },

  // Обновление данных компании
  updateCompany: async (id: string, companyData: any) => {
    try {
      const response = await apiClient.patch(`${API_PATH}/companies/${id}/`, companyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  // Верификация компании
  verifyCompany: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/companies/${id}/verify/`);
      return response.data;
    } catch (error) {
      console.error(`Error verifying company ${id}:`, error);
      throw error;
    }
  },

  // Добавление/удаление компании из рекомендуемых
  toggleCompanyFeatured: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/companies/${id}/feature/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling company featured status ${id}:`, error);
      throw error;
    }
  },

  // ЗАЯВКИ
  
  // Получение списка заявок
  getApplications: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/applications/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Получение отдельной заявки
  getApplication: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/applications/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application ${id}:`, error);
      throw error;
    }
  },

  // ЛОГИ МОДЕРАЦИИ
  
  // Получение логов модерации
  getModerationLogs: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/moderation-logs/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      throw error;
    }
  },

  // УВЕДОМЛЕНИЯ
  
  // Получение уведомлений для администратора
  getNotifications: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/notifications/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Отметка уведомления как прочитанного
  markNotificationAsRead: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/notifications/${id}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  // Отметка всех уведомлений как прочитанных
  markAllNotificationsAsRead: async () => {
    try {
      const response = await apiClient.post(`${API_PATH}/notifications/mark_all_as_read/`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // СТАТИСТИКА ДАШБОРДА
  
  // Получение общей статистики для дашборда
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get(`${API_PATH}/dashboard/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // НАСТРОЙКИ ДАШБОРДА
  
  // Получение настроек дашборда для текущего администратора
  getDashboardSettings: async () => {
    try {
      const response = await apiClient.get(`${API_PATH}/dashboard-settings/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      throw error;
    }
  },

  // Обновление настроек дашборда
  updateDashboardSettings: async (settings: any) => {
    try {
      const response = await apiClient.put(`${API_PATH}/dashboard-settings/`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      throw error;
    }
  },

  // Специальная функция для обновления только имени пользователя
  updateUserName: async (id: string, firstName: string, lastName: string) => {
    try {
      // Создаем объект только с полем name
      const nameData = {
        name: `${firstName} ${lastName}`.trim()
      };
      
      console.log(`Direct name update for user ${id}:`, nameData);
      
      // Специальный запрос для обновления только имени
      const response = await apiClient.patch(`${API_PATH}/users/${id}/`, nameData);
      console.log("Name update response:", response.data);
      
      // Проверим обновленные данные
      try {
        const updatedUser = await apiClient.get(`${API_PATH}/users/${id}/`);
        console.log("User data after name update:", updatedUser.data);
      } catch (e) {
        console.warn("Could not fetch user after name update:", e);
      }
      
      return {
        status: 'success',
        message: 'User name updated successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error(`Error updating user name ${id}:`, error);
      console.error('Error response:', error.response?.data);
      
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to update user name',
        data: null
      };
    }
  },

  // АНАЛИТИКА
  
  // Получение данных аналитики
  getAnalytics: async (params?: { period?: string; year?: number }) => {
    try {
      const response = await apiClient.get(`${API_PATH}/analytics/`, { params });
      return {
        status: 'success',
        data: response.data,
        message: 'Analytics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        status: 'error',
        message: 'Failed to fetch analytics data',
        data: null
      };
    }
  },

  // СИСТЕМНЫЕ НАСТРОЙКИ
  
  // Получение системных настроек
  getSettings: async () => {
    try {
      console.log("Calling settings API endpoint...");
      const response = await apiClient.get(`${API_PATH}/settings/`);
      console.log("Raw settings API response:", response);
      
      // Возвращаем данные в ожидаемом формате
      if (response && response.data) {
        return response.data;
      } else {
        console.error("Settings API returned unexpected format:", response);
        return {
          status: 'error',
          message: 'Settings API returned unexpected format',
          data: null
        };
      }
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      // Возвращаем структурированный объект с ошибкой
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch system settings',
        data: null
      };
    }
  },
  
  // Обновление системных настроек
  updateSettings: async (settings: any) => {
    try {
      const response = await apiClient.put(`${API_PATH}/settings/`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      return {
        status: 'error',
        message: 'Failed to update system settings',
        data: null
      };
    }
  },
};
