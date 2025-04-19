import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TestAuth from './components/TestAuth';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Appointments
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentDetail from './components/appointments/AppointmentDetail';
import AppointmentForm from './components/appointments/AppointmentForm';

// Doctors
import DoctorList from './components/doctors/DoctorList';
import DoctorDetail from './components/doctors/DoctorDetail';
import DoctorForm from './components/doctors/DoctorForm';

// Patients
import PatientList from './components/patients/PatientList';
import PatientDetail from './components/patients/PatientDetail';
import PatientForm from './components/patients/PatientForm';
import MedicalRecordList from './components/medical-records/MedicalRecordList';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="test-auth" element={<TestAuth />} />
              
              {/* Appointments Routes */}
              <Route path="appointments" element={<AppointmentList />} />
              <Route path="appointments/:id" element={<AppointmentDetail />} />
              <Route path="appointments/new" element={<AppointmentForm />} />
              <Route path="appointments/:id/edit" element={<AppointmentForm />} />
              
              {/* Doctors Routes */}
              <Route path="doctors" element={<DoctorList />} />
              <Route path="doctors/:id" element={<DoctorDetail />} />
              <Route path="doctors/new" element={<DoctorForm />} />
              <Route path="doctors/:id/edit" element={<DoctorForm />} />
              
              {/* Patients Routes */}
              <Route path="patients" element={<PatientList />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="patients/new" element={<PatientForm />} />
              <Route path="patients/:id/edit" element={<PatientForm />} />
              
              <Route path="medical-records" element={<MedicalRecordList />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
