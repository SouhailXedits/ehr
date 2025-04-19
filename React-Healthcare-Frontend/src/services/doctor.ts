import { Doctor } from '../types';
import { api } from '../api/config';

const doctorService = {
  async getDoctors(): Promise<Doctor[]> {
    try {
      const response = await api.get('/doctor/');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch doctors');
      }
      throw error;
    }
  },

  async getDoctor(id: string): Promise<Doctor> {
    try {
      const response = await api.get(`/doctor/${id}/`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch doctor');
      }
      throw error;
    }
  },

  async getDoctorAppointments(id: string): Promise<any[]> {
    try {
      const response = await api.get(`/getAppointmentDoc/${id}/`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch doctor appointments');
      }
      throw error;
    }
  },
};

export default doctorService; 