export interface Doctor {
  id: number;
  docID: string;
  fName: string;
  lName: string;
  emailID: string;
  city: string;
  state: string;
  department: string;
  created_at: string;
  Doj: string;
  address?: string;
}

export interface Patient {
  id: number;
  patID: string;
  patName: string;
  patContact: string;
  patEmail: string;
  patient_address: string;
}

export interface Appointment {
  id: number;
  date: string;
  department: string;
  docID: string;
  docName: string;
  patID: string;
  patName: string;
  time: string;
  status: boolean;
  patient_address: string | null;
  blockchain_id?: string | number | null;
  blockchain_tx?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
}

export interface MedicalRecord {
  id: number;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
} 