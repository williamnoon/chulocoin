import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Signals
export const getSignals = async (walletAddress: string, limit = 50) => {
  const response = await api.get('/signals/feed', {
    params: { walletAddress, limit },
  });
  return response.data;
};

export const getSignalById = async (id: string) => {
  const response = await api.get(`/signals/${id}`);
  return response.data;
};

// Users
export const connectWallet = async (walletAddress: string) => {
  const response = await api.post('/users/connect', { walletAddress });
  return response.data;
};

export const getUserStats = async (walletAddress: string) => {
  const response = await api.get(`/users/${walletAddress}/stats`);
  return response.data;
};

// Oracle
export const getPrice = async (asset: string) => {
  const response = await api.get(`/oracle/price/${asset}`);
  return response.data;
};

export default api;
