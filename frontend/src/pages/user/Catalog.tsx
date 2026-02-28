import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, Package, MapPin, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getItems } from '../../utils/storage';
import { StatusBadge } from '../../components/StatusBadge';
import { Item } from '../../types';

export function Catalog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [items] = useState<Item[]>(() => getItems());

  const categories = useMemo(() => [...new Set(items.map(i => i.category))], [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [items, search, categoryFilter]);

  const conditionColor = (condition: string) => {
    if (condition === 'Baik') return 'text-emerald-600';
    if (condition === 'Rusak Ringan') return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Katalog Barang</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} barang tersedia untuk dipinjam</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kode barang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Item grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">Tidak ada barang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="border shadow-card hover:shadow-card-hover transition-all duration-200 group">
              <CardContent className="p-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <Package size={22} className="text-blue-500" />
                </div>

                {/* Name & code */}
                <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">{item.name}</h3>
                <p className="text-xs font-mono text-muted-foreground mb-3">{item.code}</p>

                {/* Details */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Tag size={11} />
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={11} />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${conditionColor(item.condition)}`}>{item.condition}</span>
                    <StatusBadge status={item.availableQuantity > 0 ? 'Available' : 'Unavailable'} />
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-3 py-2 border-t border-b">
                  <span className="text-xs text-muted-foreground">Tersedia</span>
                  <span className="text-sm font-bold text-foreground">
                    {item.availableQuantity} / {item.totalQuantity}
                  </span>
                </div>

                {/* Borrow button */}
                <Button
                  size="sm"
                  className="w-full bg-navy-800 hover:bg-navy-900 text-white text-xs"
                  disabled={item.availableQuantity === 0}
                  onClick={() => navigate({ to: '/user/borrow', search: { itemId: item.id } })}
                >
                  {item.availableQuantity > 0 ? 'Pinjam Sekarang' : 'Tidak Tersedia'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
