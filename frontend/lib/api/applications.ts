import axios from 'axios';
import apiClient from './client';
import { Application } from '@/lib/types';
import { API_URL } from '../utils/config';

const API_PATH = `${API_URL}/application`;

export interface ApplicationsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  job?: string;
  ordering?: string;
}

export const applicationsApi = {
  // Получение списка заявок с возможностью фильтрации
  getApplications: async (params?: ApplicationsQueryParams) => {
    try {
      const response = await apiClient.get(API_PATH, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Получение отдельной заявки по ID
  getApplication: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application ${id}:`, error);
      throw error;
    }
  },

  // Создание новой заявки
  createApplication: async (applicationData: Partial<Application>) => {
    try {
      const response = await apiClient.post(API_PATH, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  // Обновление существующей заявки
  updateApplication: async (id: string, applicationData: Partial<Application>) => {
    try {
      const response = await apiClient.put(`${API_PATH}/${id}/`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating application ${id}:`, error);
      throw error;
    }
  },

  // Удаление заявки
  deleteApplication: async (id: string) => {
    try {
      const response = await apiClient.delete(`${API_PATH}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting application ${id}:`, error);
      throw error;
    }
  },

  // Обновление статуса заявки
  updateApplicationStatus: async (id: string, status: string, notes?: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/${id}/update_status/`, { status, notes });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for application ${id}:`, error);
      throw error;
    }
  },

  // Назначение собеседования
  scheduleInterview: async (id: string, interview_date: string, notes?: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/${id}/schedule_interview/`, { interview_date, notes });
      return response.data;
    } catch (error) {
      console.error(`Error scheduling interview for application ${id}:`, error);
      throw error;
    }
  },

  // Получение заявок на конкретную вакансию
  getApplicationsByJob: async (jobId: string, status?: string) => {
    try {
      const params = { job_id: jobId };
      if (status) {
        Object.assign(params, { status });
      }
      const response = await apiClient.get(`${API_PATH}/by-job/`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching applications for job ${jobId}:`, error);
      throw error;
    }
  },

  // Получение заявок текущего соискателя
  getMyApplications: async (status?: string) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(`${API_PATH}/my/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my applications:', error);
      throw error;
    }
  },

  // Получение заявок для работодателя
  getEmployerApplications: async (params?: ApplicationsQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/employer/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employer applications:', error);
      throw error;
    }
  },

  // Получение статистики по заявкам
  getApplicationStats: async () => {
    try {
      const response = await apiClient.get(`${API_PATH}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  },
};
