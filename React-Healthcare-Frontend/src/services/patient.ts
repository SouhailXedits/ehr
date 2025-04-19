import axios from 'axios';
import { Patient } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const patientService = {
  async getPatients(): Promise<Patient[]> {
    try {
      const response = await axios.get(`${API_URL}/patients/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch patients');
      }
      throw error;
    }
  },

  async getPatientAppointments(id: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/getAppointmentPat/${id}/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch patient appointments');
      }
      throw error;
    }
  },
};

export default patientService; 