import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MedicalRecord } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Loader2, ArrowLeft, FileEdit, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { format, parseISO } from 'date-fns';
import { medicalRecordService } from '../../api/services';

export default function MedicalRecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedicalRecord = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await medicalRecordService.getMedicalRecordById(parseInt(id));
        setRecord(data);
      } catch (error) {
        console.error('Error loading medical record:', error);
        setError('Failed to load medical record');
      } finally {
        setLoading(false);
      }
    };

    loadMedicalRecord();
  }, [id]);

  const handleDelete = async () => {
    if (!record || !window.confirm('Are you sure you want to delete this medical record?')) return;
    
    try {
      setLoading(true);
      await medicalRecordService.deleteMedicalRecord(record.id);
      navigate('/medical-records');
    } catch (error) {
      console.error('Error deleting medical record:', error);
      setError('Failed to delete medical record');
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

  if (error || !record) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/medical-records')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>{error || 'Record not found'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/medical-records')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/medical-records/${id}/edit`)}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Edit Record
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Medical Record #{record.id}</CardTitle>
          <CardDescription>
            Created for Patient {record.patientId} on {formatDate(record.date)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Patient Information</h3>
              <Separator className="my-2" />
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-muted-foreground">Patient ID:</dt>
                  <dd>{record.patientId}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-medium">Doctor Information</h3>
              <Separator className="my-2" />
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-muted-foreground">Doctor ID:</dt>
                  <dd>{record.doctorId}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Medical Details</h3>
            <Separator className="my-2" />
            <dl className="space-y-4">
              <div>
                <dt className="font-medium text-muted-foreground">Date:</dt>
                <dd className="mt-1">{formatDate(record.date)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Diagnosis:</dt>
                <dd className="mt-1">{record.diagnosis}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Prescription:</dt>
                <dd className="mt-1 whitespace-pre-line">{record.prescription}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Notes:</dt>
                <dd className="mt-1 whitespace-pre-line rounded-md bg-muted p-4">
                  {record.notes || 'No additional notes'}
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 