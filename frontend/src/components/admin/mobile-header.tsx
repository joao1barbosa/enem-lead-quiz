import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

/**
 * Header mobile do painel administrativo (<1024px).
 * Exibe o logo e o avatar do admin; ao clicar no avatar abre um
 * DropdownMenu (shadcn/Radix) com os dados do usuário e a opção de sair
 * da conta. O DropdownMenu fornece navegação por teclado (setas, Enter,
 * ESC), semântica de menu/menuitem e tokens semânticos
 * (bg-popover, text-popover-foreground, border) (RNF-03, US-09).
 */
export function MobileHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
      <h1 className="text-lg font-bold">ENEM Lead Quiz</h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Menu do usuário"
            className="inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="w-10 h-10 cursor-pointer">
              {/* Sem imagem de perfil disponível; o fallback exibe a 1ª letra do email */}
              <AvatarImage src={undefined} alt="" />
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-lg shadow-lg">
          <DropdownMenuLabel className="flex items-center gap-3 py-2 min-w-0">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium truncate">{user?.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => logout()}
            className="cursor-pointer px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
