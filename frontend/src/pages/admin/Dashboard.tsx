import React, { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Package, Users, ClipboardList, CheckCircle, Clock, XCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getItems, getUsers, getBorrowings } from '../../utils/storage';
import { StatusBadge } from '../../components/StatusBadge';

export function AdminDashboard() {
  const stats = useMemo(() => {
    const items = getItems();
    const users = getUsers();
    const borrowings = getBorrowings();

    const totalItems = items.length;
    const totalAvailable = items.reduce((sum, i) => sum + i.availableQuantity, 0);
    const totalQuantity = items.reduce((sum, i) => sum + i.totalQuantity, 0);
    const totalBorrowed = totalQuantity - totalAvailable;
    const totalUsers = users.filter(u => u.role === 'User').length;

    const pendingCount = borrowings.filter(b => b.status === 'Pending').length;
    const approvedCount = borrowings.filter(b => b.status === 'Approved').length;
    const returnedCount = borrowings.filter(b => b.status === 'Returned').length;
    const rejectedCount = borrowings.filter(b => b.status === 'Rejected').length;

    const recentBorrowings = borrowings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return { totalItems, totalAvailable, totalBorrowed, totalUsers, pendingCount, approvedCount, returnedCount, rejectedCount, recentBorrowings, borrowings };
  }, []);

  const statCards = [
    {
      title: 'Total Jenis Barang',
      value: stats.totalItems,
      icon: <Package size={22} />,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
      trend: 'Jenis barang terdaftar',
    },
    {
      title: 'Barang Dipinjam',
      value: stats.totalBorrowed,
      icon: <ClipboardList size={22} />,
      color: 'bg-amber-50 text-amber-600',
      iconBg: 'bg-amber-100',
      trend: 'Unit sedang dipinjam',
    },
    {
      title: 'Barang Tersedia',
      value: stats.totalAvailable,
      icon: <CheckCircle size={22} />,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
      trend: 'Unit siap dipinjam',
    },
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: <Users size={22} />,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100',
      trend: 'Pengguna terdaftar',
    },
  ];

  const borrowingStats = [
    { label: 'Menunggu', value: stats.pendingCount, icon: <Clock size={16} />, color: 'text-amber-600 bg-amber-50' },
    { label: 'Disetujui', value: stats.approvedCount, icon: <CheckCircle size={16} />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Dikembalikan', value: stats.returnedCount, icon: <TrendingUp size={16} />, color: 'text-slate-600 bg-slate-50' },
    { label: 'Ditolak', value: stats.rejectedCount, icon: <XCircle size={16} />, color: 'text-red-600 bg-red-50' },
  ];

  const getUserName = (userId: string) => {
    const users = getUsers();
    return users.find(u => u.id === userId)?.fullName || 'Unknown';
  };

  const getItemName = (itemId: string) => {
    const items = getItems();
    return items.find(i => i.id === itemId)?.name || 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Selamat datang di Sistem Inventaris SMKN 1 Dawuan</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border shadow-card hover:shadow-card-hover transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <span className={card.color.split(' ')[1]}>{card.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrowing status summary */}
        <Card className="border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Status Peminjaman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {borrowingStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${stat.color}`}>{stat.icon}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className="font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Link to="/admin/borrowings" className="text-xs text-primary flex items-center gap-1 hover:underline">
                Lihat semua peminjaman <ArrowRight size={12} />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent borrowings */}
        <Card className="border shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Peminjaman Terbaru</CardTitle>
              <Link to="/admin/borrowings" className="text-xs text-primary hover:underline flex items-center gap-1">
                Lihat semua <ArrowRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentBorrowings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada data peminjaman</p>
            ) : (
              <div className="space-y-3">
                {stats.recentBorrowings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{getUserName(b.userId)}</p>
                      <p className="text-xs text-muted-foreground truncate">{getItemName(b.itemId)} × {b.quantity}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
