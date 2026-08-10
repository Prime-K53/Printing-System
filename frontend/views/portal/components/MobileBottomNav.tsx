import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { portalApi, portalLifecycle } from '../../../services/portalApiClient';

const SF = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

interface BadgeCounts {
  unpaidInvoices: number;
  activeDeliveries: number;
  unreadNotifications: number;
}

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [badges, setBadges] = useState<BadgeCounts>({ unpaidInvoices: 0, activeDeliveries: 0, unreadNotifications: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dash, notifCount] = await Promise.all([
          portalApi.get<any>('/dashboard'),
          portalApi.get<{ count: number }>('/notifications/unread-count'),
        ]);
        if (!cancelled) {
          setBadges({
            unpaidInvoices: dash?.unpaidInvoiceCount ?? 0,
            activeDeliveries: dash?.activeDeliveries ?? 0,
            unreadNotifications: notifCount?.count ?? 0,
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        unsub = await portalLifecycle.subscribe({
          onEvent: (type) => {
            if (!cancelled && (type === 'notification' || type === 'entity_changed')) {
              portalApi.get<any>('/dashboard').then((dash) => {
                if (!cancelled) setBadges((prev) => ({ ...prev, unpaidInvoices: dash?.unpaidInvoiceCount ?? 0, activeDeliveries: dash?.activeDeliveries ?? 0 }));
              }).catch(() => {});
              portalApi.get<{ count: number }>('/notifications/unread-count').then((c) => {
                if (!cancelled) setBadges((prev) => ({ ...prev, unreadNotifications: c?.count ?? 0 }));
              }).catch(() => {});
            }
          },
        });
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; unsub?.(); };
  }, []);

  const Badge: React.FC<{ count: number }> = ({ count }) => {
    if (count <= 0) return null;
    return (
      <span style={{
        position: 'absolute', top: 0, right: 6, minWidth: 15, height: 15,
        borderRadius: 8, background: '#E53E3E', color: '#fff',
        fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px', border: '1.5px solid #fff',
      }}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const items = [
    { label: 'Home', path: '/portal/dashboard', badge: 0, icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#0F2C59' : '#94A3B8'} strokeWidth={a ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: 'Orders', path: '/portal/orders', badge: 0, icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#0F2C59' : '#94A3B8'} strokeWidth={a ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { label: 'Invoices', path: '/portal/invoices', badge: badges.unpaidInvoices, icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#0F2C59' : '#94A3B8'} strokeWidth={a ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><path d="M15.5 14.5c-.5 1-1.5 1.5-3.5 1.5s-3-.5-3.5-1.5"/></svg> },
    { label: 'Shipments', path: '/portal/shipments', badge: badges.activeDeliveries, icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#0F2C59' : '#94A3B8'} strokeWidth={a ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { label: 'Profile', path: '/portal/profile', badge: badges.unreadNotifications, icon: (a: boolean) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#0F2C59' : '#94A3B8'} strokeWidth={a ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: '#fff', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom,0)', zIndex: 50, fontFamily: SF }}>
      {items.map((item) => {
        const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
          <button key={item.path} onClick={() => navigate(item.path)} aria-label={item.label} aria-current={active ? 'page' : undefined} style={{ position: 'relative', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', minWidth: 52, color: active ? '#0F2C59' : '#94A3B8' }}>
            <span style={{ position: 'relative' }}>
              {item.icon(active)}
              <Badge count={item.badge} />
            </span>
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500, lineHeight: 1.2, fontFamily: SF, color: active ? '#0F2C59' : '#94A3B8' }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
