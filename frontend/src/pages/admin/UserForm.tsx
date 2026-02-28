import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers, getUserById, addUser, updateUser, generateId } from '../../utils/storage';
import { User } from '../../types';
import { toast } from 'sonner';

interface UserFormProps {
  mode: 'add' | 'edit';
}

export function UserForm({ mode }: UserFormProps) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const userId = params.id;

  const [form, setForm] = useState({
    fullName: '', username: '', password: '', confirmPassword: '',
    role: 'User' as User['role'], classOrPosition: '', idNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && userId) {
      const u = getUserById(userId);
      if (u) {
        setForm({
          fullName: u.fullName, username: u.username, password: '',
          confirmPassword: '', role: u.role, classOrPosition: u.classOrPosition,
          idNumber: u.idNumber,
        });
      }
    }
  }, [mode, userId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi';
    if (!form.username.trim()) errs.username = 'Username wajib diisi';
    if (!/^[a-zA-Z0-9._-]+$/.test(form.username)) errs.username = 'Username hanya boleh huruf, angka, titik, underscore, dan strip';

    if (mode === 'add') {
      if (!form.password) errs.password = 'Password wajib diisi';
      if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Konfirmasi password tidak cocok';
    } else if (form.password) {
      if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    if (!form.classOrPosition.trim()) errs.classOrPosition = 'Kelas/Jabatan wajib diisi';
    if (!form.idNumber.trim()) errs.idNumber = 'Nomor induk wajib diisi';

    // Check username uniqueness
    const existing = getUsers().find(u => u.username === form.username && u.id !== userId);
    if (existing) errs.username = 'Username sudah digunakan';

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const now = new Date().toISOString();
    if (mode === 'add') {
      const newUser: User = {
        id: generateId(), fullName: form.fullName.trim(), username: form.username.trim(),
        password: form.password, role: form.role, classOrPosition: form.classOrPosition.trim(),
        idNumber: form.idNumber.trim(), createdAt: now, updatedAt: now,
      };
      addUser(newUser);
      toast.success(`User "${form.fullName}" berhasil ditambahkan`);
    } else if (userId) {
      const existing = getUserById(userId);
      if (existing) {
        const updated: User = {
          ...existing, fullName: form.fullName.trim(), username: form.username.trim(),
          role: form.role, classOrPosition: form.classOrPosition.trim(),
          idNumber: form.idNumber.trim(), updatedAt: now,
          password: form.password ? form.password : existing.password,
        };
        updateUser(updated);
        toast.success(`User "${form.fullName}" berhasil diperbarui`);
      }
    }

    setLoading(false);
    navigate({ to: '/admin/users' });
  };

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin/users' })}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            {mode === 'add' ? 'Tambah User' : 'Edit User'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'add' ? 'Tambahkan pengguna baru ke sistem' : 'Perbarui informasi pengguna'}
          </p>
        </div>
      </div>

      <Card className="border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Informasi Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Budi Santoso" />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                <Input id="username" value={form.username} onChange={e => set('username', e.target.value)} placeholder="budi.santoso" />
                {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Password {mode === 'add' && <span className="text-destructive">*</span>}
                  {mode === 'edit' && <span className="text-muted-foreground text-xs"> (kosongkan jika tidak diubah)</span>}
                </Label>
                <Input id="password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 karakter" />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Ulangi password" />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Select value={form.role} onValueChange={v => set('role', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="classOrPosition">Kelas/Jabatan <span className="text-destructive">*</span></Label>
                <Input id="classOrPosition" value={form.classOrPosition} onChange={e => set('classOrPosition', e.target.value)} placeholder="XII RPL 1 / Guru TKJ" />
                {errors.classOrPosition && <p className="text-xs text-destructive">{errors.classOrPosition}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idNumber">Nomor Induk <span className="text-destructive">*</span></Label>
              <Input id="idNumber" value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="0051234567" />
              {errors.idNumber && <p className="text-xs text-destructive">{errors.idNumber}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/users' })} className="flex-1">Batal</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-navy-800 hover:bg-navy-900 text-white">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Save size={16} /> Simpan</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
