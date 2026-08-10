import React from 'react';

interface Props {
  status: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; icon?: React.ReactNode; pulse?: boolean }> = {
  paid: { label: 'Paid', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  complete: { label: 'Complete', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  delivered: { label: 'Delivered', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  fulfilled: { label: 'Fulfilled', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  confirmed: { label: 'Confirmed', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  active: { label: 'Active', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  unpaid: { label: 'Unpaid', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  voided: { label: 'Voided', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  rejected: { label: 'Rejected', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  pending: { label: 'Pending', bg: '#FEF9C3', text: '#92400E', dot: '#D97706', pulse: true },
  under_review: { label: 'Under Review', bg: '#FEF9C3', text: '#92400E', dot: '#D97706', pulse: true },
  overdue: { label: 'Overdue', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626', pulse: true },
  processing: { label: 'Processing', bg: '#DBEAFE', text: '#1E40AF', dot: '#2563EB', pulse: true },
  in_progress: { label: 'In Progress', bg: '#DBEAFE', text: '#1E40AF', dot: '#2563EB', pulse: true },
  inprogress: { label: 'In Progress', bg: '#DBEAFE', text: '#1E40AF', dot: '#2563EB', pulse: true },
  submitted: { label: 'Submitted', bg: '#DBEAFE', text: '#1E40AF', dot: '#2563EB', pulse: true },
  shipped: { label: 'Shipped', bg: '#DBEAFE', text: '#1E40AF', dot: '#2563EB', pulse: true },
  draft: { label: 'Draft', bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
  quotation_ready: { label: 'Quotation Ready', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  ready: { label: 'Ready', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  accepted: { label: 'Accepted', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  converted: { label: 'Converted', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
  revision_requested: { label: 'Revision Requested', bg: '#F5F3FF', text: '#7C3AED', dot: '#7C3AED', pulse: true },
  expired: { label: 'Expired', bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
  waiting_for_customer: { label: 'Waiting for Customer', bg: '#F5F3FF', text: '#7C3AED', dot: '#7C3AED', pulse: true },
  approved: { label: 'Approved', bg: '#D1FAE5', text: '#065F46', dot: '#059669' },
};

const StatusBadge: React.FC<Props> = ({ status, size = 'md', showIcon = true }) => {
  const key = status?.toLowerCase().replace(/\s+/g, '') || '';
  const config = statusConfig[key] || { label: status, bg: '#f8fafc', text: '#475569', dot: '#94a3b8' };
  const isSmall = size === 'sm';

  return (
    <span
      className="inline-flex items-center gap-1.5 font-bold rounded-full whitespace-nowrap shadow-2xs transition-all duration-150"
      style={{
        background: config.bg,
        color: config.text,
        fontSize: isSmall ? 10 : 11,
        padding: isSmall ? '2px 8px' : '3.5px 11px',
        lineHeight: 1.4,
        border: `1px solid ${config.text}30`,
      }}
    >
      <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
        {config.pulse && (
          <span className="absolute inset-0 rounded-full opacity-75 animate-ping" style={{ background: config.dot }} />
        )}
        <span className="relative rounded-full" style={{ background: config.dot, width: isSmall ? 5 : 6, height: isSmall ? 5 : 6 }} />
      </span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
