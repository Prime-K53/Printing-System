import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet' | 'teal' | 'slate';
  selected?: boolean;
  onClick?: () => void;
}

const colorConfig: Record<string, { border: string; bg: string; iconBg: string; iconColor: string }> = {
  emerald: { border: '#059669', bg: '#F0FDF4', iconBg: '#D1FAE5', iconColor: '#065F46' },
  blue: { border: '#0F2C59', bg: '#EFF6FF', iconBg: '#DBEAFE', iconColor: '#1E40AF' },
  amber: { border: '#D97706', bg: '#FFFBEB', iconBg: '#FEF3C7', iconColor: '#92400E' },
  rose: { border: '#DC2626', bg: '#FEE2E2', iconBg: '#FEE2E2', iconColor: '#991B1B' },
  violet: { border: '#7C3AED', bg: '#F5F3FF', iconBg: '#EDE9FE', iconColor: '#6D28D9' },
  teal: { border: '#059669', bg: '#F0FDF4', iconBg: '#D1FAE5', iconColor: '#065F46' },
  slate: { border: '#475569', bg: '#F8FAFC', iconBg: '#F1F5F9', iconColor: '#475569' },
};

const PortalKPICard: React.FC<Props> = ({ label, value, icon: Icon, trend, color = 'emerald', selected = false, onClick }) => {
  const colors = colorConfig[color];

  return (
    <div
      onClick={onClick}
      className="glass-panel-interactive rounded-2xl p-4 relative overflow-hidden group flex items-start gap-3.5"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `4px solid ${colors.border}`,
        borderColor: selected ? colors.border : undefined,
        boxShadow: selected ? '0 12px 28px -6px rgba(15, 23, 42, 0.12)' : undefined,
      }}
    >
      <div className="p-2.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105" style={{ background: colors.iconBg, color: colors.iconColor }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold text-slate-900 font-sans tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </p>
          {trend && (
            <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalKPICard;
