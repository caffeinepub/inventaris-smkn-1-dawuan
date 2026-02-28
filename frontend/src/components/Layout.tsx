import React, { useState, useEffect } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard, Package, Users, ClipboardList, BarChart3,
  Settings, BookOpen, PlusCircle, History, User, LogOut,
  Menu, X, ChevronRight, School
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getSettings } from '../utils/storage';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Manajemen Barang', path: '/admin/items', icon: <Package size={18} /> },
  { label: 'Manajemen User', path: '/admin/users', icon: <Users size={18} /> },
  { label: 'Peminjaman', path: '/admin/borrowings', icon: <ClipboardList size={18} /> },
  { label: 'Laporan', path: '/admin/reports', icon: <BarChart3 size={18} /> },
  { label: 'Pengaturan', path: '/admin/settings', icon: <Settings size={18} /> },
];

const userNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/user/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Katalog Barang', path: '/user/catalog', icon: <BookOpen size={18} /> },
  { label: 'Ajukan Peminjaman', path: '/user/borrow', icon: <PlusCircle size={18} /> },
  { label: 'Riwayat Peminjaman', path: '/user/history', icon: <History size={18} /> },
  { label: 'Profil Saya', path: '/user/profile', icon: <User size={18} /> },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState<string | undefined>(() => getSettings().schoolLogo);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Re-read logo from settings whenever the route changes (picks up saves from Settings page)
  useEffect(() => {
    const settings = getSettings();
    setSchoolLogo(settings.schoolLogo);
  }, [currentPath]);

  const navItems = user?.role === 'Admin' ? adminNavItems : userNavItems;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isActive = (path: string) => {
    if (path === '/admin/items') {
      return currentPath.startsWith('/admin/items');
    }
    if (path === '/admin/users') {
      return currentPath.startsWith('/admin/users');
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col w-64 bg-sidebar text-sidebar-foreground
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-xl md:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="Logo Sekolah"
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <img
                src="/assets/generated/smkn1dawuan-logo.dim_128x128.png"
                alt="SMKN 1 Dawuan"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const icon = parent.querySelector('.fallback-icon') as HTMLElement;
                    if (icon) icon.style.display = 'flex';
                  }
                }}
              />
            )}
            <span className="fallback-icon hidden items-center justify-center w-full h-full">
              <School size={20} className="text-white" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">SMKN 1 Dawuan</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Sistem Inventaris</p>
          </div>
          <button
            className="ml-auto md:hidden text-sidebar-foreground/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            user?.role === 'Admin'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {user?.role === 'Admin' ? '⚙ Administrator' : '👤 Pengguna'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 group
                    ${isActive(item.path)
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-sidebar-foreground/50 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive(item.path) && (
                    <ChevronRight size={14} className="ml-auto text-white/60" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                {getInitials(user?.fullName || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">@{user?.username}</p>
            </div>
            <button
              onClick={logout}
              className="flex-shrink-0 text-sidebar-foreground/50 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex-shrink-0 h-14 bg-card border-b border-border flex items-center px-4 gap-4 shadow-xs">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 md:hidden">
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo Sekolah" className="w-6 h-6 object-contain" />
            ) : (
              <School size={18} className="text-primary" />
            )}
            <span className="font-bold text-sm text-foreground">SMKN 1 Dawuan</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">
              {navItems.find(n => isActive(n.path))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-accent rounded-lg px-2 py-1.5 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {getInitials(user?.fullName || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{user?.username}</p>
                </div>
                <DropdownMenuSeparator />
                {user?.role === 'User' && (
                  <DropdownMenuItem asChild>
                    <Link to="/user/profile" className="cursor-pointer">
                      <User size={14} className="mr-2" /> Profil Saya
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut size={14} className="mr-2" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
