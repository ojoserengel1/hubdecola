import { useQuery } from '@tanstack/react-query';
import { getSiteStatus, getDashboardData } from '@/lib/api';
import { Card, PageHeader, Loading, Timeline, StatusBadge } from '@/components/ui';
import { SiteStatus } from '@decolaweb/shared';
import { Globe, CheckCircle2 } from 'lucide-react';

export function StatusSite() {
  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ['site-status'],
    queryFn: getSiteStatus,
  });

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  if (isStatusLoading || isDashboardLoading) return <Loading />;

  const siteStatus = statusData?.data || dashboardData?.data?.siteStatus;
  const domain = dashboardData?.data?.domain;

  const timelineSteps = [
    {
      label: 'Briefing Enviado',
      completed: siteStatus?.status !== SiteStatus.WAITING_BRIEFING,
      current: siteStatus?.status === SiteStatus.WAITING_BRIEFING,
    },
    {
      label: 'Site em Produção',
      completed: siteStatus?.status === SiteStatus.UNDER_APPROVAL || siteStatus?.status === SiteStatus.PUBLISHED,
      current: siteStatus?.status === SiteStatus.IN_PRODUCTION,
    },
    {
      label: 'Aguardando Aprovação',
      completed: siteStatus?.status === SiteStatus.PUBLISHED,
      current: siteStatus?.status === SiteStatus.UNDER_APPROVAL,
    },
    {
      label: 'Site no Ar',
      completed: siteStatus?.status === SiteStatus.PUBLISHED,
      current: false,
    },
  ];

  const statusMessages = {
    [SiteStatus.WAITING_BRIEFING]: {
      title: 'Aguardando Briefing',
      description: 'Preencha o briefing para que possamos iniciar o desenvolvimento do seu site!',
      color: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-800',
    },
    [SiteStatus.IN_PRODUCTION]: {
      title: 'Site em Produção',
      description: 'Nossa equipe está trabalhando no seu projeto. Em breve você receberá uma prévia!',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
    },
    [SiteStatus.UNDER_APPROVAL]: {
      title: 'Aguardando Aprovação',
      description: 'Seu site está pronto! Revise e nos envie seu feedback para ajustes finais.',
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
    },
    [SiteStatus.PUBLISHED]: {
      title: 'Site Publicado',
      description: 'Parabéns! Seu site está no ar e acessível para todos. 🎉',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
    },
  };

  const currentStatusMessage = siteStatus
    ? statusMessages[siteStatus.status as SiteStatus]
    : null;

  return (
    <div>
      <PageHeader
        title="Status do Site"
        subtitle="Acompanhe o desenvolvimento do seu projeto"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-dark mb-6">Progresso do Desenvolvimento</h3>
          <Timeline steps={timelineSteps} />
        </Card>

        {/* Status Atual */}
        <div className="space-y-6">
          {siteStatus && currentStatusMessage && (
            <Card className={`${currentStatusMessage.color} border`}>
              <div className="flex items-start gap-3 mb-4">
                <Globe className={`w-6 h-6 ${currentStatusMessage.textColor}`} />
                <div>
                  <h4 className={`font-semibold ${currentStatusMessage.textColor}`}>
                    {currentStatusMessage.title}
                  </h4>
                  <p className={`text-sm mt-1 ${currentStatusMessage.textColor}`}>
                    {currentStatusMessage.description}
                  </p>
                </div>
              </div>
              <StatusBadge status={siteStatus.status} type="site" />
            </Card>
          )}

          {/* Domínio */}
          {domain && (
            <Card>
              <h4 className="font-semibold text-dark mb-3">Domínio</h4>
              <p className="text-sm text-gray-600 mb-2">{domain.domain}</p>
              <StatusBadge status={domain.status} type="domain" />
              
              {domain.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">{domain.notes}</p>
                </div>
              )}
            </Card>
          )}

          {/* Notas */}
          {siteStatus?.notes && (
            <Card>
              <h4 className="font-semibold text-dark mb-3">Notas da Equipe</h4>
              <p className="text-sm text-gray-600">{siteStatus.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Próximos Passos */}
      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-dark mb-2">Próximos Passos</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {siteStatus?.status === SiteStatus.WAITING_BRIEFING && (
                <>
                  <li>✓ Preencha o briefing com informações sobre seu negócio</li>
                  <li>✓ Aguarde o contato da nossa equipe para esclarecimentos</li>
                  <li>✓ Acompanhe o desenvolvimento por esta página</li>
                </>
              )}
              {siteStatus?.status === SiteStatus.IN_PRODUCTION && (
                <>
                  <li>✓ Nossa equipe está trabalhando no design e desenvolvimento</li>
                  <li>✓ Em breve você receberá um link para visualizar o progresso</li>
                  <li>✓ Fique atento ao seu e-mail para atualizações</li>
                </>
              )}
              {siteStatus?.status === SiteStatus.UNDER_APPROVAL && (
                <>
                  <li>✓ Acesse o link de pré-visualização enviado por e-mail</li>
                  <li>✓ Revise todo o conteúdo e funcionalidades</li>
                  <li>✓ Envie seu feedback através do suporte</li>
                </>
              )}
              {siteStatus?.status === SiteStatus.PUBLISHED && (
                <>
                  <li>✓ Seu site está acessível no domínio configurado</li>
                  <li>✓ Compartilhe com seus clientes e nas redes sociais</li>
                  <li>✓ Solicite suporte para qualquer ajuste necessário</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

