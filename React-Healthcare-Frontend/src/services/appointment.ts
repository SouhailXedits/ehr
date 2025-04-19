import { Appointment } from '../types';
import api from '../services/api';

export interface CreateAppointmentData {
  date: string;
  department: string;
  docID: string;
  docName: string;
  patID: string;
  patName: string;
  time: string;
  status: boolean;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {}

const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await api.get('/appointment/');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  async getAppointment(id: number): Promise<Appointment> {
    try {
      const response = await api.get(`/appointment/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.post('/appointment/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async updateAppointment(
    id: number,
    data: UpdateAppointmentData
  ): Promise<Appointment> {
    try {
      const response = await api.put(`/appointment/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  async cancelAppointment(id: number): Promise<void> {
    try {
      await api.patch(`/appointment/${id}/`, { status: false });
    } catch (error) {
      console.error(`Error canceling appointment ${id}:`, error);
      throw error;
    }
  },

  async getDoctorAppointments(docID: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/getAppointmentDoc/${docID}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for doctor ${docID}:`, error);
      throw error;
    }
  },

  async getPatientAppointments(patID: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/getAppointmentPat/${patID}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${patID}:`, error);
      throw error;
    }
  },
};

export default appointmentService; 