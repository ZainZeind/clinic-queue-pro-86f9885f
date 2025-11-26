import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

export default function UserManagement() {
  console.log('🔍 UserManagement component rendering...');
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [filterRole, setFilterRole] = useState<string>('all');

  const [formData, setFormData] = useState({
    role: 'pasien',
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered, loading users...');
    loadUsers();
  }, [filterRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching users with filter:', filterRole);
      
      // Convert 'all' to empty string for API
      const roleFilter = filterRole === 'all' ? '' : filterRole;
      const response: any = await api.getAllUsers(roleFilter);
      console.log('✅ Users response:', response);
      
      // Handle different response formats
      const usersList = response?.users || response || [];
      console.log('📊 Users list:', usersList);
      
      setUsers(Array.isArray(usersList) ? usersList : []);
      
      if (usersList.length === 0) {
        console.log('⚠️ No users found');
        toast.info('Tidak ada data user');
      } else {
        console.log(`✅ Loaded ${usersList.length} users`);
      }
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      toast.error(error.message || 'Gagal memuat data user. Pastikan backend running.');
      setUsers([]);
    } finally {
      console.log('✅ Loading complete');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, { 
          role: formData.role,
          email: editingUser.email,
          full_name: editingUser.full_name 
        });
        toast.success('Role user berhasil diperbarui');
      }
      setDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Operasi gagal');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      role: user.role,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (user: any) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    
    try {
      await api.deleteUser(user.id, user.role);
      toast.success('User berhasil dihapus');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus user');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      role: 'pasien',
    });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500',
      dokter: 'bg-blue-500',
      pasien: 'bg-green-500',
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-500'}>
        {role}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Kelola User</h1>
            <p className="text-muted-foreground">Ubah role dan hapus user</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Role User</DialogTitle>
              </DialogHeader>
              {editingUser && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama User</Label>
                    <Input value={editingUser.full_name} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={editingUser.email} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="dokter">Dokter</SelectItem>
                        <SelectItem value="pasien">Pasien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">Update Role</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar User</CardTitle>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="dokter">Dokter</SelectItem>
                  <SelectItem value="pasien">Pasien</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Tgl Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {filterRole !== 'all' ? `Tidak ada user dengan role: ${filterRole}` : 'Belum ada user terdaftar'}
                </h3>
                <p className="text-muted-foreground">
                  {filterRole !== 'all'
                    ? 'Coba ganti filter untuk melihat user dengan role lain' 
                    : 'User baru dapat mendaftar melalui halaman registrasi'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </DashboardLayout>
  );
}
