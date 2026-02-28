import { Borrowing } from '../types';
import { getItemById, getUserById } from './storage';

export function exportBorrowingsToCSV(borrowings: Borrowing[], filename: string = 'laporan-peminjaman.csv'): void {
  const headers = ['No', 'Nama Peminjam', 'Nama Barang', 'Jumlah', 'Tanggal Pinjam', 'Tanggal Kembali', 'Keperluan', 'Status'];

  const rows = borrowings.map((b, index) => {
    const user = getUserById(b.userId);
    const item = getItemById(b.itemId);
    return [
      index + 1,
      user?.fullName || 'Unknown',
      item?.name || 'Unknown',
      b.quantity,
      b.borrowDate,
      b.returnDate,
      `"${b.purpose.replace(/"/g, '""')}"`,
      b.status,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
