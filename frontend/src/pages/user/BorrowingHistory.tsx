import React, { useState, useMemo } from 'react';
import { History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { getBorrowings, getItems } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Borrowing, BorrowingStatus } from '../../types';

const PAGE_SIZE = 10;

export function BorrowingHistory() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<BorrowingStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const allBorrowings = useMemo(() => {
    return getBorrowings()
      .filter(b => b.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [user?.id]);

  const items = useMemo(() => getItems(), []);
  const getItemName = (id: string) => items.find(i => i.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    return allBorrowings.filter(b => statusFilter === 'all' || b.status === statusFilter);
  }, [allBorrowings, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Riwayat Peminjaman</h1>
        <p className="text-sm text-muted-foreground mt-1">{allBorrowings.length} total peminjaman Anda</p>
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
                  <TableHead className="font-semibold">Barang</TableHead>
                  <TableHead className="font-semibold text-center">Jml</TableHead>
                  <TableHead className="font-semibold">Tgl Pinjam</TableHead>
                  <TableHead className="font-semibold">Tgl Kembali</TableHead>
                  <TableHead className="font-semibold">Keperluan</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      <History size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Belum ada riwayat peminjaman</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(b => (
                    <TableRow key={b.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{getItemName(b.itemId)}</TableCell>
                      <TableCell className="text-center">{b.quantity}</TableCell>
                      <TableCell className="text-sm">{new Date(b.borrowDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-sm">{new Date(b.returnDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate" title={b.purpose}>{b.purpose}</TableCell>
                      <TableCell>
                        <div>
                          <StatusBadge status={b.status} />
                          {b.status === 'Rejected' && b.rejectionReason && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-[160px] truncate" title={b.rejectionReason}>
                              Alasan: {b.rejectionReason}
                            </p>
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
    </div>
  );
}
