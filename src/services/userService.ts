import api from './api';
import { User, UserPreferences } from '../types';

export const userService = {
  async register(data: any): Promise<User> {
    const response = await api.post('/api/users/register', data);
    return response.data;
  },

  async getProfile(userId: number): Promise<User> {
    const response = await api.get(`/api/users/profile/${userId}`);
    return response.data;
  },

  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await api.put(`/api/users/profile/${userId}`, data);
    return response.data;
  },

  async getPreferences(userId: number): Promise<UserPreferences> {
    const response = await api.get(`/api/users/preferences/${userId}`);
    return response.data;
  },

  async updatePreferences(userId: number, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.put(`/api/users/preferences/${userId}`, preferences);
    return response.data;
  },
};
