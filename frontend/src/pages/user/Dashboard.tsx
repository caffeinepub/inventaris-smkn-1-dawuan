import React, { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Package, Clock, CheckCircle, History, ArrowRight, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBorrowings, getItems } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';

export function UserDashboard() {
  const { user } = useAuth();

  const { activeBorrowings, recentHistory, stats } = useMemo(() => {
    const borrowings = getBorrowings().filter(b => b.userId === user?.id);
    const items = getItems();

    const getItemName = (id: string) => items.find(i => i.id === id)?.name || 'Unknown';

    const activeBorrowings = borrowings
      .filter(b => b.status === 'Approved')
      .map(b => ({ ...b, itemName: getItemName(b.itemId) }));

    const recentHistory = borrowings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(b => ({ ...b, itemName: getItemName(b.itemId) }));

    const stats = {
      active: activeBorrowings.length,
      pending: borrowings.filter(b => b.status === 'Pending').length,
      total: borrowings.length,
    };

    return { activeBorrowings, recentHistory, stats };
  }, [user?.id]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          Selamat Datang, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola peminjaman barang Anda di sini</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sedang Dipinjam</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100">
                <History size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Peminjaman</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active borrowings */}
        <Card className="border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package size={16} /> Barang Dipinjam
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/user/borrow"><PlusCircle size={14} className="mr-1" /> Pinjam Baru</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeBorrowings.length === 0 ? (
              <div className="text-center py-6">
                <Package size={32} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">Tidak ada barang yang sedang dipinjam</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to="/user/catalog">Lihat Katalog</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBorrowings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.quantity} unit · Kembali: {new Date(b.returnDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <StatusBadge status="Approved" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent history */}
        <Card className="border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History size={16} /> Riwayat Terbaru
              </CardTitle>
              <Link to="/user/history" className="text-xs text-primary hover:underline flex items-center gap-1">
                Lihat semua <ArrowRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat peminjaman</p>
            ) : (
              <div className="space-y-3">
                {recentHistory.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.quantity} unit · {new Date(b.borrowDate).toLocaleDateString('id-ID')}
                      </p>
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
