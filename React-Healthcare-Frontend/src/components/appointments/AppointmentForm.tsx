import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Doctor, Patient } from '../../types';
import appointmentService, { CreateAppointmentData, UpdateAppointmentData } from '../../services/appointment';
import doctorService from '../../services/doctor';
import patientService from '../../services/patient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Info, CheckCircle } from 'lucide-react';

export default function AppointmentForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address, connectWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<CreateAppointmentData>({
    date: '',
    department: '',
    docID: '',
    docName: '',
    patID: '',
    patName: '',
    time: '',
    status: true,
    patient_address: address || ''  // Use connected wallet address
  });

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getDoctors();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        console.warn("Doctor data is not an array:", data);
        setDoctors([]);
      }
    } catch (error) {
      setError('Failed to load doctors');
      console.error('Error loading doctors:', error);
      setDoctors([]);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await patientService.getPatients();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        console.warn("Patient data is not an array:", data);
        setPatients([]);
      }
    } catch (error) {
      setError('Failed to load patients');
      console.error('Error loading patients:', error);
      setPatients([]);
    }
  };

  const loadAppointment = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await appointmentService.getAppointment(Number(id));
      setFormData({
        date: data.date,
        department: data.department,
        docID: data.docID,
        docName: data.docName,
        patID: data.patID,
        patName: data.patName,
        time: data.time,
        status: data.status,
        patient_address: data.patient_address || ''
      });
    } catch (error) {
      setError('Failed to load appointment');
      console.error('Error loading appointment:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDoctors();
    loadPatients();
    
    if (id) {
      loadAppointment();
    }
  }, [id, searchParams]);

  // Separate effect for handling patient selection
  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id.toString() === patientId);
      if (patient) {
        setFormData((prev: CreateAppointmentData) => ({ 
          ...prev, 
          patID: patient.patID,
          patName: patient.patName,
          patient_address: patient.patient_address
        }));
      }
    }
  }, [searchParams, patients]);

  useEffect(() => {
    // Update the form data when wallet address changes
    if (address) {
      setFormData(prev => ({
        ...prev,
        patient_address: address
      }));
    }
  }, [address]);

  // Get tomorrow's date in YYYY-MM-DD format for min date input
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await appointmentService.updateAppointment(Number(id), formData as UpdateAppointmentData);
      } else {
        if (!address) {
          setError('Please connect your MetaMask wallet to create an appointment');
          return;
        }
        await appointmentService.createAppointment({
          ...formData,
          patient_address: address  // Use connected wallet address
        });
      }
      navigate('/appointments');
    } catch (error) {
      setError('Failed to save appointment');
      console.error('Error saving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // For date input, validate it's not in the past
    if (name === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day for date comparison
      
      if (selectedDate < today) {
        setError('Appointment date cannot be in the past');
        return;
      } else {
        // Clear error if valid date selected
        setError('');
      }
    }
    
    setFormData((prev: CreateAppointmentData) => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (doctorId: string) => {
    if (!Array.isArray(doctors)) {
      console.error("doctors is not an array:", doctors);
      return;
    }
    
    const doctor = doctors.find(d => d.id?.toString() === doctorId);
    if (doctor) {
      setFormData((prev: CreateAppointmentData) => ({
        ...prev,
        docID: doctor.docID,
        docName: `${doctor.fName} ${doctor.lName}`,
        department: doctor.department
      }));
    }
  };

  const handlePatientChange = (patientId: string) => {
    if (!Array.isArray(patients)) {
      console.error("patients is not an array:", patients);
      return;
    }
    
    const patient = patients.find(p => p.id?.toString() === patientId);
    if (patient) {
      setFormData((prev: CreateAppointmentData) => ({
        ...prev,
        patID: patient.patID,
        patName: patient.patName,
        patient_address: patient.patient_address
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure doctors and patients are arrays before using in JSX
  const doctorsArray = Array.isArray(doctors) ? doctors : [];
  const patientsArray = Array.isArray(patients) ? patients : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {id ? 'Edit Appointment' : 'New Appointment'}
        </h2>
        <Button variant="outline" onClick={() => navigate('/appointments')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
        </div>
      )}

      {!address && !id && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Shield className="h-5 w-5" />
            <h3 className="font-semibold">Connect MetaMask</h3>
          </div>
          <p className="text-sm text-amber-600 mb-3">
            To create blockchain-secured appointments, please connect your MetaMask wallet. 
            This enables secure, tamper-proof appointment records.
          </p>
          <Button 
            onClick={connectWallet}
            className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
          >
            <img src="/metamask-fox.svg" alt="MetaMask" className="h-5 w-5" />
            Connect MetaMask
          </Button>
        </div>
      )}

      {address && !id && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-6">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-semibold">MetaMask Connected</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Your MetaMask wallet is connected. When you create an appointment:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>A small deposit will be taken from your connected wallet</li>
            <li>The appointment will be recorded on the Ethereum blockchain</li>
            <li>You'll receive a refund when the appointment is completed</li>
          </ul>
          <div className="mt-2 p-2 bg-gray-100 rounded flex items-center gap-2">
            <span className="text-xs text-gray-500">Connected Address:</span>
            <code className="text-xs text-gray-700 truncate">{address}</code>
          </div>
        </div>
      )}

      {!id && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Info className="h-5 w-5" />
            <h3 className="font-semibold">Blockchain-Secured Appointment</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            This appointment will be secured through the Ethereum blockchain using MetaMask, providing:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Tamper-proof record of your appointment</li>
            <li>Automated deposit refund when appointments are completed</li>
            <li>Transparent verification for all parties</li>
            <li>Enhanced security for your medical scheduling</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              value={doctorsArray.find(d => d.docID === formData.docID)?.id?.toString() || ''}
              onValueChange={handleDoctorChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctorsArray.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id?.toString() || ''}>
                    {doctor.fName} {doctor.lName} - {doctor.department || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select
              value={patientsArray.find(p => p.patID === formData.patID)?.id?.toString() || ''}
              onValueChange={handlePatientChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patientsArray.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id?.toString() || ''}>
                    {patient.patName} - {patient.patID}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              min={getTomorrowDate()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          {id && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData((prev: CreateAppointmentData) => ({ ...prev, status: value === "true" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Scheduled</SelectItem>
                  <SelectItem value="false">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Appointment'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 