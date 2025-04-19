import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['doctor', 'patient']),
  additionalInfo: z.object({
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
    hospital: z.string().optional(),
    contactNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['M', 'F', 'O']).optional(),
    bloodType: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.array(z.string()).optional(),
  }),
});

export const appointmentSchema = z.object({
  doctor: z.string().min(1, 'Doctor is required'),
  patient: z.string().min(1, 'Patient is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

export const medicalRecordSchema = z.object({
  patient: z.string().min(1, 'Patient is required'),
  doctor: z.string().min(1, 'Doctor is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  prescription: z.string().min(1, 'Prescription is required'),
  notes: z.string().optional(),
});

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    schema.parse(data);
    return { isValid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _: 'An unexpected error occurred' } };
  }
}; 