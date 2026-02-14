import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSiteStatus, getDashboardData } from '@/lib/api';
import { Card, PageHeader, Loading, Timeline, StatusBadge, Button } from '@/components/ui';
import { SiteStatus } from '@decolaweb/shared';
import { Globe, CheckCircle2, FileText } from 'lucide-react';

export function StatusSite() {
  const navigate = useNavigate();
  
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
  const briefing = dashboardData?.data?.briefing;
  const pipeline = dashboardData?.data?.pipeline;

  // Determina o status atual baseado no pipeline e briefing
  const getCurrentStatus = () => {
    // 1. Se não tem briefing ou briefing não enviado -> Aguardando Preenchimento do Briefing
    if (!briefing || briefing.status === 'nao_enviado') {
      return {
        status: 'aguardando_preenchimento',
        label: 'Aguardando Preenchimento do Briefing',
        description: 'Preencha o briefing para que possamos iniciar o desenvolvimento do seu site!',
        color: 'bg-gray-50 border-gray-200',
        textColor: 'text-gray-800',
      };
    }

    // 2. Se briefing enviado mas pipeline ainda em aguardando_briefing -> Briefing em análise
    if (briefing.status === 'enviado' && (!pipeline || pipeline.stage === 'aguardando_briefing')) {
      return {
        status: 'briefing_enviado',
        label: 'Briefing Enviado',
        description: 'Briefing em análise. Nossa equipe está revisando suas informações.',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800',
      };
    }

    // 3. Se pipeline stage = 'fazer_copy' -> Site em Produção
    if (pipeline?.stage === 'fazer_copy') {
      return {
        status: 'em_producao',
        label: 'Site em Produção',
        description: 'Nossa equipe está trabalhando no seu projeto. Em breve você receberá uma prévia!',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800',
      };
    }

    // 4. Se pipeline stage = 'enviar_site' -> Aguardando Aprovação
    if (pipeline?.stage === 'enviar_site') {
      return {
        status: 'em_aprovacao',
        label: 'Aguardando Aprovação',
        description: 'Seu site está pronto! Revise e nos envie seu feedback para ajustes finais.',
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-800',
      };
    }

    // 5. Se pipeline stage = 'site_aprovado' -> Site no Ar
    if (pipeline?.stage === 'site_aprovado') {
      return {
        status: 'site_publicado',
        label: 'Site no Ar',
        description: 'Parabéns! Seu site está no ar e acessível para todos. 🎉',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-800',
      };
    }

    // Fallback: usar status do site_status se não houver pipeline
    return {
      status: siteStatus?.status || 'aguardando_briefing',
      label: 'Aguardando Briefing',
      description: 'Preencha o briefing para que possamos iniciar o desenvolvimento do seu site!',
      color: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-800',
    };
  };

  const currentStatus = getCurrentStatus();
  const pipelineStage = pipeline?.stage || 'aguardando_briefing';
  const hasBriefingSent = briefing?.status === 'enviado' || briefing?.status === 'em_analise' || briefing?.status === 'aprovado';

  // Timeline completa com TODOS os 5 status
  const timelineSteps = [
    {
      label: 'Aguardando Preenchimento do Briefing',
      completed: hasBriefingSent,
      current: currentStatus.status === 'aguardando_preenchimento',
    },
    {
      label: 'Briefing Enviado',
      completed: hasBriefingSent && (pipelineStage !== 'aguardando_briefing' || currentStatus.status !== 'briefing_enviado'),
      current: currentStatus.status === 'briefing_enviado',
    },
    {
      label: 'Site em Produção',
      completed: pipelineStage === 'enviar_site' || pipelineStage === 'site_aprovado',
      current: currentStatus.status === 'em_producao',
    },
    {
      label: 'Aguardando Aprovação',
      completed: pipelineStage === 'site_aprovado',
      current: currentStatus.status === 'em_aprovacao',
    },
    {
      label: 'Site no Ar',
      completed: pipelineStage === 'site_aprovado',
      current: currentStatus.status === 'site_publicado',
    },
  ];


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
          {currentStatus && (
            <Card className={`${currentStatus.color} border`}>
              <div className="flex items-start gap-3 mb-4">
                <Globe className={`w-6 h-6 ${currentStatus.textColor}`} />
                <div className="flex-1">
                  <h4 className={`font-semibold ${currentStatus.textColor}`}>
                    {currentStatus.label}
                  </h4>
                  <p className={`text-sm mt-1 ${currentStatus.textColor}`}>
                    {currentStatus.description}
                  </p>
                </div>
              </div>
              
              {currentStatus.status === 'aguardando_preenchimento' && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/app/briefing')}
                  className="w-full mt-4 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Preencher Briefing
                </Button>
              )}
              
              {currentStatus.status !== 'aguardando_preenchimento' && (
                <StatusBadge status={currentStatus.status} type="site" />
              )}
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
              {currentStatus.status === 'aguardando_preenchimento' && (
                <>
                  <li>✓ Preencha o briefing com informações sobre seu negócio</li>
                  <li>✓ Aguarde o contato da nossa equipe para esclarecimentos</li>
                  <li>✓ Acompanhe o desenvolvimento por esta página</li>
                </>
              )}
              {currentStatus.status === 'briefing_enviado' && (
                <>
                  <li>✓ Nossa equipe está analisando seu briefing</li>
                  <li>✓ Em breve iniciaremos o desenvolvimento do seu site</li>
                  <li>✓ Fique atento ao seu e-mail para atualizações</li>
                </>
              )}
              {currentStatus.status === 'em_producao' && (
                <>
                  <li>✓ Nossa equipe está trabalhando no design e desenvolvimento</li>
                  <li>✓ Em breve você receberá um link para visualizar o progresso</li>
                  <li>✓ Fique atento ao seu e-mail para atualizações</li>
                </>
              )}
              {currentStatus.status === 'em_aprovacao' && (
                <>
                  <li>✓ Acesse o link de pré-visualização enviado por e-mail</li>
                  <li>✓ Revise todo o conteúdo e funcionalidades</li>
                  <li>✓ Envie seu feedback através do suporte</li>
                </>
              )}
              {currentStatus.status === 'site_publicado' && (
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

