import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Login } from '@/pages/Login';
import { UserRole } from '@decolaweb/shared';

// Client Pages
import {
  Dashboard,
  Briefing,
  Pagamentos,
  Emails,
  Dominio,
  Suporte,
  TicketDetalhe as ClientTicketDetalhe,
  Contrato,
} from '@/pages/client';
import { Chat as ClientChat } from '@/pages/client/Chat';

// Admin Pages
import {
  Clientes,
  ClienteDetalhe,
  Pipeline,
  Tickets,
  TicketDetalhe as AdminTicketDetalhe,
  Financeiro,
  Emails as AdminEmails,
  StatusTemplates,
  Planos,
} from '@/pages/admin';
import { Chat as AdminChat } from '@/pages/admin/Chat';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Cliente Routes */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute requireRole={UserRole.CLIENT}>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="briefing" element={<Briefing />} />
                  <Route path="pagamentos" element={<Pagamentos />} />
                  <Route path="emails" element={<Emails />} />
                  <Route path="dominio" element={<Dominio />} />
                  <Route path="tickets" element={<Suporte />} />
                  <Route path="tickets/:id" element={<ClientTicketDetalhe />} />
                  <Route path="contrato" element={<Contrato />} />
                  <Route path="chat" element={<ClientChat />} />
                  <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireRole={UserRole.ADMIN}>
              <AppLayout>
                <Routes>
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="clientes/:id" element={<ClienteDetalhe />} />
                  <Route path="pipeline" element={<Pipeline />} />
                  <Route path="tickets" element={<Tickets />} />
                  <Route path="tickets/:id" element={<AdminTicketDetalhe />} />
                  <Route path="financeiro" element={<Financeiro />} />
                  <Route path="chat" element={<AdminChat />} />
                  <Route path="emails" element={<AdminEmails />} />
                  <Route path="status-templates" element={<StatusTemplates />} />
                  <Route path="planos" element={<Planos />} />
                  <Route path="*" element={<Navigate to="/admin/clientes" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;

