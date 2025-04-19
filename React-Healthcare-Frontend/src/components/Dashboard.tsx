import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Shield, Lock, FileCheck, Clock, RefreshCw } from 'lucide-react';
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
      
      {/* Blockchain Benefits Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Blockchain-Powered Healthcare</CardTitle>
          </div>
          <CardDescription>
            Our EHR system uses blockchain technology to enhance security, privacy, and trust
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Immutable Records</h3>
                <p className="text-sm text-gray-600">
                  All appointments are securely stored on the blockchain, creating 
                  permanent, tamper-proof medical records that cannot be altered.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Verifiable Appointments</h3>
                <p className="text-sm text-gray-600">
                  Every appointment can be independently verified on the blockchain, 
                  providing proof of medical visits for insurance or legal purposes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Financial Security</h3>
                <p className="text-sm text-gray-600">
                  Deposits for appointments are managed through smart contracts, ensuring 
                  fair refund policies and reducing no-shows.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Transparent History</h3>
                <p className="text-sm text-gray-600">
                  Access your complete appointment history with cryptographic proof of 
                  when appointments were scheduled, confirmed, and completed.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-md text-sm text-blue-800">
            <p className="font-medium">How it works:</p>
            <p className="text-gray-600 mt-1">
              When you book an appointment, it's recorded on the Ethereum blockchain with a 
              unique transaction ID. This creates a permanent record that can be verified by 
              you or your healthcare providers. Visit any appointment detail page to see 
              blockchain verification information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 