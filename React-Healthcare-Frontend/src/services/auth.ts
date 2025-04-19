import axios from 'axios';
import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
}

interface AuthResponse {
  token: string;
  user: User;
}

const authService = {
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login/`, credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register/`, data);
    return response.data;
  },

  async logout() {
    await axios.post(`${API_URL}/auth/logout/`);
  },

  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_URL}/auth/me/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },
};

export { authService }; 