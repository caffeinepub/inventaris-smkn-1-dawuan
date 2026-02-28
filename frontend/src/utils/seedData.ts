import { Item, User, Borrowing, Settings } from '../types';
import { getItems, getUsers, getBorrowings, saveItems, saveUsers, saveBorrowings, saveSettings, getSettings } from './storage';

const now = new Date().toISOString();

const sampleItems: Item[] = [
  {
    id: 'item-001', code: 'ELK-001', name: 'Laptop Acer Aspire 5',
    category: 'Elektronik', totalQuantity: 20, availableQuantity: 15,
    condition: 'Baik', location: 'Lab Komputer 1',
    description: 'Laptop untuk kegiatan praktikum siswa. Spesifikasi: Intel Core i5, RAM 8GB, SSD 256GB.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-002', code: 'ELK-002', name: 'Proyektor Epson EB-X41',
    category: 'Elektronik', totalQuantity: 8, availableQuantity: 5,
    condition: 'Baik', location: 'Gudang AV',
    description: 'Proyektor untuk presentasi dan pembelajaran di kelas. Resolusi XGA 1024x768.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-003', code: 'ELK-003', name: 'Kamera Canon EOS 1300D',
    category: 'Elektronik', totalQuantity: 5, availableQuantity: 3,
    condition: 'Baik', location: 'Lab Multimedia',
    description: 'Kamera DSLR untuk praktikum fotografi dan videografi.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-004', code: 'ELK-004', name: 'Printer HP LaserJet Pro',
    category: 'Elektronik', totalQuantity: 6, availableQuantity: 4,
    condition: 'Baik', location: 'Ruang TU',
    description: 'Printer laser untuk mencetak dokumen administrasi dan laporan.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-005', code: 'ELK-005', name: 'Scanner Epson Perfection V39',
    category: 'Elektronik', totalQuantity: 4, availableQuantity: 4,
    condition: 'Baik', location: 'Ruang TU',
    description: 'Scanner dokumen untuk digitalisasi arsip sekolah.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-006', code: 'ELK-006', name: 'Microphone Shure SM58',
    category: 'Elektronik', totalQuantity: 10, availableQuantity: 8,
    condition: 'Baik', location: 'Ruang Aula',
    description: 'Mikrofon dinamis untuk acara sekolah dan presentasi.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-007', code: 'ELK-007', name: 'Tripod Kamera Velbon',
    category: 'Elektronik', totalQuantity: 6, availableQuantity: 5,
    condition: 'Baik', location: 'Lab Multimedia',
    description: 'Tripod aluminium untuk stabilisasi kamera saat pengambilan gambar.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-008', code: 'FRN-001', name: 'Meja Belajar Siswa',
    category: 'Furniture', totalQuantity: 200, availableQuantity: 180,
    condition: 'Baik', location: 'Gudang Furniture',
    description: 'Meja belajar standar untuk ruang kelas.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-009', code: 'FRN-002', name: 'Kursi Siswa',
    category: 'Furniture', totalQuantity: 250, availableQuantity: 220,
    condition: 'Baik', location: 'Gudang Furniture',
    description: 'Kursi plastik standar untuk ruang kelas.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-010', code: 'ALP-001', name: 'Solder Listrik Hakko',
    category: 'Alat Praktik', totalQuantity: 30, availableQuantity: 25,
    condition: 'Baik', location: 'Lab Elektronika',
    description: 'Solder listrik untuk praktikum elektronika dasar.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-011', code: 'ALP-002', name: 'Osiloskop Digital Rigol DS1054Z',
    category: 'Alat Praktik', totalQuantity: 8, availableQuantity: 6,
    condition: 'Baik', location: 'Lab Elektronika',
    description: 'Osiloskop digital 4 channel untuk analisis sinyal elektronik.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
  {
    id: 'item-012', code: 'ALP-003', name: 'Multimeter Digital Sanwa',
    category: 'Alat Praktik', totalQuantity: 20, availableQuantity: 0,
    condition: 'Rusak Ringan', location: 'Lab Elektronika',
    description: 'Multimeter digital untuk pengukuran tegangan, arus, dan resistansi.',
    photoUrl: '', createdAt: now, updatedAt: now,
  },
];

const sampleUsers: User[] = [
  {
    id: 'user-admin', fullName: 'Administrator', username: 'admin',
    password: 'admin123', role: 'Admin', classOrPosition: 'Administrator',
    idNumber: 'ADM-001', createdAt: now, updatedAt: now,
  },
  {
    id: 'user-001', fullName: 'Budi Santoso', username: 'user1',
    password: 'user123', role: 'User', classOrPosition: 'XII RPL 1',
    idNumber: '0051234567', createdAt: now, updatedAt: now,
  },
  {
    id: 'user-002', fullName: 'Siti Rahayu', username: 'siti.rahayu',
    password: 'siti123', role: 'User', classOrPosition: 'XII TKJ 2',
    idNumber: '0051234568', createdAt: now, updatedAt: now,
  },
  {
    id: 'user-003', fullName: 'Ahmad Firdaus', username: 'ahmad.firdaus',
    password: 'ahmad123', role: 'User', classOrPosition: 'XI RPL 1',
    idNumber: '0061234569', createdAt: now, updatedAt: now,
  },
  {
    id: 'user-004', fullName: 'Dewi Lestari', username: 'dewi.lestari',
    password: 'dewi123', role: 'User', classOrPosition: 'XI MM 1',
    idNumber: '0061234570', createdAt: now, updatedAt: now,
  },
  {
    id: 'user-005', fullName: 'Pak Hendra Wijaya', username: 'hendra.guru',
    password: 'hendra123', role: 'User', classOrPosition: 'Guru TKJ',
    idNumber: 'GTK-001', createdAt: now, updatedAt: now,
  },
  {
    id: 'user-006', fullName: 'Bu Rina Marlina', username: 'rina.guru',
    password: 'rina123', role: 'User', classOrPosition: 'Guru Multimedia',
    idNumber: 'GTK-002', createdAt: now, updatedAt: now,
  },
];

const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

const sampleBorrowings: Borrowing[] = [
  {
    id: 'borrow-001', userId: 'user-001', itemId: 'item-001',
    quantity: 2, borrowDate: today, returnDate: nextWeek,
    purpose: 'Praktikum Pemrograman Web kelas XII RPL 1',
    status: 'Pending', createdAt: now, updatedAt: now,
  },
  {
    id: 'borrow-002', userId: 'user-005', itemId: 'item-002',
    quantity: 1, borrowDate: yesterday, returnDate: nextWeek,
    purpose: 'Presentasi materi jaringan komputer',
    status: 'Approved', approvedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'borrow-003', userId: 'user-006', itemId: 'item-003',
    quantity: 2, borrowDate: yesterday, returnDate: nextWeek,
    purpose: 'Praktikum fotografi produk kelas XII MM',
    status: 'Approved', approvedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'borrow-004', userId: 'user-002', itemId: 'item-006',
    quantity: 3, borrowDate: twoWeeksAgo, returnDate: lastWeek,
    purpose: 'Acara pentas seni sekolah',
    status: 'Returned', approvedAt: now, returnedAt: now, createdAt: now, updatedAt: now,
  },
  {
    id: 'borrow-005', userId: 'user-003', itemId: 'item-012',
    quantity: 5, borrowDate: yesterday, returnDate: nextWeek,
    purpose: 'Praktikum pengukuran elektronika',
    status: 'Rejected', rejectionReason: 'Barang sedang dalam perbaikan',
    createdAt: now, updatedAt: now,
  },
];

export function seedData(): void {
  const items = getItems();
  const users = getUsers();
  const borrowings = getBorrowings();

  if (items.length === 0) {
    saveItems(sampleItems);
  }

  if (users.length === 0) {
    saveUsers(sampleUsers);
  }

  if (borrowings.length === 0) {
    saveBorrowings(sampleBorrowings);
  }

  // Always ensure settings exist
  const settings = getSettings();
  if (!localStorage.getItem('smkn1_settings')) {
    saveSettings({ ...settings, schoolLogo: undefined });
  }
}
