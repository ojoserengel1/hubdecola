import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api';
import { Card, PageHeader, Badge, StatusBadge, Loading, Button } from '@/components/ui';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, FileText, DollarSign, Mail } from 'lucide-react';
import { SiteStatus } from '@decolaweb/shared';

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  if (isLoading) return <Loading />;

  const dashboardData = data?.data;

  if (!dashboardData) {
    return <div>Erro ao carregar dados</div>;
  }

  const { subscription, siteStatus, recentInvoices, briefing, emails, contract } = dashboardData;

  // Calcula se há faturas pendentes
  const hasPendingInvoices = recentInvoices.some(inv => inv.status === 'pendente' || inv.status === 'atrasado');

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da sua conta DecolaWeb"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Resumo do Plano */}
        <Card hover>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark">Resumo do Plano</h3>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          
          {subscription ? (
            <>
              <p className="text-2xl font-black text-dark mb-2">
                R$ {subscription.plan?.price_monthly.toFixed(2)}
                <span className="text-base font-normal text-gray-600">/mês</span>
              </p>
              <p className="text-sm text-gray-600 mb-3">{subscription.plan?.name}</p>
              <StatusBadge status={subscription.status} type="subscription" />
              
              <Link to="/app/pagamentos">
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Ver detalhes do plano
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-gray-500">Nenhuma assinatura ativa</p>
          )}
        </Card>

        {/* Card: Status do Site */}
        <Card hover>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark">Status do Site</h3>
            <Clock className="w-5 h-5 text-primary" />
          </div>

          {siteStatus ? (
            <>
              <StatusBadge status={siteStatus.status} type="site" />
              
              <div className="mt-4 space-y-2">
                {siteStatus.status === SiteStatus.WAITING_BRIEFING && (
                  <p className="text-sm text-gray-600">
                    Preencha o briefing para iniciarmos o desenvolvimento do seu site!
                  </p>
                )}
                {siteStatus.status === SiteStatus.IN_PRODUCTION && (
                  <p className="text-sm text-gray-600">
                    Sua equipe está trabalhando no seu projeto 🚀
                  </p>
                )}
                {siteStatus.status === SiteStatus.UNDER_APPROVAL && (
                  <p className="text-sm text-gray-600">
                    Seu site está pronto para revisão!
                  </p>
                )}
                {siteStatus.status === SiteStatus.PUBLISHED && (
                  <p className="text-sm text-gray-600">
                    Seu site está no ar! 🎉
                  </p>
                )}
              </div>

              <Link to="/app/status-site">
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Ver status completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-gray-500">Status não disponível</p>
          )}
        </Card>

        {/* Card: Contrato */}
        <Card hover>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark">Contrato</h3>
            <FileText className="w-5 h-5 text-primary" />
          </div>

          {contract ? (
            <>
              <Badge variant={contract.status === 'assinado' ? 'success' : 'warning'}>
                {contract.status === 'assinado' ? 'Assinado' : 'Pendente de assinatura'}
              </Badge>

              {contract.status === 'pendente' && (
                <>
                  <p className="text-sm text-gray-600 mt-3">
                    Assine seu contrato para prosseguirmos com o desenvolvimento
                  </p>
                  <Link to="/app/contrato">
                    <Button variant="primary" size="sm" className="mt-4 w-full">
                      Assinar contrato
                    </Button>
                  </Link>
                </>
              )}

              {contract.status === 'assinado' && (
                <>
                  <p className="text-sm text-gray-600 mt-3">
                    Contrato assinado em {new Date(contract.signed_at!).toLocaleDateString('pt-BR')}
                  </p>
                  <Link to="/app/contrato">
                    <Button variant="ghost" size="sm" className="mt-4 w-full">
                      Ver contrato
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-500">Contrato não disponível</p>
          )}
        </Card>

        {/* Card: Pagamentos e Faturas */}
        <Card hover className="md:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark">Pagamentos e Faturas</h3>
            <CheckCircle className={hasPendingInvoices ? 'w-5 h-5 text-yellow-500' : 'w-5 h-5 text-green-500'} />
          </div>

          {hasPendingInvoices ? (
            <Badge variant="warning">Há faturas pendentes</Badge>
          ) : (
            <Badge variant="success">Tudo em dia</Badge>
          )}

          {recentInvoices.length > 0 ? (
            <>
              <div className="mt-4 space-y-2">
                {recentInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-semibold">
                        {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        R$ {invoice.amount.toFixed(2)}
                      </p>
                    </div>
                    <StatusBadge status={invoice.status} type="invoice" />
                  </div>
                ))}
              </div>

              <Link to="/app/pagamentos">
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Ver todas as faturas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-3">Nenhuma fatura disponível</p>
          )}
        </Card>

        {/* Card: E-mails Profissionais */}
        <Card hover>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark">E-mails Profissionais</h3>
            <Mail className="w-5 h-5 text-primary" />
          </div>

          {emails.length > 0 ? (
            <>
              <p className="text-2xl font-black text-dark mb-2">{emails.length}</p>
              <p className="text-sm text-gray-600">
                {emails.length === 1 ? 'e-mail configurado' : 'e-mails configurados'}
              </p>

              <Link to="/app/emails">
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Gerenciar e-mails
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Nenhum e-mail profissional configurado
              </p>
              <Link to="/app/emails">
                <Button variant="primary" size="sm" className="w-full">
                  Solicitar e-mail
                </Button>
              </Link>
            </>
          )}
        </Card>

        {/* Card: Suporte */}
        <Card hover className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-primary to-red-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-sm opacity-90">
                Nossa equipe está pronta para te atender via WhatsApp ou através de tickets de suporte
              </p>
            </div>
            <Link to="/app/suporte">
              <Button variant="secondary" size="md">
                Abrir Suporte
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

