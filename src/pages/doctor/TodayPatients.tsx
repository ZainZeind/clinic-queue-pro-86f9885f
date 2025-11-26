import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Users, Clock, CheckCircle } from 'lucide-react';

export default function TodayPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayPatients();
    const interval = setInterval(loadTodayPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTodayPatients = async () => {
    try {
      console.log('🔍 [Doctor Frontend] Loading today patients...');
      const response = await api.getTodayPatients();
      console.log('📦 [Doctor Frontend] Patients response:', response);
      console.log('📊 [Doctor Frontend] Patients data:', response.patients);
      setPatients(response.patients || []);
      
      if (response.patients && response.patients.length > 0) {
        console.log('✅ [Doctor Frontend] Found', response.patients.length, 'patients');
        console.log('📝 [Doctor Frontend] First patient:', response.patients[0]);
      } else {
        console.log('⚠️ [Doctor Frontend] No patients found');
      }
    } catch (error: any) {
      console.error('❌ [Doctor Frontend] Load patients error:', error);
      toast.error('Gagal memuat data pasien');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting: { label: 'Menunggu', color: 'bg-yellow-500' },
      in_progress: { label: 'Sedang Dilayani', color: 'bg-green-500' },
      completed: { label: 'Selesai', color: 'bg-gray-500' },
      skipped: { label: 'Dilewati', color: 'bg-red-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-500',
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const waitingPatients = patients.filter((p) => p.queue_status === 'waiting');
  const inProgressPatients = patients.filter((p) => p.queue_status === 'in_progress');
  const completedPatients = patients.filter((p) => p.queue_status === 'completed');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Pasien Hari Ini</h1>
          <p className="text-muted-foreground">
            Daftar pasien yang terdaftar hari ini ({new Date().toLocaleDateString('id-ID')})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waitingPatients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedang Dilayani</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressPatients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedPatients.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Lengkap ({patients.length} pasien)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        {getStatusIcon(patient.queue_status)}
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                          {patient.queue_number}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{patient.full_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{patient.phone || '-'}</span>
                            {patient.date_of_birth && (
                              <span>
                                {new Date().getFullYear() -
                                  new Date(patient.date_of_birth).getFullYear()}{' '}
                                tahun
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {getStatusBadge(patient.queue_status)}
                      <p className="text-sm text-muted-foreground">
                        {patient.appointment_time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada pasien yang terdaftar hari ini
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {patients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Keluhan Pasien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patients
                  .filter((p) => p.complaint)
                  .map((patient) => (
                    <div key={patient.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{patient.full_name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {patient.complaint}
                          </p>
                        </div>
                        <Badge>{patient.queue_number}</Badge>
                      </div>
                    </div>
                  ))}
                {patients.filter((p) => p.complaint).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Tidak ada keluhan yang dicatat
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
