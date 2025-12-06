import { useQuery } from '@tanstack/react-query';
import { getInvoices, getDashboardData } from '@/lib/api';
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
  Button,
  EmptyState,
} from '@/components/ui';
import { CreditCard, Download } from 'lucide-react';

export function Pagamentos() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  if (isDashboardLoading || isInvoicesLoading) return <Loading />;

  const subscription = dashboardData?.data?.subscription;
  const invoices = invoicesData?.data || [];

  return (
    <div>
      <PageHeader
        title="Pagamentos"
        subtitle="Gerencie sua assinatura e faturas"
      />

      {/* Card: Resumo da Assinatura */}
      {subscription && (
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-dark mb-2">Assinatura Atual</h3>
              <p className="text-3xl font-black text-primary mb-1">
                R$ {subscription.plan?.price_monthly.toFixed(2)}
                <span className="text-base font-normal text-gray-600">/mês</span>
              </p>
              <p className="text-gray-600">{subscription.plan?.name}</p>
            </div>
            <StatusBadge status={subscription.status} type="subscription" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Início da assinatura</p>
              <p className="font-semibold">
                {new Date(subscription.started_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Próxima renovação</p>
              <p className="font-semibold">
                {new Date(subscription.renews_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Método de pagamento</p>
              <p className="font-semibold capitalize">{subscription.payment_method}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Card: Histórico de Faturas */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark">Histórico de Faturas</h3>
          <CreditCard className="w-5 h-5 text-primary" />
        </div>

        {invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableHead>Data de Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
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
                    {invoice.status === 'pago' && invoice.paid_at && (
                      <span className="text-sm text-gray-500">
                        Pago em {new Date(invoice.paid_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {(invoice.status === 'pendente' || invoice.status === 'atrasado') && invoice.payment_link && (
                      <a href={invoice.payment_link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="primary">
                          Pagar Agora
                        </Button>
                      </a>
                    )}
                    {invoice.status === 'pago' && (
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Nenhuma fatura encontrada"
            description="Suas faturas aparecerão aqui quando geradas"
          />
        )}
      </Card>

      {/* Card: Informações */}
      <Card className="mt-6 bg-blue-50 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💳 Formas de Pagamento</h4>
        <p className="text-sm text-blue-800">
          Aceitamos pagamentos via cartão de crédito, PIX e boleto bancário através do Stripe.
          Suas informações de pagamento são processadas de forma segura.
        </p>
      </Card>
    </div>
  );
}

