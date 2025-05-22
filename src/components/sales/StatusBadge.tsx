import React from 'react';
import { PaymentStatus } from '../../types/sale';

interface StatusBadgeProps {
  status: PaymentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
    [PaymentStatus.PARTIALLY_PAID]: 'bg-blue-100 text-blue-800',
    [PaymentStatus.CANCELLED]: 'bg-red-100 text-red-800'
  };

  const labels = {
    [PaymentStatus.PENDING]: 'Pendente',
    [PaymentStatus.PAID]: 'Pago',
    [PaymentStatus.PARTIALLY_PAID]: 'Parcialmente Pago',
    [PaymentStatus.CANCELLED]: 'Cancelado'
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${styles[status]}
      `}
    >
      {labels[status]}
    </span>
  );
};

export default StatusBadge; 