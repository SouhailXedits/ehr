import { api } from './config';
import type {
  User,
  Doctor,
  Patient,
  Appointment,
  MedicalRecord,
  LoginCredentials,
  RegisterCredentials,
} from '../types';

interface BlockchainAuthData {
  address: string;
  signature: string;
}

type AuthService = {
  getNonce: (address: string) => Promise<{ nonce: string }>;
  authenticate: (data: BlockchainAuthData) => Promise<{ token: string; user: User }>;
  verifySession: () => Promise<{ user: User }>;
  logout: () => void;
};

export const authService: AuthService = {
  getNonce: async (address: string) => {
    const response = await api.get<{ nonce: string }>(`/auth/nonce/${address}/`);
    return response.data;
  },

  authenticate: async (data: BlockchainAuthData) => {
    const response = await api.post<{ token: string; user: User }>('/auth/authenticate/', data);
    return response.data;
  },

  verifySession: async () => {
    const response = await api.get<{ user: User }>('/auth/verify-session/');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Add mock data for services that don't have proper list operations

export const doctorService = {
  getDoctors: async () => {
    try {
      const response = await api.get<{status: string, data: Doctor[]}>('/doctor/');
      if (response.data) {
        return response.data;
      }
      throw new Error('Unexpected data format from API');
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  getDoctor: async (id: string) => {
    try {
      const response = await api.get<Doctor>(`/doctor/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor ${id}:`, error);
      throw error;
    }
  },

  createDoctor: async (data: Omit<Doctor, 'id'>) => {
    try {
      const response = await api.post<Doctor>('/doctor/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  },

  updateDoctor: async (id: string, data: Partial<Doctor>) => {
    try {
      const response = await api.put<Doctor>(`/doctor/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating doctor ${id}:`, error);
      throw error;
    }
  },
  
  deleteDoctor: async (id: string) => {
    try {
      await api.delete(`/doctor/${id}/`);
    } catch (error) {
      console.error(`Error deleting doctor ${id}:`, error);
      throw error;
    }
  },
};

export const patientService = {
  getPatients: async () => {
    try {
      const response = await api.get<{status: string, data: Patient[]}>('/patients/');
      if (response.data) {
        return response.data;
      }
      throw new Error('Unexpected data format from API');
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  getPatient: async (id: string) => {
    try {
      const response = await api.get<Patient>(`/patients/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  createPatient: async (data: Omit<Patient, 'id'>) => {
    try {
      const response = await api.post<Patient>('/patients/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  updatePatient: async (id: string, data: Partial<Patient>) => {
    try {
      const response = await api.put<Patient>(`/patients/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  },
  
  deletePatient: async (id: string) => {
    try {
      await api.delete(`/patients/${id}/`);
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  },
};

export const appointmentService = {
  getAppointments: async () => {
    try {
      const response = await api.get<{status: string, data: Appointment[]}>('/appointment/');
      if (response.data) {
        return response.data;
      }
      throw new Error('Unexpected data format from API');
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  getAppointment: async (id: number) => {
    try {
      const response = await api.get<Appointment>(`/appointment/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  getAppointmentsByDoctor: async (doctorId: string) => {
    try {
      const response = await api.get<Appointment[]>(`/getAppointmentDoc/${doctorId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for doctor ${doctorId}:`, error);
      return [];
    }
  },

  getAppointmentsByPatient: async (patientId: string) => {
    try {
      const response = await api.get<Appointment[]>(`/getAppointmentPat/${patientId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${patientId}:`, error);
      return [];
    }
  },

  createAppointment: async (data: Omit<Appointment, 'id'>) => {
    try {
      const response = await api.post<Appointment>('/appointment/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  updateAppointment: async (id: number, data: Partial<Appointment>) => {
    try {
      const response = await api.put<Appointment>(`/appointment/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },
  
  deleteAppointment: async (id: number) => {
    try {
      await api.delete(`/appointment/${id}/`);
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  },
};

export const medicalRecordService = {
  getMedicalRecords: async () => {
    try {
      const response = await api.get<MedicalRecord[]>('/medical-records/');
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return [];
    }
  },

  getMedicalRecordsByPatient: async (patientId: string) => {
    try {
      const response = await api.get<MedicalRecord[]>(`/medical-records/patient/${patientId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical records for patient ${patientId}:`, error);
      return [];
    }
  },

  createMedicalRecord: async (data: Omit<MedicalRecord, 'id'>) => {
    try {
      const response = await api.post<MedicalRecord>('/medical-records/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  updateMedicalRecord: async (id: string, data: Partial<MedicalRecord>) => {
    try {
      const response = await api.put<MedicalRecord>(`/medical-records/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating medical record ${id}:`, error);
      throw error;
    }
  },
  
  deleteMedicalRecord: async (id: string) => {
    try {
      await api.delete(`/medical-records/${id}/`);
    } catch (error) {
      console.error(`Error deleting medical record ${id}:`, error);
      throw error;
    }
  },
};