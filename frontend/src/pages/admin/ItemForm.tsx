import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getItemById, addItem, updateItem, generateId } from '../../utils/storage';
import { Item } from '../../types';
import { toast } from 'sonner';

interface ItemFormProps {
  mode: 'add' | 'edit';
}

const CATEGORIES = ['Elektronik', 'Furniture', 'Alat Praktik', 'Olahraga', 'Kebersihan', 'Lainnya'];
const CONDITIONS = ['Baik', 'Rusak Ringan', 'Rusak Berat'] as const;

export function ItemForm({ mode }: ItemFormProps) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const itemId = params.id;

  const [form, setForm] = useState({
    code: '', name: '', category: '', totalQuantity: '', availableQuantity: '',
    condition: 'Baik' as Item['condition'], location: '', description: '', photoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && itemId) {
      const item = getItemById(itemId);
      if (item) {
        setForm({
          code: item.code, name: item.name, category: item.category,
          totalQuantity: String(item.totalQuantity), availableQuantity: String(item.availableQuantity),
          condition: item.condition, location: item.location, description: item.description,
          photoUrl: item.photoUrl || '',
        });
      }
    }
  }, [mode, itemId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.code.trim()) errs.code = 'Kode barang wajib diisi';
    if (!form.name.trim()) errs.name = 'Nama barang wajib diisi';
    if (!form.category) errs.category = 'Kategori wajib dipilih';
    if (!form.totalQuantity || isNaN(Number(form.totalQuantity)) || Number(form.totalQuantity) < 0)
      errs.totalQuantity = 'Jumlah total harus berupa angka positif';
    if (!form.availableQuantity || isNaN(Number(form.availableQuantity)) || Number(form.availableQuantity) < 0)
      errs.availableQuantity = 'Jumlah tersedia harus berupa angka positif';
    if (Number(form.availableQuantity) > Number(form.totalQuantity))
      errs.availableQuantity = 'Jumlah tersedia tidak boleh melebihi jumlah total';
    if (!form.location.trim()) errs.location = 'Lokasi wajib diisi';
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
      const newItem: Item = {
        id: generateId(), code: form.code.trim(), name: form.name.trim(),
        category: form.category, totalQuantity: Number(form.totalQuantity),
        availableQuantity: Number(form.availableQuantity), condition: form.condition,
        location: form.location.trim(), description: form.description.trim(),
        photoUrl: form.photoUrl.trim(), createdAt: now, updatedAt: now,
      };
      addItem(newItem);
      toast.success(`Barang "${form.name}" berhasil ditambahkan`);
    } else if (itemId) {
      const existing = getItemById(itemId);
      if (existing) {
        const updated: Item = {
          ...existing, code: form.code.trim(), name: form.name.trim(),
          category: form.category, totalQuantity: Number(form.totalQuantity),
          availableQuantity: Number(form.availableQuantity), condition: form.condition,
          location: form.location.trim(), description: form.description.trim(),
          photoUrl: form.photoUrl.trim(), updatedAt: now,
        };
        updateItem(updated);
        toast.success(`Barang "${form.name}" berhasil diperbarui`);
      }
    }

    setLoading(false);
    navigate({ to: '/admin/items' });
  };

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin/items' })}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            {mode === 'add' ? 'Tambah Barang' : 'Edit Barang'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'add' ? 'Tambahkan barang baru ke inventaris' : 'Perbarui informasi barang'}
          </p>
        </div>
      </div>

      <Card className="border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Informasi Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Kode Barang <span className="text-destructive">*</span></Label>
                <Input id="code" value={form.code} onChange={e => set('code', e.target.value)} placeholder="ELK-001" />
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Barang <span className="text-destructive">*</span></Label>
                <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Laptop Acer Aspire 5" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Kategori <span className="text-destructive">*</span></Label>
                <Select value={form.category} onValueChange={v => set('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Kondisi <span className="text-destructive">*</span></Label>
                <Select value={form.condition} onValueChange={v => set('condition', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="totalQuantity">Jumlah Total <span className="text-destructive">*</span></Label>
                <Input id="totalQuantity" type="number" min="0" value={form.totalQuantity} onChange={e => set('totalQuantity', e.target.value)} placeholder="0" />
                {errors.totalQuantity && <p className="text-xs text-destructive">{errors.totalQuantity}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="availableQuantity">Jumlah Tersedia <span className="text-destructive">*</span></Label>
                <Input id="availableQuantity" type="number" min="0" value={form.availableQuantity} onChange={e => set('availableQuantity', e.target.value)} placeholder="0" />
                {errors.availableQuantity && <p className="text-xs text-destructive">{errors.availableQuantity}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Lokasi/Ruangan <span className="text-destructive">*</span></Label>
              <Input id="location" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Lab Komputer 1" />
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photoUrl">URL Foto/Ikon (opsional)</Label>
              <Input id="photoUrl" value={form.photoUrl} onChange={e => set('photoUrl', e.target.value)} placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Deskripsi barang..." rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/items' })} className="flex-1">
                Batal
              </Button>
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
