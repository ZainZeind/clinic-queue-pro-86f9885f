import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, MessageSquare, Send, Video } from 'lucide-react';

export default function Consultation() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    doctor_id: '',
    consultation_type: 'chat',
    scheduled_at: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [doctorsRes, consultationsRes] = await Promise.all([
        api.getDoctors(),
        api.getMyConsultations(),
      ]);
      setDoctors(doctorsRes.doctors || []);
      setConsultations(consultationsRes.consultations || []);
    } catch (error: any) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send first message to create consultation
      await api.sendConsultationMessage(
        parseInt(formData.doctor_id), 
        formData.notes || 'Halo Dokter, saya ingin berkonsultasi.'
      );
      toast.success('Konsultasi berhasil dibuat');
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat konsultasi');
    }
  };

  const handleOpenChat = async (consultation: any) => {
    setSelectedConsultation(consultation);
    try {
      const response = await api.getConsultationMessages(consultation.doctor_id);
      setMessages(response.messages || []);
      setChatDialogOpen(true);
    } catch (error: any) {
      toast.error('Gagal memuat pesan');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConsultation) return;

    try {
      await api.sendConsultationMessage(selectedConsultation.doctor_id, newMessage);
      const response = await api.getConsultationMessages(selectedConsultation.doctor_id);
      setMessages(response.messages || []);
      setNewMessage('');
      toast.success('Pesan terkirim');
    } catch (error: any) {
      toast.error('Gagal mengirim pesan');
    }
  };

  const resetForm = () => {
    setFormData({
      doctor_id: '',
      consultation_type: 'chat',
      scheduled_at: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', color: 'bg-yellow-500' },
      active: { label: 'Aktif', color: 'bg-green-500' },
      completed: { label: 'Selesai', color: 'bg-gray-500' },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-500',
    };

    return <Badge className={config.color}>{config.label}</Badge>;
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
            <h1 className="text-4xl font-bold">Konsultasi Online</h1>
            <p className="text-muted-foreground">Konsultasi dengan dokter secara online</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Konsultasi Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Konsultasi Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Pilih Dokter</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                    required
                  >
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
                  <Label htmlFor="type">Tipe Konsultasi</Label>
                  <Select
                    value={formData.consultation_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, consultation_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="video">Video Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">Jadwal (opsional)</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Jelaskan keluhan Anda"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Buat Konsultasi</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Konsultasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultations.length > 0 ? (
                consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          consultation.consultation_type === 'video'
                            ? 'bg-blue-500/10'
                            : 'bg-green-500/10'
                        }`}
                      >
                        {consultation.consultation_type === 'video' ? (
                          <Video className="w-6 h-6 text-blue-500" />
                        ) : (
                          <MessageSquare className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">Dr. {consultation.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {consultation.scheduled_at
                            ? new Date(consultation.scheduled_at).toLocaleString('id-ID')
                            : 'Tidak terjadwal'}
                        </p>
                        {consultation.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {consultation.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(consultation.status)}
                      {consultation.consultation_type === 'chat' &&
                        consultation.status === 'active' && (
                          <Button size="sm" onClick={() => handleOpenChat(consultation)}>
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Buka Chat
                          </Button>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada riwayat konsultasi
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                Chat dengan Dr. {selectedConsultation?.doctor_name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_name !== selectedConsultation?.doctor_name
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender_name !== selectedConsultation?.doctor_name
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">{msg.sender_name}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">Belum ada pesan</p>
              )}
            </div>
            <div className="flex space-x-2 mt-4">
              <Input
                placeholder="Ketik pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
