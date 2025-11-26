import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import Logo from './Logo';
import {
  Calendar,
  ClipboardList,
  Users,
  LogOut,
  Home,
  MessageSquare,
  Bell,
  FileText,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [unreadNotifications] = useState(3); // Simulated notification count

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/admin' },
        { icon: ClipboardList, label: 'Kelola Antrian', path: '/dashboard/admin/queue' },
        { icon: Users, label: 'Kelola User', path: '/dashboard/admin/users' },
        { icon: FileText, label: 'Database Pasien', path: '/dashboard/admin/patients' },
        { icon: Bell, label: 'Notifikasi', path: '/dashboard/admin/notifications' },
      ];
    } else if (user?.role === 'dokter') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/doctor' },
        { icon: Calendar, label: 'Jadwal Praktik', path: '/dashboard/doctor/schedule' },
        { icon: FileText, label: 'Rekam Medis', path: '/dashboard/doctor/medical-records' },
        { icon: Users, label: 'Pasien Hari Ini', path: '/dashboard/doctor/patients' },
      ];
    } else {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/patient' },
        { icon: Calendar, label: 'Daftar Online', path: '/dashboard/patient/registration' },
        { icon: MessageSquare, label: 'Konsultasi', path: '/dashboard/patient/consultation' },
        { icon: ClipboardList, label: 'Status Antrian', path: '/dashboard/patient/queue' },
        { icon: FileText, label: 'Riwayat', path: '/dashboard/patient/history' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Icon Only */}
      <aside className="w-16 bg-card border-r border-border flex flex-col items-center">
        <div className="p-2 border-b border-border w-full flex justify-center">
          <Link to="/" title="Klinik Sehat">
            <Logo size="sm" showText={false} />
          </Link>
        </div>

        <nav className="flex-1 py-2 w-full space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className="flex items-center justify-center p-2 mx-2 rounded-lg hover:bg-accent transition-colors group"
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        <div className="py-2 border-t border-border w-full space-y-2">
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="sm"
            title="Notifikasi"
            className="w-10 h-10 p-0 mx-auto relative hover:bg-accent"
            onClick={() => navigate('/dashboard/notifications')}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            title="Pengaturan"
            className="w-10 h-10 p-0 mx-auto hover:bg-accent"
            onClick={() => navigate('/dashboard/settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            title={darkMode ? "Mode Terang" : "Mode Gelap"}
            className="w-10 h-10 p-0 mx-auto hover:bg-accent"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            title="Bantuan"
            className="w-10 h-10 p-0 mx-auto hover:bg-accent"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* User Avatar */}
          <div className="px-2 pt-2 border-t border-border">
            <div className="w-10 h-10 mx-auto bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-primary transition-all" title={user?.full_name}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            title="Logout"
            className="w-10 h-10 p-0 mx-auto hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
