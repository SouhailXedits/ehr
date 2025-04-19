import { useEffect, useState } from 'react';
import { Doctor } from '../../types';
import { doctorService } from '../../api/services';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Define a manual interface to match the actual data structure if needed

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors();
      // Cast to DoctorWithDocName to handle the type discrepancy
      setDoctors(Array.isArray(data) ? data as Doctor[] : []);
    } catch (error) {
      setError('Failed to load doctors');
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
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
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Doctors</h2>
        <Button onClick={() => navigate('/doctors/new')}>Add Doctor</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No doctors found. Add a new doctor to get started.
          </div>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      {doctor.fName?.split(' ')[0]?.[0] || 'D'}
                      {doctor.fName?.split(' ')[1]?.[0] || ''}
                    </div>
                  </div>
                  <div>
                    <CardTitle>
                      Dr. {doctor.fName || 'Unknown'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{doctor.department || 'Unknown Department'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {doctor.emailID || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Location:</span> {doctor.city || 'N/A'}, {doctor.state || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Joined:</span>{' '}
                    {doctor.Doj ? new Date(doctor.Doj).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 