import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function QueueStatus() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [queueData, setQueueData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.getMyAppointments();
      const activeAppointments = response.appointments?.filter(
        (a: any) => a.queue_status && a.queue_status !== 'Selesai' && a.queue_status !== 'Batal'
      ) || [];
      setAppointments(activeAppointments);

      const queueStatuses: any = {};
      for (const appointment of activeAppointments) {
        try {
          const queueResponse = await api.getQueueStatus(appointment.id);
          queueStatuses[appointment.id] = queueResponse;
        } catch (error) {
          console.error('Error loading queue status:', error);
        }
      }
      setQueueData(queueStatuses);
    } catch (error: any) {
      toast.error('Gagal memuat data antrian');
    } finally {
      setLoading(false);
    }
  };

  const getQueuePosition = (appointmentId: number) => {
    const data = queueData[appointmentId];
    if (!data) return null;

    const myQueueNumber = data.queue?.nomor_antrian;
    const currentQueueNumber = data.currentQueueNumber;

    if (!myQueueNumber) return null;

    const position = myQueueNumber - currentQueueNumber;
    return position > 0 ? position : 0;
  };

  const normalizeStatus = (status: string) => {
    if (!status) return 'waiting';
    const statusMap: any = {
      'Menunggu': 'waiting',
      'Dipanggil': 'in_progress',
      'Sedang Dilayani': 'in_progress',
      'Selesai': 'completed',
      'Batal': 'skipped'
    };
    return statusMap[status] || 'waiting';
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'waiting':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="w-8 h-8 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-gray-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
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
        <div>
          <h1 className="text-4xl font-bold">Status Antrian</h1>
          <p className="text-muted-foreground">
            Cek status antrian Anda secara real-time
          </p>
        </div>

        {appointments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((appointment) => {
              const queue = queueData[appointment.id]?.queue;
              const currentQueue = queueData[appointment.id]?.currentQueueNumber;
              const position = getQueuePosition(appointment.id);
              const queueStatus = queue?.status_antrian || appointment.queue_status;
              const normalizedStatus = normalizeStatus(queueStatus);

              return (
                <Card key={appointment.id} className="overflow-hidden">
                  <div
                    className={`h-2 ${
                      normalizedStatus === 'in_progress'
                        ? 'bg-green-500'
                        : normalizedStatus === 'completed'
                        ? 'bg-gray-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Dr. {appointment.doctor_name}</span>
                      {queueStatus && getStatusIcon(queueStatus)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tanggal & Waktu</p>
                        <p className="font-semibold">
                          {new Date(appointment.appointment_date).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.appointment_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Nomor Antrian Anda</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {queue?.nomor_antrian || appointment.queue_number || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {queue && (
                      <>
                        <div className="border-t pt-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Antrian Saat Ini
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <span className="text-2xl font-bold text-green-600">
                                    {currentQueue || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Status Antrian
                              </p>
                              <p className="font-semibold text-lg capitalize">
                                {normalizedStatus === 'waiting' && 'Menunggu'}
                                {normalizedStatus === 'in_progress' && 'Giliran Anda!'}
                                {normalizedStatus === 'completed' && 'Selesai'}
                                {normalizedStatus === 'skipped' && 'Dilewati'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {normalizedStatus === 'waiting' && position !== null && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-center">
                              <span className="text-sm text-muted-foreground">
                                Masih ada{' '}
                              </span>
                              <span className="text-2xl font-bold text-primary">
                                {position}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {' '}
                                antrian sebelum giliran Anda
                              </span>
                            </p>
                          </div>
                        )}

                        {normalizedStatus === 'in_progress' && (
                          <div className="bg-green-500/10 p-4 rounded-lg border-2 border-green-500">
                            <p className="text-center text-green-600 font-bold text-lg">
                              🔔 Giliran Anda! Silakan menuju ruang praktek dokter
                            </p>
                          </div>
                        )}

                        {normalizedStatus === 'completed' && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-center text-muted-foreground">
                              Konsultasi Anda telah selesai
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {appointment.complaint && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-1">Keluhan</p>
                        <p className="text-sm">{appointment.complaint}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold">Tidak Ada Antrian Aktif</h3>
                  <p className="text-muted-foreground mt-2">
                    Anda belum memiliki antrian yang aktif saat ini
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informasi</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Status antrian diperbarui secara otomatis setiap 10 detik</li>
              <li>Harap datang 15 menit sebelum waktu janji temu Anda</li>
              <li>Jika nomor Anda dipanggil, segera menuju ruang praktek dokter</li>
              <li>Hubungi resepsionis jika ada pertanyaan mengenai antrian Anda</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
