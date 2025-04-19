import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Appointment } from '../../types';
import appointmentService from '../../services/appointment';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, ExternalLink, Shield, CheckCircle } from 'lucide-react';
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

  const renderBlockchainVerification = () => {
    if (!appointment?.blockchain_tx) return null;
    
    // Configure blockchain explorer URL based on environment
    // You can update this to use environment variables or a config file
    const explorerBaseUrl = "https://sepolia.etherscan.io"; // For Sepolia testnet
    const etherscanUrl = `${explorerBaseUrl}/tx/${appointment.blockchain_tx}`;
    
    // Function to handle verification link click
    const handleVerifyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Optional: add analytics tracking or validation here
      // If you want to prevent the link from opening when hash is invalid
      // e.preventDefault();
      // You could also show a modal with more information
    };
    
    return (
      <div className="mt-6 border rounded-lg p-4 bg-emerald-50">
        <div className="flex items-center gap-2 text-emerald-700 mb-2">
          <Shield className="h-5 w-5" />
          <h3 className="font-semibold">Blockchain Verified Appointment</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          This appointment is secured on the blockchain, ensuring it cannot be tampered with 
          and providing a permanent record of your medical schedule.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Immutable record - cannot be altered without your knowledge</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Verifiable by any party with your permission</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Financial security through deposit mechanism</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col space-y-2">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">Blockchain ID:</span>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {appointment.blockchain_id || 'Not available'}
            </code>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">Transaction Hash:</span>
            <div className="flex items-center">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded truncate ">
                {appointment.blockchain_tx}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
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
          
          {renderBlockchainVerification()}
          
          {appointment.status && (
            <Button variant="destructive" onClick={handleCancel} className="mt-6">
              Cancel Appointment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 