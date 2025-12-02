import api from './api';
import { RephraseRequest, RephraseResponse, RephraseHistory } from '../types';

export const rephraseService = {
  async rephraseText(request: RephraseRequest): Promise<RephraseResponse> {
    const response = await api.post('/api/rephrase', request);
    return response.data;
  },

  async regenerateRephrase(request: RephraseRequest): Promise<RephraseResponse> {
    const response = await api.post('/api/rephrase/regenerate', request);
    return response.data;
  },

  async getHistory(userId: number): Promise<RephraseHistory[]> {
    const response = await api.get(`/api/rephrase/history/${userId}`);
    return response.data;
  },
};
