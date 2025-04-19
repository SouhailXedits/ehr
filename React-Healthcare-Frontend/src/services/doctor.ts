import axios from 'axios';
import { Doctor } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const doctorService = {
  async getDoctors(): Promise<Doctor[]> {
    try {
      const response = await axios.get(`${API_URL}/doctor/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
      }
      throw error;
    }
  },

  async getDoctor(id: string): Promise<Doctor> {
    try {
      const response = await axios.get(`${API_URL}/doctor/${id}/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch doctor');
      }
      throw error;
    }
  },

  async getDoctorAppointments(id: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/getAppointmentDoc/${id}/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch doctor appointments');
      }
      throw error;
    }
  },
};

export default doctorService; 