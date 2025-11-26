import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Phone, CheckCircle, SkipForward } from 'lucide-react';

export default function QueueManagement() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      console.log('🔍 Loading queue...');
      const response = await api.getTodayQueue();
      console.log('📦 Queue response:', response);
      console.log('📊 Queue data:', response.queue);
      setQueue(response.queue || []);
      
      if (response.queue && response.queue.length > 0) {
        console.log('✅ Found', response.queue.length, 'queue items');
        console.log('📝 First queue item:', response.queue[0]);
      } else {
        console.log('⚠️ No queue items found');
      }
    } catch (error: any) {
      console.error('❌ Load queue error:', error);
      toast.error(error.message || 'Gagal memuat antrian');
    } finally {
      setLoading(false);
    }
  };

  const handleCallQueue = async (queueId: number) => {
    try {
      await api.callQueue(queueId);
      toast.success('Antrian dipanggil');
      loadQueue();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memanggil antrian');
    }
  };

  const handleCompleteQueue = async (queueId: number) => {
    try {
      await api.completeQueue(queueId);
      toast.success('Antrian selesai');
      loadQueue();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyelesaikan antrian');
    }
  };

  const handleSkipQueue = async (queueId: number) => {
    try {
      await api.skipQueue(queueId);
      toast.success('Antrian dilewati');
      loadQueue();
    } catch (error: any) {
      toast.error(error.message || 'Gagal melewati antrian');
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

  console.log('🔄 Filtering queue. Total items:', queue.length);
  const waitingQueue = queue.filter((q) => {
    console.log('Checking queue item:', q.queue_number, 'status:', q.status);
    return q.status === 'waiting';
  });
  const inProgressQueue = queue.filter((q) => q.status === 'in_progress');
  const completedQueue = queue.filter((q) => q.status === 'completed');
  
  console.log('📊 Queue breakdown:', {
    waiting: waitingQueue.length,
    inProgress: inProgressQueue.length,
    completed: completedQueue.length
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Kelola Antrian</h1>
          <p className="text-muted-foreground">Atur antrian pasien hari ini</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Menunggu ({waitingQueue.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waitingQueue.map((q) => (
                  <div key={q.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                          {q.queue_number}
                        </div>
                        <div>
                          <p className="font-semibold">{q.patient_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {q.doctor_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleCallQueue(q.id)}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Panggil
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSkipQueue(q.id)}
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {waitingQueue.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Tidak ada antrian menunggu
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sedang Dilayani ({inProgressQueue.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inProgressQueue.map((q) => (
                  <div key={q.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center font-bold text-lg text-green-600">
                          {q.queue_number}
                        </div>
                        <div>
                          <p className="font-semibold">{q.patient_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {q.doctor_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCompleteQueue(q.id)}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Selesai
                    </Button>
                  </div>
                ))}
                {inProgressQueue.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Tidak ada yang sedang dilayani
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selesai ({completedQueue.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedQueue.slice(0, 5).map((q) => (
                  <div key={q.id} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center font-bold text-lg text-gray-600">
                        {q.queue_number}
                      </div>
                      <div>
                        <p className="font-semibold">{q.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Dr. {q.doctor_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {completedQueue.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada yang selesai
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
