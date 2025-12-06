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
  StatusSite,
  Emails,
  Dominio,
  Suporte,
  Contrato,
} from '@/pages/client';

// Admin Pages
import {
  Clientes,
  ClienteDetalhe,
  Pipeline,
  Tickets,
  Financeiro,
} from '@/pages/admin';

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
                  <Route path="status-site" element={<StatusSite />} />
                  <Route path="emails" element={<Emails />} />
                  <Route path="dominio" element={<Dominio />} />
                  <Route path="suporte" element={<Suporte />} />
                  <Route path="contrato" element={<Contrato />} />
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
                  <Route path="financeiro" element={<Financeiro />} />
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

