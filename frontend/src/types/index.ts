export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  description: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  password: string;
  role: 'Admin' | 'User';
  classOrPosition: string;
  idNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type BorrowingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned';

export interface Borrowing {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  borrowDate: string;
  returnDate: string;
  purpose: string;
  status: BorrowingStatus;
  rejectionReason?: string;
  approvedAt?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  schoolName: string;
  address: string;
  principalName: string;
  appName: string;
  defaultBorrowDuration: number;
  schoolLogo?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'User';
}
