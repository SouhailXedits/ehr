import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doctorService } from '../../api/services';
import { Doctor } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface FormData {
  docID: string;
  fName: string;
  lName: string;
  emailID: string;
  city: string;
  state: string;
  department: string;
  Doj: string;
  address: string;
  image: File | null;
}

export default function DoctorForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    docID: '',
    fName: '',
    lName: '',
    emailID: '',
    city: '',
    state: '',
    department: '',
    Doj: new Date().toISOString().split('T')[0],
    address: '',
    image: null
  });

  useEffect(() => {
    if (id) {
      loadDoctor();
    }
  }, [id]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctor(id!);
      setFormData({
        docID: data.docID,
        fName: data.fName,
        lName: data.lName,
        emailID: data.emailID,
        city: data.city,
        state: data.state,
        department: data.department,
        Doj: data.Doj,
        address: data.address || '',
        image: null
      });
    } catch (error) {
      setError('Failed to load doctor details');
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });

      if (id) {
        await doctorService.updateDoctor(id, formDataToSend);
      } else {
        await doctorService.createDoctor(formDataToSend);
      }
      navigate('/doctors');
    } catch (error) {
      setError('Failed to save doctor information');
      console.error('Error saving doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading && id) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{id ? 'Edit Doctor' : 'Add New Doctor'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="docID">Doctor ID</Label>
              <Input
                id="docID"
                name="docID"
                value={formData.docID}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fName">First Name</Label>
              <Input
                id="fName"
                name="fName"
                value={formData.fName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lName">Last Name</Label>
              <Input
                id="lName"
                name="lName"
                value={formData.lName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailID">Email</Label>
              <Input
                id="emailID"
                name="emailID"
                type="email"
                value={formData.emailID}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Doj">Date of Joining</Label>
              <Input
                id="Doj"
                name="Doj"
                type="date"
                value={formData.Doj}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Blockchain Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="0x..."
                className="font-mono"
              />
              <p className="text-xs text-gray-500">Required for blockchain operations like appointments</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate('/doctors')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Doctor'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 