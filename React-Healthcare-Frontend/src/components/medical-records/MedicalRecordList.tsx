import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalRecord } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, FilePlus, FileText, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { medicalRecordService } from '../../api/medicalRecordService';

export default function MedicalRecordList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadMedicalRecords = async () => {
      try {
        setLoading(true);
        const data = await medicalRecordService.getMedicalRecords();
        if (Array.isArray(data)) {
          setRecords(data);
        } else {
          console.warn("Medical records data is not an array:", data);
          setRecords([]);
        }
      } catch (error) {
        console.error('Error loading medical records:', error);
        setError('Failed to load medical records');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadMedicalRecords();
  }, []);

  const filteredRecords = Array.isArray(records) ? records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.patientId?.toLowerCase().includes(searchLower) ||
      record.doctorId?.toLowerCase().includes(searchLower) ||
      record.diagnosis?.toLowerCase().includes(searchLower) ||
      record.prescription?.toLowerCase().includes(searchLower)
    );
  }) : [];

  const formatDate = (dateString: string) => {
    try {
      // Check if the date is in ISO format or YYYY-MM-DD format
      if (dateString.includes('T')) {
        return format(parseISO(dateString), 'MMM dd, yyyy');
      }
      // Simple date conversion for YYYY-MM-DD format
      const [year, month, day] = dateString.split('-').map(Number);
      return format(new Date(year, month - 1, day), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if parsing fails
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <Button onClick={() => navigate('/medical-records/new')}>
          <FilePlus className="mr-2 h-4 w-4" />
          Add New Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Records</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p>{error}</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchTerm ? 'No records found matching your search.' : 'No medical records found.'}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Doctor ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.patientId}</TableCell>
                      <TableCell>{record.doctorId}</TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/medical-records/${record.id}`)}
                          title="View Details"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 