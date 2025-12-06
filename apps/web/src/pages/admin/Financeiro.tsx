import { useQuery } from '@tanstack/react-query';
import { getAdminFinanceiro } from '@/lib/api';
import {
  Card,
  PageHeader,
  Loading,
  StatusBadge,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui';
import { DollarSign, Users, TrendingUp, CreditCard } from 'lucide-react';

export function Financeiro() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-financeiro'],
    queryFn: getAdminFinanceiro,
  });

  if (isLoading) return <Loading />;

  const financeData = data?.data;

  if (!financeData) {
    return <div>Erro ao carregar dados financeiros</div>;
  }

  const { activeClients, monthlyRevenue, subscriptions, recentInvoices } = financeData;

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Visão geral de receitas e pagamentos"
      />

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-primary to-red-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Receita Mensal</p>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black">
            R$ {monthlyRevenue.toFixed(2)}
          </p>
          <p className="text-xs opacity-75 mt-1">Receita recorrente mensal</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Clientes Ativos</p>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-black text-dark">{activeClients}</p>
          <p className="text-xs text-gray-500 mt-1">Com assinatura ativa</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Ticket Médio</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-black text-dark">
            R$ {activeClients > 0 ? (monthlyRevenue / activeClients).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Por cliente</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Assinaturas</p>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-dark">{subscriptions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total de assinaturas</p>
        </Card>
      </div>

      {/* Tabela de Assinaturas Ativas */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-dark mb-4">Assinaturas Ativas</h3>
        <Table>
          <TableHeader>
            <TableHead>Cliente</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Próxima Renovação</TableHead>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub: any) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.user?.name || '-'}</TableCell>
                <TableCell>{sub.plan?.name}</TableCell>
                <TableCell>
                  <span className="font-semibold">
                    R$ {sub.plan?.price_monthly.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={sub.status} type="subscription" />
                </TableCell>
                <TableCell>
                  {new Date(sub.renews_at).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Faturas Recentes */}
      <Card>
        <h3 className="text-lg font-semibold text-dark mb-4">Faturas Recentes</h3>
        <Table>
          <TableHeader>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
          </TableHeader>
          <TableBody>
            {recentInvoices.map((invoice: any) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <span className="font-semibold">
                    R$ {invoice.amount.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} type="invoice" />
                </TableCell>
                <TableCell>
                  {invoice.paid_at
                    ? new Date(invoice.paid_at).toLocaleDateString('pt-BR')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

