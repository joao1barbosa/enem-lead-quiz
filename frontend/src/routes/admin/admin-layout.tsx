import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/admin/sidebar';
import { MobileHeader } from '../../components/admin/mobile-header';
import { BottomNavigation } from '../../components/admin/bottom-nav';

/**
 * Layout persistente do painel administrativo (RNF-03, US-08).
 * Desktop (≥1024px): sidebar fixa à esquerda.
 * Mobile (<1024px): header superior + bottom navigation fixa.
 * As rotas aninhadas são renderizadas via <Outlet />.
 */
export function AdminLayout() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Outlet />
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
}
