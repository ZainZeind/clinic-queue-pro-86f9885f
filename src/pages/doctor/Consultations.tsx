import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MessageSquare, Send } from 'lucide-react';

export default function Consultations() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      const response = await api.getDoctorConsultations();
      setConsultations(response.consultations || []);
    } catch (error: any) {
      toast.error('Gagal memuat konsultasi');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = async (consultation: any) => {
    setSelectedConsultation(consultation);
    try {
      const response = await api.getDoctorConsultationMessages(consultation.patient_id);
      setMessages(response.messages || []);
      setChatDialogOpen(true);
    } catch (error: any) {
      toast.error('Gagal memuat pesan');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConsultation) return;

    try {
      await api.sendDoctorConsultationMessage(selectedConsultation.patient_id, newMessage);
      const response = await api.getDoctorConsultationMessages(selectedConsultation.patient_id);
      setMessages(response.messages || []);
      setNewMessage('');
      toast.success('Pesan terkirim');
    } catch (error: any) {
      toast.error('Gagal mengirim pesan');
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
          <h1 className="text-4xl font-bold">Konsultasi Online</h1>
          <p className="text-muted-foreground">Pesan dari pasien Anda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Konsultasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultations.length > 0 ? (
                consultations.map((consultation) => (
                  <div
                    key={consultation.patient_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{consultation.patient_name}</p>
                          {consultation.unread_count > 0 && (
                            <Badge variant="destructive">{consultation.unread_count} baru</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {consultation.last_message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(consultation.last_message_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenChat(consultation)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Buka Chat
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada konsultasi dari pasien
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                Chat dengan {selectedConsultation?.patient_name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === 'Dokter' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender === 'Dokter'
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
