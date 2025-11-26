import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';

export default function Registration() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      loadTimeSlots();
    } else {
      setTimeSlots([]);
      setAppointmentTime('');
    }
  }, [selectedDoctor, appointmentDate]);

  const loadDoctors = async () => {
    try {
      const response = await api.getDoctors();
      setDoctors(response.doctors || []);
    } catch (error: any) {
      toast.error('Gagal memuat daftar dokter');
    }
  };

  const loadTimeSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await api.getAvailableTimeSlots(parseInt(selectedDoctor), appointmentDate);
      
      if (response.slots && response.slots.length > 0) {
        setTimeSlots(response.slots);
      } else {
        setTimeSlots([]);
        if (response.message) {
          toast.info(response.message);
        }
      }
    } catch (error: any) {
      toast.error('Gagal memuat slot waktu');
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentTime) {
      toast.error('Silakan pilih slot waktu terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const response = await api.createAppointment({
        doctor_id: parseInt(selectedDoctor),
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        complaint,
      });

      toast.success(`Pendaftaran berhasil! Nomor antrian Anda: ${response.queueNumber}`);
      navigate('/dashboard/patient');
    } catch (error: any) {
      toast.error(error.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  const getSlotColor = (slot: any) => {
    if (slot.isFull) return 'bg-red-100 border-red-300 cursor-not-allowed opacity-60';
    if (slot.availableSlots <= 5) return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
    return 'bg-green-100 border-green-300 hover:bg-green-200';
  };

  const getSlotBadgeColor = (slot: any) => {
    if (slot.isFull) return 'bg-red-500';
    if (slot.availableSlots <= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Pendaftaran Online</h1>
          <p className="text-muted-foreground">Daftar untuk janji temu dengan dokter</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="doctor">Pilih Dokter</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokter" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>

              {selectedDoctor && appointmentDate && (
                <div className="space-y-2">
                  <Label>Pilih Slot Waktu</Label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isFull}
                          onClick={() => setAppointmentTime(slot.time)}
                          className={`
                            p-4 border-2 rounded-lg transition-all
                            ${getSlotColor(slot)}
                            ${appointmentTime === slot.time ? 'ring-2 ring-primary border-primary' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold text-sm">{slot.displayTime}</span>
                            </div>
                            <Badge className={getSlotBadgeColor(slot)}>
                              {slot.availableSlots}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>
                              {slot.isFull 
                                ? 'Penuh' 
                                : `${slot.availableSlots}/${slot.maxCapacity} tersedia`
                              }
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Dokter tidak praktik di tanggal ini
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="complaint">Keluhan</Label>
                <Textarea
                  id="complaint"
                  placeholder="Jelaskan keluhan Anda"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
