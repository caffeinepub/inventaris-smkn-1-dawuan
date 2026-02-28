import React, { useState, useMemo } from 'react';
import { Download, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBorrowings, getUsers, getItems } from '../../utils/storage';
import { StatusBadge } from '../../components/StatusBadge';
import { exportBorrowingsToCSV } from '../../utils/csv';
import { Borrowing } from '../../types';

export function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);

  const allBorrowings = useMemo(() => getBorrowings(), []);
  const users = useMemo(() => getUsers(), []);
  const items = useMemo(() => getItems(), []);

  const getUserName = (id: string) => users.find(u => u.id === id)?.fullName || 'Unknown';
  const getItemName = (id: string) => items.find(i => i.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    return allBorrowings.filter(b => {
      const bDate = b.borrowDate;
      return bDate >= startDate && bDate <= endDate;
    }).sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  }, [allBorrowings, startDate, endDate]);

  const summary = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter(b => b.status === 'Pending').length,
    approved: filtered.filter(b => b.status === 'Approved').length,
    returned: filtered.filter(b => b.status === 'Returned').length,
    rejected: filtered.filter(b => b.status === 'Rejected').length,
  }), [filtered]);

  const handleExport = () => {
    if (filtered.length === 0) return;
    const filename = `laporan-peminjaman-${startDate}-sd-${endDate}.csv`;
    exportBorrowingsToCSV(filtered, filename);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Laporan Peminjaman</h1>
          <p className="text-sm text-muted-foreground mt-1">Rekap data peminjaman berdasarkan periode</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="bg-navy-800 hover:bg-navy-900 text-white"
        >
          <Download size={16} className="mr-2" /> Export CSV
        </Button>
      </div>

      {/* Date filter */}
      <Card className="border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar size={16} /> Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: summary.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Menunggu', value: summary.pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Disetujui', value: summary.approved, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Dikembalikan', value: summary.returned, color: 'bg-slate-50 text-slate-700' },
          { label: 'Ditolak', value: summary.rejected, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <Card key={s.label} className={`border ${s.color}`}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results table */}
      <Card className="border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 size={16} /> Hasil ({filtered.length} data)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">No</TableHead>
                  <TableHead className="font-semibold">Peminjam</TableHead>
                  <TableHead className="font-semibold">Barang</TableHead>
                  <TableHead className="font-semibold text-center">Jml</TableHead>
                  <TableHead className="font-semibold">Tgl Pinjam</TableHead>
                  <TableHead className="font-semibold">Tgl Kembali</TableHead>
                  <TableHead className="font-semibold">Keperluan</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Tidak ada data pada periode ini</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b, idx) => (
                    <TableRow key={b.id} className="hover:bg-muted/30">
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{getUserName(b.userId)}</TableCell>
                      <TableCell className="text-sm">{getItemName(b.itemId)}</TableCell>
                      <TableCell className="text-center">{b.quantity}</TableCell>
                      <TableCell className="text-sm">{new Date(b.borrowDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-sm">{new Date(b.returnDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate" title={b.purpose}>{b.purpose}</TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
