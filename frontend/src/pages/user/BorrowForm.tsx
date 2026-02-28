import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getItems, addBorrowing, generateId, getSettings } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Borrowing, Item } from '../../types';
import { toast } from 'sonner';

export function BorrowForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const search = useSearch({ strict: false }) as { itemId?: string };

  const availableItems = useMemo(() => getItems().filter(i => i.availableQuantity > 0), []);
  const settings = useMemo(() => getSettings(), []);

  const today = new Date().toISOString().split('T')[0];
  const defaultReturn = new Date(Date.now() + settings.defaultBorrowDuration * 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    itemId: search.itemId || '',
    quantity: '1',
    borrowDate: today,
    returnDate: defaultReturn,
    purpose: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedItem = useMemo<Item | undefined>(
    () => availableItems.find(i => i.id === form.itemId),
    [availableItems, form.itemId]
  );

  useEffect(() => {
    if (search.itemId) {
      setForm(prev => ({ ...prev, itemId: search.itemId! }));
    }
  }, [search.itemId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.itemId) errs.itemId = 'Pilih barang yang ingin dipinjam';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 1)
      errs.quantity = 'Jumlah minimal 1';
    if (selectedItem && Number(form.quantity) > selectedItem.availableQuantity)
      errs.quantity = `Jumlah melebihi stok tersedia (${selectedItem.availableQuantity})`;
    if (!form.borrowDate) errs.borrowDate = 'Tanggal pinjam wajib diisi';
    if (!form.returnDate) errs.returnDate = 'Tanggal kembali wajib diisi';
    if (form.returnDate && form.borrowDate && form.returnDate <= form.borrowDate)
      errs.returnDate = 'Tanggal kembali harus setelah tanggal pinjam';
    if (!form.purpose.trim()) errs.purpose = 'Keperluan/tujuan wajib diisi';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const now = new Date().toISOString();
    const borrowing: Borrowing = {
      id: generateId(),
      userId: user!.id,
      itemId: form.itemId,
      quantity: Number(form.quantity),
      borrowDate: form.borrowDate,
      returnDate: form.returnDate,
      purpose: form.purpose.trim(),
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    addBorrowing(borrowing);
    setLoading(false);
    toast.success('Permintaan peminjaman berhasil diajukan! Menunggu persetujuan admin.');

    // Reset form
    setForm({ itemId: '', quantity: '1', borrowDate: today, returnDate: defaultReturn, purpose: '' });
    setErrors({});
  };

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/user/catalog' })}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Ajukan Peminjaman</h1>
          <p className="text-sm text-muted-foreground">Isi formulir peminjaman barang</p>
        </div>
      </div>

      <Card className="border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Formulir Peminjaman</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Item selector */}
            <div className="space-y-1.5">
              <Label>Pilih Barang <span className="text-destructive">*</span></Label>
              <Select value={form.itemId} onValueChange={v => { set('itemId', v); set('quantity', '1'); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih barang yang tersedia..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.length === 0 ? (
                    <SelectItem value="none" disabled>Tidak ada barang tersedia</SelectItem>
                  ) : (
                    availableItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} — Tersedia: {item.availableQuantity}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.itemId && <p className="text-xs text-destructive">{errors.itemId}</p>}
            </div>

            {/* Selected item info */}
            {selectedItem && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-800">{selectedItem.name}</p>
                <p className="text-blue-600 text-xs mt-0.5">
                  Kode: {selectedItem.code} · Lokasi: {selectedItem.location} · Tersedia: {selectedItem.availableQuantity} unit
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="quantity">
                Jumlah <span className="text-destructive">*</span>
                {selectedItem && <span className="text-muted-foreground text-xs ml-1">(maks. {selectedItem.availableQuantity})</span>}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedItem?.availableQuantity || 999}
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                disabled={!selectedItem}
              />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="borrowDate">Tanggal Pinjam <span className="text-destructive">*</span></Label>
                <Input
                  id="borrowDate"
                  type="date"
                  value={form.borrowDate}
                  min={today}
                  onChange={e => set('borrowDate', e.target.value)}
                />
                {errors.borrowDate && <p className="text-xs text-destructive">{errors.borrowDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="returnDate">Tanggal Kembali <span className="text-destructive">*</span></Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={form.returnDate}
                  min={form.borrowDate || today}
                  onChange={e => set('returnDate', e.target.value)}
                />
                {errors.returnDate && <p className="text-xs text-destructive">{errors.returnDate}</p>}
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Keperluan/Tujuan <span className="text-destructive">*</span></Label>
              <Textarea
                id="purpose"
                value={form.purpose}
                onChange={e => set('purpose', e.target.value)}
                placeholder="Jelaskan keperluan peminjaman barang ini..."
                rows={3}
              />
              {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/user/catalog' })} className="flex-1">
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-navy-800 hover:bg-navy-900 text-white">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengajukan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Send size={16} /> Ajukan Peminjaman</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
