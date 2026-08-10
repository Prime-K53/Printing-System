import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalApi, portalLifecycle } from '../../services/portalApiClient';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import ErrorBanner from './components/ErrorBanner';
import PortalLoadingSkeleton from './components/PortalLoadingSkeleton';
import { formatK } from './constants';

interface Transaction {
  date: string;
  description: string;
  amount: number | null;
  type: string;
  status?: string;
  docType?: string;
  docId?: string;
}

interface DashboardData {
  balance: number;
  outstandingBalance: number;
  walletBalance: number;
  unpaidInvoiceCount: number;
  totalOrders: number;
  unreadMessageCount: number;
  recentTransactions: Transaction[];
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

const Sparkline: React.FC<{ v: number[]; c: string; w?: number; h?: number }> = ({ v, c, w = 56, h = 22 }) => {
  if (v.length < 2) return null;
  const mx = Math.max(...v), mn = Math.min(...v), r = mx - mn || 1;
  const pts = v.map((val, i) => `${2 + (i / (v.length - 1)) * (w - 4)},${2 + (1 - (val - mn) / r) * (h - 4)}`).join(' ');
  const gid = `g${c.replace('#', '')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity="0.1" /><stop offset="100%" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const rT = () => Array.from({ length: 7 }, () => 20 + Math.random() * 80);

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useCustomerAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portalApi.get<DashboardData>('/dashboard').then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let off = false;
    let unsub: (() => void) | undefined;
    (async () => {
      const T = ['invoice', 'order', 'sale', 'payment', 'quotation', 'request', 'shipment'];
      unsub = await portalLifecycle.subscribe({
        onEvent: (type, p) => {
          const dt = p?.docType;
          if ((p?.event === 'payment_allocated' || (dt && T.includes(dt)) || type === 'activity') && !off)
            portalApi.get<DashboardData>('/dashboard').then(setData).catch(() => {});
        },
      });
    })();
    return () => { off = true; unsub?.(); };
  }, []);

  if (loading) return <div style={{ padding: 12 }}><PortalLoadingSkeleton type="card" /><PortalLoadingSkeleton type="table" count={5} /></div>;
  if (error) return <div style={{ padding: 12 }}><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>;
  if (!data) return null;

  const txns = (data.recentTransactions || []).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const icon = (d: string, s: number = 14, sw: number = 2) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
  );

  return (
    <div style={{ fontFamily: F, background: '#F8FAFC', minHeight: '100%', paddingBottom: 16 }}>

      {/* Welcome Header Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: 20, padding: 16,
        marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#E2E8F0', borderRadius: 20,
            padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#0F2C59',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Customer Portal
          </span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
          {user?.company_name || user?.full_name || 'Customer'}
        </div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
          Account ID: {user?.customer_code || user?.email || ''}
        </div>

        {/* Banner */}
        <div style={{
          marginTop: 14, borderRadius: 16, height: 110, overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F2C59 0%, #1E4078 40%, #059669 100%)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>Enterprise B2B Portal</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>Real-time tracking, quotes, statements &amp; payments</div>
          </div>
        </div>
      </div>

      {/* Account Summary KPI Cards - horizontal scroll */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Account Summary</div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            {
              title: 'Unpaid Invoices',
              value: `$${(data.outstandingBalance || 0).toFixed(2)}`,
              subtitle: `${data.unpaidInvoiceCount || 0} Overdue`,
              icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
              bg: '#FEE2E2', color: '#991B1B', to: '/portal/invoices',
            },
            {
              title: 'Active Deliveries',
              value: `${data.totalOrders || 0} Shipments`,
              subtitle: 'Real-time Tracking',
              icon: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
              bg: '#E2E8F0', color: '#0F2C59', to: '/portal/shipments',
            },
            {
              title: 'Wallet Balance',
              value: `$${(data.walletBalance || 0).toFixed(2)}`,
              subtitle: 'Available Funds',
              icon: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/>',
              bg: '#D1FAE5', color: '#065F46', to: '/portal/wallet',
            },
          ].map((kpi, i) => (
            <div
              key={i}
              onClick={() => navigate(kpi.to)}
              style={{
                minWidth: 160, background: kpi.bg, borderRadius: 16, padding: 16,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={kpi.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: kpi.icon }} />
              <div style={{ fontSize: 11, color: kpi.color, marginTop: 10, opacity: 0.8 }}>{kpi.title}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: kpi.color, marginTop: 2 }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: kpi.color, marginTop: 2, opacity: 0.7 }}>{kpi.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { title: 'Pay Invoices', icon: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', to: '/portal/invoices' },
            { title: 'New Order', icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>', to: '/portal/orders' },
            { title: 'Get Quote', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', to: '/portal/quotations' },
            { title: 'Track Shipments', icon: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>', to: '/portal/shipments' },
            { title: 'Refer Business', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', to: '/portal/referrals' },
            { title: 'Statements', icon: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>', to: '/portal/statements' },
          ].map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.to)}
              style={{
                background: '#FFFFFF', borderRadius: 12, padding: '14px 8px',
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
                gap: 6, cursor: 'pointer', border: '1px solid #E2E8F0',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: action.icon }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>{action.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unpaid Invoices Section */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Unpaid Invoices</div>
          <button onClick={() => navigate('/portal/invoices')} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#059669', cursor: 'pointer' }}>
            View All
          </button>
        </div>
        {!data.unpaidInvoiceCount || data.unpaidInvoiceCount === 0 ? (
          <div style={{
            background: '#FFFFFF', borderRadius: 12, padding: 16,
            display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #E2E8F0',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{ fontSize: 13, color: '#475569' }}>All invoices are fully paid! Your account is in great standing.</span>
          </div>
        ) : (
          <div style={{
            background: '#FFFFFF', borderRadius: 12, padding: 16,
            border: '1px solid #E2E8F0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Outstanding Balance</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626', marginTop: 2 }}>
                  ${(data.outstandingBalance || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '3px 8px', borderRadius: 8, background: '#FEE2E2', fontSize: 11, fontWeight: 700, color: '#991B1B' }}>
                {data.unpaidInvoiceCount} Unpaid
              </div>
            </div>
            <button
              onClick={() => navigate('/portal/invoices?status=Unpaid')}
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 10,
                background: '#0F2C59', color: '#FFFFFF', fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', marginTop: 8,
              }}
            >
              Pay Now
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerDashboard;
