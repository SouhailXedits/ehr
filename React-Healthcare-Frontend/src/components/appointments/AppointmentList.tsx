import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../../types';
import { appointmentService } from '../../api/services';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments();
      console.log(data);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to load appointments');
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log(appointments);


  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <Button onClick={() => navigate('/appointments/new')}>New Appointment</Button>
      </div>

      <div className="grid gap-4">
        {!Array.isArray(appointments) || appointments.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg">
            No appointments found. Create a new appointment to get started.
          </div>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {appointment.docName?.split(' ')[0]?.[0] || 'D'}
                        {appointment.docName?.split(' ')[1]?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        Dr. {appointment.docName || 'Unknown'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {appointment.department || 'Unknown Department'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {appointment.date ? format(new Date(appointment.date), 'MMMM d, yyyy') : 'No date'}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.time || 'No time'}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {appointment.status ? 'Active' : 'Cancelled'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {appointment.patName?.split(' ')[0]?.[0] || 'P'}
                        {appointment.patName?.split(' ')[1]?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {appointment.patName || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Patient ID: {appointment.patID || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 