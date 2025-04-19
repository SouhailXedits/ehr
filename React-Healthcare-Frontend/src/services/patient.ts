import { Patient } from '../types';
import { api } from '../api/config';

const patientService = {
  async getPatients(): Promise<Patient[]> {
    try {
      const response = await api.get('/patients/');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch patients');
      }
      throw error;
    }
  },

  async getPatient(id: string): Promise<Patient> {
    try {
      const response = await api.get(`/patients/${id}/`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch patient');
      }
      throw error;
    }
  },

  async getPatientAppointments(id: string): Promise<any[]> {
    try {
      const response = await api.get(`/getAppointmentPat/${id}/`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch patient appointments');
      }
      throw error;
    }
  },
};

export default patientService; 