import api from './api';
import { Tag, Suggestion } from '../types';

export const tagService = {
  async createTag(phrase: string, familiarityLevel: string, userId: number): Promise<Tag> {
    const response = await api.post('/api/tags', { phrase, familiarityLevel, userId });
    return response.data;
  },

  async getTags(userId: number): Promise<Tag[]> {
    const response = await api.get(`/api/tags/${userId}`);
    return response.data;
  },

  async updateTag(tagId: number, data: Partial<Tag>): Promise<Tag> {
    const response = await api.put(`/api/tags/${tagId}`, data);
    return response.data;
  },

  async deleteTag(tagId: number): Promise<void> {
    await api.delete(`/api/tags/${tagId}`);
  },

  async getSuggestions(phrase: string): Promise<Suggestion> {
    const response = await api.get(`/api/tags/suggestions/${encodeURIComponent(phrase)}`);
    return response.data;
  },
};
