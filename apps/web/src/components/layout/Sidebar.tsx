import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Globe,
  Mail,
  AtSign,
  HelpCircle,
  FileCheck,
  LogOut,
  Users,
  Kanban,
  TicketIcon,
  DollarSign,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@decolaweb/shared';

interface SidebarProps {
  role: UserRole;
}

const clientMenuItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/briefing', label: 'Briefing', icon: FileText },
  { path: '/app/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { path: '/app/status-site', label: 'Status do Site', icon: Globe },
  { path: '/app/emails', label: 'E-mails', icon: Mail },
  { path: '/app/dominio', label: 'Domínio', icon: AtSign },
  { path: '/app/suporte', label: 'Suporte', icon: HelpCircle },
  { path: '/app/contrato', label: 'Contrato', icon: FileCheck },
];

const adminMenuItems = [
  { path: '/admin/clientes', label: 'Clientes', icon: Users },
  { path: '/admin/pipeline', label: 'Pipeline', icon: Kanban },
  { path: '/admin/tickets', label: 'Tickets', icon: TicketIcon },
  { path: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
];

export function Sidebar({ role }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const menuItems = role === UserRole.ADMIN ? adminMenuItems : clientMenuItems;

  return (
    <aside className="w-64 bg-dark min-h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-black text-white">DecolaWeb</h1>
        <p className="text-xs text-gray-400 mt-1">
          {role === UserRole.ADMIN ? 'Painel Admin' : 'Área do Cliente'}
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-semibold transition-colors',
                  {
                    'bg-primary text-white': isActive,
                    'text-gray-300 hover:bg-gray-800': !isActive,
                  }
                )
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </aside>
  );
}

