import React, { useState, useRef } from 'react';
import { Save, School, Settings as SettingsIcon, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getSettings, saveSettings } from '../../utils/storage';
import { Settings as SettingsType } from '../../types';
import { toast } from 'sonner';

export function Settings() {
  const [form, setForm] = useState<SettingsType>(() => getSettings());
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof SettingsType, value: string | number | undefined) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (PNG, JPG, SVG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      set('schoolLogo', result);
      toast.success('Logo berhasil diunggah, klik Simpan untuk menyimpan perubahan');
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    set('schoolLogo', undefined);
    toast.info('Logo dihapus, klik Simpan untuk menyimpan perubahan');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    saveSettings(form);
    setLoading(false);
    toast.success('Pengaturan berhasil disimpan');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola profil sekolah dan pengaturan sistem</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* School Logo */}
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImagePlus size={16} /> Logo Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-5">
              {/* Preview */}
              <div className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                {form.schoolLogo ? (
                  <img
                    src={form.schoolLogo}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <School size={28} />
                    <span className="text-xs text-center leading-tight">Belum ada logo</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Upload Logo</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Format yang didukung: PNG, JPG, SVG. Ukuran maksimal 2MB.
                    Logo akan ditampilkan di sidebar aplikasi.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <ImagePlus size={14} />
                    {form.schoolLogo ? 'Ganti Logo' : 'Pilih Logo'}
                  </Button>
                  {form.schoolLogo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="flex items-center gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                      Hapus Logo
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Profile */}
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <School size={16} /> Profil Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="schoolName">Nama Sekolah</Label>
              <Input
                id="schoolName"
                value={form.schoolName}
                onChange={e => set('schoolName', e.target.value)}
                placeholder="SMKN 1 Dawuan"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Jl. Raya Dawuan..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="principalName">Nama Kepala Sekolah</Label>
              <Input
                id="principalName"
                value={form.principalName}
                onChange={e => set('principalName', e.target.value)}
                placeholder="Drs. H. Ahmad Fauzi, M.Pd."
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <SettingsIcon size={16} /> Pengaturan Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="appName">Nama Aplikasi</Label>
              <Input
                id="appName"
                value={form.appName}
                onChange={e => set('appName', e.target.value)}
                placeholder="Aplikasi Inventaris SMKN 1 Dawuan"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="defaultBorrowDuration">Durasi Peminjaman Default (hari)</Label>
              <Input
                id="defaultBorrowDuration"
                type="number"
                min="1"
                max="365"
                value={form.defaultBorrowDuration}
                onChange={e => set('defaultBorrowDuration', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Durasi default yang digunakan saat mengajukan peminjaman</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Info */}
        <Card className="border bg-muted/30">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Sekolah</span>
                <span className="font-medium">{form.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kepala Sekolah</span>
                <span className="font-medium">{form.principalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durasi Pinjam Default</span>
                <span className="font-medium">{form.defaultBorrowDuration} hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logo Sekolah</span>
                <span className="font-medium">{form.schoolLogo ? '✓ Terpasang' : 'Belum dipasang'}</span>
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
            <span className="flex items-center gap-2"><Save size={16} /> Simpan Pengaturan</span>
          )}
        </Button>
      </form>
    </div>
  );
}
