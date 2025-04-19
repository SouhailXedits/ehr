export interface User {
  id: number;
  username: string;
  email: string;
  role: 'doctor' | 'patient';
  additionalInfo: {
    specialization?: string;
    licenseNumber?: string;
    hospital?: string;
    contactNumber?: string;
    dateOfBirth?: string;
    gender?: 'M' | 'F' | 'O';
    bloodType?: string;
    allergies?: string[];
    medicalHistory?: string[];
  };
}

export interface Doctor {
  id: string;
  docID: string;
  fName: string;
  lName: string;
  emailID: string;
  city: string;
  state: string;
  department: string;
  Doj: string;
  image?: string;
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

export interface MedicalRecord {
  id: string;
  patient: Patient;
  doctor: Doctor;
  diagnosis: string;
  prescription: string;
  notes: string;
  date: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role: 'doctor' | 'patient';
  additionalInfo: Partial<Doctor> | Partial<Patient>;
} 