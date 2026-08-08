import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

/**
 * Header mobile do painel administrativo (<1024px).
 * Exibe o logo e o avatar do admin; ao clicar no avatar abre um popover
 * com os dados do usuário e a opção de sair da conta (RNF-03, US-09).
 */
export function MobileHeader() {
  const [showPopover, setShowPopover] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
      <h1 className="text-lg font-bold">ENEM Lead Quiz</h1>

      <div className="relative">
        <button
          onClick={() => setShowPopover(!showPopover)}
          className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold"
        >
          {user?.email?.[0]?.toUpperCase() || 'A'}
        </button>

        {showPopover && (
          <div className="absolute right-0 top-12 w-64 bg-white border rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium truncate">{user?.email}</span>
            </div>
            <button
              onClick={() => {
                logout();
                setShowPopover(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
