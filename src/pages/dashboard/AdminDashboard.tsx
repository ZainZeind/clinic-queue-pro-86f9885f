import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Users, UserCog, Calendar, Clock, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo.png';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
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
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section with Logo */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-white">
          <div className="absolute right-8 top-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <img src={logoImage} alt="Klinik Sehat Logo" className="h-32 w-32 object-contain" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">{getGreeting()}, {user?.full_name}! 🎯</h1>
            <p className="text-white/90 text-lg">Monitoring & Kelola Sistem Klinik Sehat</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{getCurrentDate()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Status Sistem: Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview Stats */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Ringkasan Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pasien</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats?.stats?.totalPatients || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Terdaftar di sistem</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Dokter</CardTitle>
                <UserCog className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats?.stats?.totalDoctors || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Dokter aktif</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Janji Hari Ini</CardTitle>
                <Calendar className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats?.stats?.todayAppointments || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Jadwal hari ini</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Antrian Menunggu</CardTitle>
                <Clock className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats?.stats?.todayQueue || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Perlu perhatian</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Aktivitas Terbaru - Pendaftaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentAppointments?.length > 0 ? (
                stats.recentAppointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{appointment.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Dr. {appointment.doctor_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{appointment.appointment_date}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.appointment_time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada pendaftaran
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
