import React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { getItemById, deleteItem } from '../../utils/storage';
import { StatusBadge } from '../../components/StatusBadge';
import { toast } from 'sonner';

export function ItemDetail() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const item = params.id ? getItemById(params.id) : undefined;

  if (!item) {
    return (
      <div className="p-6 text-center">
        <Package size={48} className="mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Barang tidak ditemukan</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate({ to: '/admin/items' })}
        >
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteItem(item.id);
    toast.success(`Barang "${item.name}" berhasil dihapus`);
    navigate({ to: '/admin/items' });
  };

  const conditionColor = (condition: string) => {
    if (condition === 'Baik') return 'text-emerald-600 bg-emerald-50';
    if (condition === 'Rusak Ringan') return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin/items' })}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-display">Detail Barang</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/admin/items/$id/edit', params: { id: item.id } })}
          >
            <Pencil size={14} className="mr-1.5" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 size={14} className="mr-1.5" /> Hapus</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Barang</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus barang <strong>"{item.name}"</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="border shadow-card">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-12 h-12 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <Package size={28} className="text-blue-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">{item.code}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{item.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColor(item.condition)}`}>{item.condition}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Jumlah Total</p>
              <p className="text-2xl font-bold text-foreground">{item.totalQuantity}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Tersedia</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{item.availableQuantity}</p>
                <StatusBadge status={item.availableQuantity > 0 ? 'Available' : 'Unavailable'} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Lokasi</span>
              <span className="text-sm font-medium">{item.location}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Ditambahkan</span>
              <span className="text-sm font-medium">{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Diperbarui</span>
              <span className="text-sm font-medium">{new Date(item.updatedAt).toLocaleDateString('id-ID')}</span>
            </div>
          </div>

          {item.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Deskripsi</p>
              <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{item.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
