import { Item, User, Borrowing, Settings } from '../types';

const KEYS = {
  ITEMS: 'smkn1_items',
  USERS: 'smkn1_users',
  BORROWINGS: 'smkn1_borrowings',
  SETTINGS: 'smkn1_settings',
  AUTH_USER: 'smkn1_auth_user',
};

// Items
export function getItems(): Item[] {
  const data = localStorage.getItem(KEYS.ITEMS);
  return data ? JSON.parse(data) : [];
}

export function saveItems(items: Item[]): void {
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
}

export function addItem(item: Item): void {
  const items = getItems();
  items.push(item);
  saveItems(items);
}

export function updateItem(updated: Item): void {
  const items = getItems().map(i => i.id === updated.id ? updated : i);
  saveItems(items);
}

export function deleteItem(id: string): void {
  const items = getItems().filter(i => i.id !== id);
  saveItems(items);
}

export function getItemById(id: string): Item | undefined {
  return getItems().find(i => i.id === id);
}

// Users
export function getUsers(): User[] {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(updated: User): void {
  const users = getUsers().map(u => u.id === updated.id ? updated : u);
  saveUsers(users);
}

export function deleteUser(id: string): void {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find(u => u.username === username);
}

// Borrowings
export function getBorrowings(): Borrowing[] {
  const data = localStorage.getItem(KEYS.BORROWINGS);
  return data ? JSON.parse(data) : [];
}

export function saveBorrowings(borrowings: Borrowing[]): void {
  localStorage.setItem(KEYS.BORROWINGS, JSON.stringify(borrowings));
}

export function addBorrowing(borrowing: Borrowing): void {
  const borrowings = getBorrowings();
  borrowings.push(borrowing);
  saveBorrowings(borrowings);
}

export function updateBorrowing(updated: Borrowing): void {
  const borrowings = getBorrowings().map(b => b.id === updated.id ? updated : b);
  saveBorrowings(borrowings);
}

export function getBorrowingById(id: string): Borrowing | undefined {
  return getBorrowings().find(b => b.id === id);
}

// Settings
export function getSettings(): Settings {
  const data = localStorage.getItem(KEYS.SETTINGS);
  if (data) return JSON.parse(data);
  return {
    schoolName: 'SMKN 1 Dawuan',
    address: 'Jl. Raya Dawuan, Cikampek, Karawang, Jawa Barat',
    principalName: 'Drs. H. Ahmad Fauzi, M.Pd.',
    appName: 'Aplikasi Inventaris SMKN 1 Dawuan',
    defaultBorrowDuration: 7,
    schoolLogo: undefined,
  };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Auth
export function getAuthUser() {
  const data = localStorage.getItem(KEYS.AUTH_USER);
  return data ? JSON.parse(data) : null;
}

export function setAuthUser(user: object | null): void {
  if (user) {
    localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.AUTH_USER);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
