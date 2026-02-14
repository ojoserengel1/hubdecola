import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Globe,
  Mail,
  AtSign,
  FileCheck,
  LogOut,
  Users,
  Kanban,
  TicketIcon,
  DollarSign,
  MessageSquare,
  Settings,
  Package,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@decolaweb/shared';

interface SidebarProps {
  role: UserRole;
}

// Seção superior do menu do cliente
const clientMenuItemsTop = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/briefing', label: 'Briefing', icon: FileText },
  { path: '/app/dominio', label: 'Domínio', icon: AtSign },
  { path: '/app/emails', label: 'E-mails', icon: Mail },
];

// Seção inferior do menu do cliente
const clientMenuItemsBottom = [
  { path: '/app/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { path: '/app/contrato', label: 'Contrato', icon: FileCheck },
  { path: '/app/tickets', label: 'Tickets', icon: TicketIcon },
  { path: '/app/chat', label: 'Chat', icon: MessageSquare },
];

const adminMenuItems = [
  { path: '/admin/clientes', label: 'Clientes', icon: Users },
  { path: '/admin/pipeline', label: 'Pipeline', icon: Kanban },
  { path: '/admin/tickets', label: 'Tickets', icon: TicketIcon },
  { path: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { path: '/admin/chat', label: 'Chat', icon: MessageSquare },
  { path: '/admin/emails', label: 'E-mails', icon: Mail },
  { path: '/admin/status-templates', label: 'Status do Site', icon: Settings },
  { path: '/admin/planos', label: 'Planos', icon: Package },
];

export function Sidebar({ role }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const isClient = role === UserRole.CLIENT;
  const topMenuItems = isClient ? clientMenuItemsTop : adminMenuItems;
  const bottomMenuItems = isClient ? clientMenuItemsBottom : [];

  type MenuItem = typeof clientMenuItemsTop[0] | typeof adminMenuItems[0] | typeof clientMenuItemsBottom[0];
  
  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isChat = item.path.includes('/chat');
    
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          clsx(
            'flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-semibold transition-colors',
            {
              'bg-primary text-white': isActive && !isChat,
              'bg-blue-600 text-white': isActive && isChat,
              'text-gray-300 hover:bg-gray-800': !isActive && !isChat,
              'text-blue-300 hover:bg-blue-900/30 border border-blue-500/30': !isActive && isChat,
            }
          )
        }
      >
        <Icon className="w-5 h-5 mr-3" />
        {item.label}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-dark h-screen flex flex-col flex-shrink-0 fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 flex-shrink-0">
        <h1 className="text-2xl font-black text-white">DecolaWeb</h1>
        <p className="text-xs text-gray-400 mt-1">
          {role === UserRole.ADMIN ? 'Painel Admin' : 'Área do Cliente'}
        </p>
      </div>

      {/* Menu Superior */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        {topMenuItems.map(renderMenuItem)}
      </nav>

      {/* Menu Inferior + Logout */}
      <div className="flex-shrink-0 border-t border-gray-800">
        {/* Menu Inferior (apenas para clientes) */}
        {bottomMenuItems.length > 0 && (
          <nav className="px-4 py-2">
            {bottomMenuItems.map(renderMenuItem)}
          </nav>
        )}

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

