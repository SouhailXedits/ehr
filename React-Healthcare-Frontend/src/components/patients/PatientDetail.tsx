import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patient, Appointment } from '../../types';
import { patientService, appointmentService } from '../../api/services';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPatient = useCallback(async () => {
    if (hasLoaded) return; // Prevent multiple loads
    
    try {
      setLoading(true);
      const data = await patientService.getPatient(id!);
      setPatient(data);
      setHasLoaded(true); // Mark as loaded
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id, hasLoaded]);

  useEffect(() => {
  console.log(id)
    if (id) {
      loadPatient();
    }
  }, [id]);

  useEffect(() => {
    if (patient?.patID) {
      loadAppointments();
    }
  }, [patient, id]);

  const loadAppointments = async () => {
    try {
      if (!patient?.patID) return;
      
      // Get appointments for this patient using the specific endpoint
      const patientAppointments = await appointmentService.getAppointmentsByPatient(patient.patID);
      setAppointments(patientAppointments);
    } catch (error) {
      setError('Failed to load appointments');
      console.error('Error loading appointments:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        <p>{error || 'Patient not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/patients')}>
          Back to Patients
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/patients/${id}/edit`)}
          >
            Edit Patient
          </Button>
          <Button onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}>
            Book Appointment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback>
                {patient.patName.split(' ')[0]?.[0] || ''}
                {patient.patName.split(' ')[1]?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {patient.patName}
              </CardTitle>
              <p className="text-lg text-muted-foreground">Patient ID: {patient.patID}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Patient Information</h3>
              <p>
                <span className="text-muted-foreground">Patient ID:</span> {patient.patID}
              </p>
              <p>
                <span className="text-muted-foreground">Name:</span> {patient.patName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground">No appointment history</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      Dr. {appointment.docName} ({appointment.docID})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.date), 'MMMM d, yyyy')} at{' '}
                      {appointment.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Department: {appointment.department}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {appointment.status ? 'Active' : 'Cancelled'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 