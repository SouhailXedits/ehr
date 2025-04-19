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

export default function AppointmentForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    status: true
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
        status: data.status
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
          patName: patient.patName
        }));
      }
    }
  }, [searchParams, patients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await appointmentService.updateAppointment(Number(id), formData as UpdateAppointmentData);
      } else {
        await appointmentService.createAppointment(formData);
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
        patName: patient.patName
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