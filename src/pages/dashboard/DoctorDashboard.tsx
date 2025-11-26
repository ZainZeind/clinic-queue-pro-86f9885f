import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Users, Calendar, Clock, Stethoscope, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo.png';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const jakartaTime = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Jakarta',
      hour12: false,
      hour: 'numeric'
    });
    const hour = parseInt(jakartaTime);
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    loadTodayPatients();
  }, []);

  const loadTodayPatients = async () => {
    try {
      const response = await api.getTodayPatients();
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
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
        {/* Welcome Section with Logo */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-white">
          <div className="absolute right-8 top-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <img src={logoImage} alt="Klinik Sehat Logo" className="h-32 w-32 object-contain" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">{getGreeting()}, Dr. {user?.full_name}! 👨‍⚕️</h1>
            <p className="text-white/90 text-lg">Semangat melayani pasien hari ini</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{getCurrentDate()}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu</CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{waitingPatients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Pasien di antrian</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Dilayani</CardTitle>
              <Activity className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{inProgressPatients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Dalam pemeriksaan</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Selesai</CardTitle>
              <Calendar className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedPatients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Pasien dilayani</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Hari Ini</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{patients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Semua pasien</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Daftar Pasien Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                        {patient.queue_number}
                      </div>
                      <div>
                        <p className="font-semibold">{patient.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.phone || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">
                        {patient.queue_status === 'waiting' && 'Menunggu'}
                        {patient.queue_status === 'in_progress' && 'Sedang Dilayani'}
                        {patient.queue_status === 'completed' && 'Selesai'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {patient.appointment_time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada pasien hari ini
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
