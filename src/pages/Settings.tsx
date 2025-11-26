import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { User, Bell, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = () => {
    // Simulate API call
    toast({
      title: "Profil diperbarui",
      description: "Perubahan profil Anda telah disimpan.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Pengaturan notifikasi disimpan",
      description: "Preferensi notifikasi Anda telah diperbarui.",
    });
  };

  const handleChangePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Password baru dan konfirmasi password harus sama.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password minimal 6 karakter.",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    toast({
      title: "Password diubah",
      description: "Password Anda telah berhasil diubah.",
    });
    
    setPasswords({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola preferensi akun Anda</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input 
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Telepon</Label>
                  <Input 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+62 812-3456-7890"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveProfile}
                className="bg-gradient-primary hover:shadow-glow-primary"
              >
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifikasi</p>
                  <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifikasi</p>
                  <p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifikasi</p>
                  <p className="text-sm text-muted-foreground">Terima notifikasi melalui SMS</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                />
              </div>
              <Button 
                onClick={handleSaveNotifications}
                variant="outline"
              >
                Simpan Pengaturan Notifikasi
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Password Lama</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Password Baru</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                />
              </div>
              <Button 
                variant="outline"
                onClick={handleChangePassword}
                disabled={!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword}
              >
                Ubah Password
              </Button>
            </CardContent>
          </Card>


        </div>
      </div>
    </DashboardLayout>
  );
}
