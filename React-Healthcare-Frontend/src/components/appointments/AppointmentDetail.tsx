import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Appointment } from '../../types';
import appointmentService from '../../services/appointment';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointment(Number(id));
      setAppointment(data);
    } catch (error) {
      setError('Failed to load appointment details');
      console.error('Error loading appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const handleCancel = async () => {
    if (!appointment) return;
    try {
      await appointmentService.cancelAppointment(appointment.id);
      navigate('/appointments');
    } catch (error) {
      setError('Failed to cancel appointment');
      console.error('Error canceling appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>Appointment not found</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">
                {appointment.docName?.split(' ')[0][0]}
                {appointment.docName?.split(' ')[1]?.[0] || ''}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium">
                  Dr. {appointment.docName}
              </h3>
              <p className="text-sm text-muted-foreground">{appointment.department}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <div>
              <span className="font-medium">Date:</span>{' '}
              {format(new Date(appointment.date), 'PPP')}
            </div>
            <div>
              <span className="font-medium">Time:</span>{' '}
              {appointment.time}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span className={`capitalize ${!appointment.status ? 'text-destructive' : ''}`}>
                {appointment.status ? 'Scheduled' : 'Cancelled'}
              </span>
            </div>
            <div>
              <span className="font-medium">Patient:</span>{' '}
              <span className="text-muted-foreground">{appointment.patName}</span>
            </div>
          </div>
          {appointment.status && (
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Appointment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 