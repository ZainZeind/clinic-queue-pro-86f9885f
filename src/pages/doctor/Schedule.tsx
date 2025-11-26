import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';

export default function Schedule() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const [formData, setFormData] = useState({
    day_of_week: 'Senin',
    start_time: '',
    end_time: '',
    max_patients: 20,
    notes: '',
    is_active: true,
  });

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await api.getDoctorSchedules();
      setSchedules(response.schedules || []);
    } catch (error: any) {
      toast.error('Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Build schedules object from current state + new data
      const currentSchedules: any = {};
      schedules.forEach(s => {
        if (editingSchedule && s.day_of_week === editingSchedule.day_of_week) {
          // Skip the one being edited
          return;
        }
        const timeStr = s.start_time && s.end_time ? `${s.start_time}-${s.end_time}` : s.time;
        currentSchedules[s.day_of_week.toLowerCase()] = timeStr;
      });
      
      // Add new/edited schedule
      const timeStr = `${formData.start_time}-${formData.end_time}`;
      currentSchedules[formData.day_of_week.toLowerCase()] = timeStr;
      
      await api.createSchedule({ schedules: currentSchedules });
      toast.success('Jadwal berhasil diperbarui');
      setDialogOpen(false);
      resetForm();
      loadSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Operasi gagal');
    }
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    // Parse time from "08:00-14:00" format
    const times = schedule.time ? schedule.time.split('-') : ['', ''];
    setFormData({
      day_of_week: schedule.day_of_week,
      start_time: times[0] || schedule.start_time || '',
      end_time: times[1] || schedule.end_time || '',
      max_patients: schedule.max_patients || 20,
      notes: schedule.notes || '',
      is_active: schedule.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (schedule: any) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      // Build schedules object without the deleted day
      const currentSchedules: any = {};
      schedules.forEach(s => {
        if (s.day_of_week !== schedule.day_of_week) {
          const timeStr = s.start_time && s.end_time ? `${s.start_time}-${s.end_time}` : s.time;
          currentSchedules[s.day_of_week.toLowerCase()] = timeStr;
        }
      });
      
      await api.createSchedule({ schedules: currentSchedules });
      toast.success('Jadwal berhasil dihapus');
      loadSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus jadwal');
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      day_of_week: 'Senin',
      start_time: '',
      end_time: '',
      max_patients: 20,
      notes: '',
      is_active: true,
    });
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Jadwal Praktik</h1>
            <p className="text-muted-foreground">Kelola jadwal praktik Anda</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Hari</Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Jam Mulai</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Jam Selesai</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_patients">Maksimal Pasien</Label>
                  <Input
                    id="max_patients"
                    type="number"
                    min="1"
                    value={formData.max_patients}
                    onChange={(e) =>
                      setFormData({ ...formData, max_patients: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Misal: Khusus pasien umum, dll"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingSchedule ? 'Update' : 'Tambah'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {daysOfWeek.map((day) => {
            const daySchedules = schedules.filter((s) => s.day_of_week === day);
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    {day}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {daySchedules.length > 0 ? (
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-semibold">
                                  {schedule.start_time} - {schedule.end_time}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Maks. {schedule.max_patients} pasien
                                </p>
                              </div>
                              {schedule.notes && (
                                <p className="text-sm text-muted-foreground italic">
                                  {schedule.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(schedule)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Tidak ada jadwal praktik
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
