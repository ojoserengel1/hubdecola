import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@decolaweb/shared';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user.role as UserRole} />
      
      <main className="flex-1 ml-64 p-8 overflow-x-hidden overflow-y-auto">
        {/* Header com boas-vindas */}
        <div className="mb-8">
          <h2 className="text-lg text-gray-600">
            Bem-vindo, <span className="font-semibold text-dark">{user.name}</span>
          </h2>
          {user.company_name && (
            <p className="text-sm text-gray-500">{user.company_name}</p>
          )}
        </div>

        {/* Conteúdo da página */}
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}

