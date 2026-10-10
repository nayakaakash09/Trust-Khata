import React from 'react';
import { Clock, CheckCircle2, AlertCircle, XCircle, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toUpperCase();

  const configs = {
    PENDING: {
      label: 'Pending Verification',
      className: 'badge-pending',
      icon: Clock,
    },
    ACCEPTED: {
      label: 'Accepted Credit',
      className: 'badge-accepted',
      icon: CheckCircle2,
    },
    DISPUTED: {
      label: 'Disputed',
      className: 'badge-disputed',
      icon: AlertCircle,
    },
    REJECTED: {
      label: 'Rejected',
      className: 'badge-rejected',
      icon: XCircle,
    },
    PAID: {
      label: 'Paid & Settled',
      className: 'badge-paid',
      icon: ShieldCheck,
    },
  };

  const current = configs[normalized] || {
    label: normalized,
    className: 'badge-rejected',
    icon: Clock,
  };

  const Icon = current.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`badge ${current.className}`} style={{ fontSize: size === 'sm' ? '0.7rem' : '0.75rem' }}>
      <Icon size={iconSize} />
      <span>{current.label}</span>
    </span>
  );
}
