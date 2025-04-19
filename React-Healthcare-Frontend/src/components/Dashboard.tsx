import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { doctorService, patientService, appointmentService } from '../api/services';

export default function Dashboard() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({
    doctors: false,
    patients: false,
    appointments: false
  });

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        
        // Load each stat individually to handle potential API errors
        try {
          const doctors = await doctorService.getDoctors();
          setStats(prev => ({ ...prev, doctors: doctors.length }));
        } catch (error) {
          console.error("Error loading doctors:", error);
          setErrors(prev => ({ ...prev, doctors: true }));
        }
        
        try {
          const patients = await patientService.getPatients();
          setStats(prev => ({ ...prev, patients: patients.length }));
        } catch (error) {
          console.error("Error loading patients:", error);
          setErrors(prev => ({ ...prev, patients: true }));
        }
        
        try {
          const appointments = await appointmentService.getAppointments();
          setStats(prev => ({ ...prev, appointments: appointments.length }));
        } catch (error) {
          console.error("Error loading appointments:", error);
          setErrors(prev => ({ ...prev, appointments: true }));
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            {errors.doctors ? (
              <div className="text-sm text-red-500">Unable to load doctors</div>
            ) : (
              <div className="text-3xl font-bold">{loading ? '...' : stats.doctors}</div>
            )}
            <Link to="/doctors" className="text-sm text-blue-500 hover:underline">
              View all doctors
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {errors.patients ? (
              <div className="text-sm text-red-500">Unable to load patients</div>
            ) : (
              <div className="text-3xl font-bold">{loading ? '...' : stats.patients}</div>
            )}
            <Link to="/patients" className="text-sm text-blue-500 hover:underline">
              View all patients
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {errors.appointments ? (
              <div className="text-sm text-red-500">Unable to load appointments</div>
            ) : (
              <div className="text-3xl font-bold">{loading ? '...' : stats.appointments}</div>
            )}
            <Link to="/appointments" className="text-sm text-blue-500 hover:underline">
              View all appointments
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link 
                to="/appointments/new" 
                className="block w-full p-2 text-center bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Book Appointment
              </Link>
              <Link 
                to="/patients/new" 
                className="block w-full p-2 text-center bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors" 
              >
                Add Patient
              </Link>
              <Link 
                to="/doctors/new" 
                className="block w-full p-2 text-center bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
              >
                Add Doctor
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Welcome to the EHR System Dashboard. This system allows you to manage doctors, patients, 
              and appointments efficiently.
            </p>
            <div className="mt-4 space-y-1">
              <p className="text-sm"><span className="font-medium">Version:</span> 1.0.0</p>
              <p className="text-sm"><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 