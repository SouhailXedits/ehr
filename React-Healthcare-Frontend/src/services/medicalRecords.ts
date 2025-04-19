import axios from 'axios';
import { authService } from './auth';
import { MedicalRecord } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const medicalRecordsService = {
  async getRecords(patientId: number): Promise<MedicalRecord[]> {
    try {
      // Get records from blockchain
      const blockchainRecords = await authService.getMedicalRecords(patientId);

      // Get additional data from Django backend
      const response = await axios.get(`${API_URL}/medical-records/${patientId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Combine blockchain and backend data
      return blockchainRecords.map((record: any) => ({
        id: record.id.toString(),
        patientId: record.patientId.toString(),
        doctorId: record.doctorId.toString(),
        diagnosis: ethers.utils.parseBytes32String(record.diagnosis),
        prescription: ethers.utils.parseBytes32String(record.prescription),
        notes: ethers.utils.parseBytes32String(record.notes),
        timestamp: new Date(record.timestamp * 1000).toISOString(),
        ...response.data.find((r: any) => r.id === record.id.toString()),
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch medical records');
      }
      throw error;
    }
  },

  async addRecord(record: Omit<MedicalRecord, 'id' | 'timestamp'>): Promise<MedicalRecord> {
    try {
      // Add record to blockchain
      const txHash = await authService.addMedicalRecord({
        patientId: parseInt(record.patientId),
        doctorId: parseInt(record.doctorId),
        diagnosis: record.diagnosis,
        prescription: record.prescription,
        notes: record.notes,
      });

      // Add record to Django backend
      const response = await axios.post(
        `${API_URL}/medical-records/`,
        {
          ...record,
          blockchainTxHash: txHash,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to add medical record');
      }
      throw error;
    }
  },

  async updateRecord(record: MedicalRecord): Promise<MedicalRecord> {
    try {
      const response = await axios.put(
        `${API_URL}/medical-records/${record.id}/`,
        record,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update medical record');
      }
      throw error;
    }
  },

  async deleteRecord(recordId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/medical-records/${recordId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete medical record');
      }
      throw error;
    }
  },
};

export default medicalRecordsService; 