import React, { useState } from 'react';
import { Save, User as UserIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getUserById, updateUser } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export function Profile() {
  const { user, updateCurrentUser } = useAuth();

  const [form, setForm] = useState(() => {
    const u = user ? getUserById(user.id) : null;
    return {
      fullName: u?.fullName || '',
      classOrPosition: u?.classOrPosition || '',
      idNumber: u?.idNumber || '',
      password: '',
      confirmPassword: '',
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi';
    if (!form.classOrPosition.trim()) errs.classOrPosition = 'Kelas/Jabatan wajib diisi';
    if (!form.idNumber.trim()) errs.idNumber = 'Nomor induk wajib diisi';
    if (form.password) {
      if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!user) return;
    const existing = getUserById(user.id);
    if (!existing) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const updated = {
      ...existing,
      fullName: form.fullName.trim(),
      classOrPosition: form.classOrPosition.trim(),
      idNumber: form.idNumber.trim(),
      password: form.password ? form.password : existing.password,
      updatedAt: new Date().toISOString(),
    };

    updateUser(updated);
    updateCurrentUser({ ...user, fullName: updated.fullName });
    setLoading(false);
    setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    toast.success('Profil berhasil diperbarui');
  };

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Profil Saya</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola informasi akun Anda</p>
      </div>

      {/* Profile header */}
      <Card className="border shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {getInitials(form.fullName || user?.fullName || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-foreground">{form.fullName || user?.fullName}</h2>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{user?.role}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Read-only info */}
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon size={16} /> Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input value={user?.username || ''} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Username tidak dapat diubah</p>
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input value={user?.role || ''} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Role tidak dapat diubah</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="classOrPosition">Kelas/Jabatan <span className="text-destructive">*</span></Label>
                <Input id="classOrPosition" value={form.classOrPosition} onChange={e => set('classOrPosition', e.target.value)} />
                {errors.classOrPosition && <p className="text-xs text-destructive">{errors.classOrPosition}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="idNumber">Nomor Induk <span className="text-destructive">*</span></Label>
                <Input id="idNumber" value={form.idNumber} onChange={e => set('idNumber', e.target.value)} />
                {errors.idNumber && <p className="text-xs text-destructive">{errors.idNumber}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password change */}
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={16} /> Ubah Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Kosongkan jika tidak ingin mengubah password</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password Baru</Label>
                <Input id="password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 karakter" />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Ulangi password baru" />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full bg-navy-800 hover:bg-navy-900 text-white">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2"><Save size={16} /> Simpan Perubahan</span>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>
          © {new Date().getFullYear()} SMKN 1 Dawuan · Built with{' '}
          <span className="text-red-500">♥</span>{' '}using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'smkn1dawuan-inventory')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
