import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Doctor, Appointment } from '../../types';
import { doctorService, appointmentService } from '../../api/services';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDoctor();
    }
  }, [id]);

  useEffect(() => {
    if (doctor?.docID) {
      loadAppointments();
    }
  }, [doctor]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctor(id!);
      setDoctor(data);
    } catch (error) {
      setError('Failed to load doctor details');
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      if (!doctor?.docID) return;
      
      // Get appointments for the doctor using the specific endpoint
      const doctorAppointments = await appointmentService.getAppointmentsByDoctor(doctor.docID);
      setAppointments(doctorAppointments);
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

  if (error || !doctor) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        <p>{error || 'Doctor not found'}</p>
      </div>
    );
  }
  console.log(doctor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/doctors')}>
          Back to Doctors
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/doctors/${id}/edit`)}
          >
            Edit Doctor
          </Button>
          <Button onClick={() => navigate(`/appointments/new?doctorId=${doctor.id}`)}>
            Book Appointment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback>
                {doctor.fName?.split(' ')[0]?.[0] || ''}
                {doctor.fName?.split(' ')[1]?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                Dr. {doctor.fName}
              </CardTitle>
              <p className="text-lg text-muted-foreground">{doctor.department}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Contact Information</h3>
              <p>
                <span className="text-muted-foreground">Email:</span> {doctor.emailID}
              </p>
              <p>
                <span className="text-muted-foreground">Location:</span> {doctor.city},{' '}
                {doctor.state}
              </p>
              <p>
                <span className="text-muted-foreground">Joined:</span>{' '}
                {format(new Date(doctor.Doj), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Professional Information</h3>
              <p>
                <span className="text-muted-foreground">Doctor ID:</span> {doctor.docID}
              </p>
              <p>
                <span className="text-muted-foreground">Department:</span>{' '}
                {doctor.department}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {appointment.patName} ({appointment.patID})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.date), 'MMMM d, yyyy')} at{' '}
                      {appointment.time}
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