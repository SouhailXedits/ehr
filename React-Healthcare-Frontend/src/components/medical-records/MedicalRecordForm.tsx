import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MedicalRecord } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

type FormData = Omit<MedicalRecord, 'id'> & { id?: number };

export default function MedicalRecordForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isEditMode = Boolean(id);
  const formTitle = isEditMode ? 'Edit Medical Record' : 'Add Medical Record';
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    doctorId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  useEffect(() => {
    const loadMedicalRecord = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const response = await api.get(`/medical-records/${id}/`);
        const record = response.data;
        
        setFormData({
          id: record.id,
          patientId: record.patientId,
          doctorId: record.doctorId,
          date: record.date,
          diagnosis: record.diagnosis,
          prescription: record.prescription,
          notes: record.notes
        });
      } catch (error) {
        console.error('Error loading medical record:', error);
        setError('Failed to load medical record');
      } finally {
        setLoading(false);
      }
    };

    loadMedicalRecord();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Mock API call - would be replaced with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message and redirect
      const successMessage = isEditMode 
        ? 'Medical record updated successfully!' 
        : 'Medical record created successfully!';
      
      alert(successMessage);
      navigate('/medical-records');
    } catch (error) {
      console.error('Error saving medical record:', error);
      setError('Failed to save medical record');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && isEditMode) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/medical-records')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/medical-records')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Records
          </Button>
          <h1 className="text-2xl font-bold">{formTitle}</h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Medical Record Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor ID</Label>
                <Input
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea
                id="prescription"
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about the patient's condition, treatment plan, or follow-up instructions"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate('/medical-records')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Record' : 'Save Record'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 