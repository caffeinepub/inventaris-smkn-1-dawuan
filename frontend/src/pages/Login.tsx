import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { School, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getSettings } from '../utils/storage';

export function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState<string | undefined>(() => getSettings().schoolLogo);

  useEffect(() => {
    const settings = getSettings();
    setSchoolLogo(settings.schoolLogo);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin') {
        navigate({ to: '/admin/dashboard' });
      } else {
        navigate({ to: '/user/dashboard' });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const success = login(username.trim(), password);
    setLoading(false);

    if (success) {
      toast.success('Login berhasil! Selamat datang.');
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20 overflow-hidden">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="Logo Sekolah"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <>
                <img
                  src="/assets/generated/smkn1dawuan-logo.dim_128x128.png"
                  alt="SMKN 1 Dawuan"
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const sibling = target.nextElementSibling as HTMLElement | null;
                    if (sibling) sibling.classList.remove('hidden');
                  }}
                />
                <School size={36} className="text-white hidden" />
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white font-display">SMKN 1 Dawuan</h1>
          <p className="text-white/60 text-sm mt-1">Sistem Informasi Inventaris Sekolah</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4 pt-6 px-6">
            <h2 className="text-xl font-bold text-foreground font-display">Masuk ke Sistem</h2>
            <p className="text-sm text-muted-foreground">Masukkan kredensial Anda untuk melanjutkan</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="pl-9"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full bg-navy-800 hover:bg-navy-900 text-white" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : 'Masuk'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3 font-medium">Akun Demo</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                  className="text-xs bg-navy-800/10 hover:bg-navy-800/20 text-navy-800 rounded-lg px-3 py-2 transition-colors text-left"
                >
                  <span className="font-semibold block">Admin</span>
                  <span className="text-muted-foreground">admin / admin123</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('user1'); setPassword('user123'); }}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg px-3 py-2 transition-colors text-left"
                >
                  <span className="font-semibold block">User</span>
                  <span className="text-muted-foreground">user1 / user123</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} SMKN 1 Dawuan. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
