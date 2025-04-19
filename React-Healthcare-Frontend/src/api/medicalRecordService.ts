import { api } from './config';
import type { MedicalRecord } from '../types';

const mockMedicalRecords = [
  {
    id: 1,
    patientId: "PAT001",
    doctorId: "DOC001",
    date: "2023-04-15",
    diagnosis: "Hypertension",
    prescription: "Lisinopril 10mg daily",
    notes: "Follow up in 3 months"
  } as MedicalRecord,
  {
    id: 2,
    patientId: "PAT002",
    doctorId: "DOC002",
    date: "2023-04-18",
    diagnosis: "Migraine",
    prescription: "Sumatriptan 50mg as needed",
    notes: "Schedule MRI if symptoms persist"
  } as MedicalRecord
];

export const medicalRecordService = {
  getMedicalRecords: async () => {
    try {
      // Try GET request first, fall back to mock data if needed
      try {
        const response = await api.get<{status: string, data: MedicalRecord[]}>('/medical-records/');
        if (response.data) {
          console.log("Successfully retrieved medical records from API");
          return response.data.data;
        } else {
          console.log("API returned unexpected data format, using mock data");
          return mockMedicalRecords;
        }
      } catch (error) {
        console.log("Error fetching medical records, using mock data:", error);
        return mockMedicalRecords;
      }
    } catch (error) {
      console.error("Error in medicalRecordService:", error);
      return mockMedicalRecords;
    }
  },

  getMedicalRecord: async (id: number) => {
    try {
      const response = await api.get<MedicalRecord>(`/medical-records/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical record:", error);
      return mockMedicalRecords.find(record => record.id === id) || null;
    }
  },

  createMedicalRecord: async (data: Omit<MedicalRecord, 'id'>) => {
    try {
      const response = await api.post<MedicalRecord>('/medical-records/', data);
      return response.data;
    } catch (error) {
      console.error("Error creating medical record:", error);
      throw error;
    }
  },

  updateMedicalRecord: async (id: number, data: Partial<MedicalRecord>) => {
    try {
      const response = await api.put<MedicalRecord>(`/medical-records/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating medical record:", error);
      throw error;
    }
  },

  deleteMedicalRecord: async (id: number) => {
    try {
      await api.delete(`/medical-records/${id}/`);
    } catch (error) {
      console.error("Error deleting medical record:", error);
      throw error;
    }
  }
}; 