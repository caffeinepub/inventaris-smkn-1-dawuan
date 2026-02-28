import React, { useState, useMemo } from 'react';
import { Check, X, RotateCcw, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { getBorrowings, getUsers, getItems, updateBorrowing, updateItem, getItemById } from '../../utils/storage';
import { Borrowing, BorrowingStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export function BorrowingList() {
  const [statusFilter, setStatusFilter] = useState<BorrowingStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [borrowings, setBorrowings] = useState<Borrowing[]>(() => getBorrowings());
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; borrowingId: string }>({ open: false, borrowingId: '' });
  const [rejectReason, setRejectReason] = useState('');

  const users = useMemo(() => getUsers(), []);
  const items = useMemo(() => getItems(), []);

  const getUserName = (id: string) => users.find(u => u.id === id)?.fullName || 'Unknown';
  const getItemName = (id: string) => items.find(i => i.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    return borrowings
      .filter(b => statusFilter === 'all' || b.status === statusFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [borrowings, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refresh = () => setBorrowings(getBorrowings());

  const handleApprove = (b: Borrowing) => {
    const item = getItemById(b.itemId);
    if (!item) { toast.error('Barang tidak ditemukan'); return; }
    if (item.availableQuantity < b.quantity) {
      toast.error(`Stok tidak mencukupi. Tersedia: ${item.availableQuantity}`);
      return;
    }
    updateItem({ ...item, availableQuantity: item.availableQuantity - b.quantity, updatedAt: new Date().toISOString() });
    updateBorrowing({ ...b, status: 'Approved', approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    refresh();
    toast.success(`Peminjaman ${getUserName(b.userId)} disetujui`);
  };

  const handleReject = () => {
    const b = borrowings.find(x => x.id === rejectDialog.borrowingId);
    if (!b) return;
    updateBorrowing({ ...b, status: 'Rejected', rejectionReason: rejectReason, updatedAt: new Date().toISOString() });
    refresh();
    setRejectDialog({ open: false, borrowingId: '' });
    setRejectReason('');
    toast.success('Peminjaman ditolak');
  };

  const handleReturn = (b: Borrowing) => {
    const item = getItemById(b.itemId);
    if (item) {
      updateItem({ ...item, availableQuantity: item.availableQuantity + b.quantity, updatedAt: new Date().toISOString() });
    }
    updateBorrowing({ ...b, status: 'Returned', returnedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    refresh();
    toast.success('Barang berhasil dikembalikan');
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Manajemen Peminjaman</h1>
        <p className="text-sm text-muted-foreground mt-1">{borrowings.length} total peminjaman</p>
      </div>

      <Card className="border shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as BorrowingStatus | 'all'); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Pending">Menunggu</SelectItem>
                <SelectItem value="Approved">Disetujui</SelectItem>
                <SelectItem value="Rejected">Ditolak</SelectItem>
                <SelectItem value="Returned">Dikembalikan</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filtered.length} data</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Peminjam</TableHead>
                  <TableHead className="font-semibold">Barang</TableHead>
                  <TableHead className="font-semibold text-center">Jml</TableHead>
                  <TableHead className="font-semibold">Tgl Pinjam</TableHead>
                  <TableHead className="font-semibold">Tgl Kembali</TableHead>
                  <TableHead className="font-semibold">Keperluan</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Tidak ada data peminjaman</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(b => (
                    <TableRow key={b.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{getUserName(b.userId)}</TableCell>
                      <TableCell className="text-sm">{getItemName(b.itemId)}</TableCell>
                      <TableCell className="text-center">{b.quantity}</TableCell>
                      <TableCell className="text-sm">{new Date(b.borrowDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-sm">{new Date(b.returnDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate" title={b.purpose}>{b.purpose}</TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {b.status === 'Pending' && (
                            <>
                              <Button
                                size="sm" variant="outline"
                                className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleApprove(b)}
                              >
                                <Check size={12} className="mr-1" /> Setujui
                              </Button>
                              <Button
                                size="sm" variant="outline"
                                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => { setRejectDialog({ open: true, borrowingId: b.id }); setRejectReason(''); }}
                              >
                                <X size={12} className="mr-1" /> Tolak
                              </Button>
                            </>
                          )}
                          {b.status === 'Approved' && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleReturn(b)}
                            >
                              <RotateCcw size={12} className="mr-1" /> Kembalikan
                            </Button>
                          )}
                          {(b.status === 'Rejected' || b.status === 'Returned') && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PaginationItem key={p}>
                      <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open => setRejectDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Peminjaman</DialogTitle>
            <DialogDescription>Berikan alasan penolakan (opsional)</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Alasan Penolakan</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Contoh: Barang sedang dalam perbaikan..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, borrowingId: '' })}>Batal</Button>
            <Button variant="destructive" onClick={handleReject}>Tolak Peminjaman</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
