import React from 'react';
import { BorrowingStatus } from '../types';

type StatusType = BorrowingStatus | 'Available' | 'Unavailable';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  Pending: { label: 'Menunggu', className: 'status-pending' },
  Approved: { label: 'Disetujui', className: 'status-approved' },
  Rejected: { label: 'Ditolak', className: 'status-rejected' },
  Returned: { label: 'Dikembalikan', className: 'status-returned' },
  Available: { label: 'Tersedia', className: 'status-available' },
  Unavailable: { label: 'Tidak Tersedia', className: 'status-unavailable' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'status-returned' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
