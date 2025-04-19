export interface Doctor {
  id: number;
  docID: string;
  docName: string;
  emailID: string;
  city: string;
  state: string;
  department: string;
  Doj: string;
}

export interface Patient {
  id: number;
  patID: string;
  patName: string;
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