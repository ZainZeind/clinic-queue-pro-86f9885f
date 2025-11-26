import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Calendar, MessageSquare, Clock, FileText, Phone, MapPin, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logoImage from '@/assets/logo.png';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
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

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.getMyAppointments();
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
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

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending'
  );
  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section with Logo */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-white">
          <div className="absolute right-8 top-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <img src={logoImage} alt="Klinik Sehat Logo" className="h-32 w-32 object-contain" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">{getGreeting()}, {user?.full_name}! 👋</h1>
            <p className="text-white/90 text-lg">Selamat datang di Dashboard Pasien Klinik Sehat</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Senin - Sabtu: 08.00 - 20.00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Hotline: (021) 1234-5678</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Alert */}
        {upcomingAppointments.length > 0 && (
          <Alert className="border-accent bg-accent/5">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription>
              Anda memiliki <strong>{upcomingAppointments.length}</strong> janji temu mendatang. Harap datang 15 menit sebelum jadwal.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Janji Temu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{appointments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Semua waktu</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Perlu perhatian</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedAppointments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Riwayat kunjungan</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Layanan Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Link to="/dashboard/patient/registration">
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daftar Online</CardTitle>
                  <Calendar className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Buat janji temu dengan dokter
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/patient/consultation">
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Konsultasi</CardTitle>
                  <MessageSquare className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Konsultasi online dengan dokter
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/patient/queue">
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status Antrian</CardTitle>
                  <Clock className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Cek nomor antrian Anda
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/patient/history">
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Riwayat</CardTitle>
                  <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Lihat riwayat kunjungan
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Janji Temu Mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">Dr. {appointment.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Nomor Antrian: {appointment.queue_number || '-'}
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
                    Belum ada janji temu
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Kunjungan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedAppointments.length > 0 ? (
                  completedAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">Dr. {appointment.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">Selesai</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{appointment.appointment_date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada riwayat
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
