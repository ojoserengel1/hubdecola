import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api';
import { Card, PageHeader, Loading, Button } from '@/components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, TicketIcon, Globe } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteStatusTemplate, StatusButton } from '@decolaweb/shared';
import * as LucideIcons from 'lucide-react';

export function Dashboard() {
  // TODOS OS HOOKS DEVEM SER CHAMADOS ANTES DE QUALQUER EARLY RETURN
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  // Dados do dashboard
  const dashboardData = data?.data;
  const { siteStatus, statusTemplates } = dashboardData || {};

  // Early returns APÓS todos os hooks
  if (isLoading) return <Loading />;

  if (!dashboardData) {
    return (
      <div className="p-6">
        <PageHeader title="Dashboard" subtitle="Visão geral da sua conta DecolaWeb" />
        <Card>
          <p className="text-gray-500">Erro ao carregar dados. Tente recarregar a página.</p>
        </Card>
      </div>
    );
  }

  // Função auxiliar para renderizar ícone dinamicamente
  const renderIcon = (iconName?: string, defaultIcon: any = Globe) => {
    if (!iconName) return defaultIcon;
    const IconComponent = (LucideIcons as any)[iconName] || defaultIcon;
    return IconComponent;
  };

  // Renderiza o banner de status baseado no template personalizado
  const renderStatusBanner = () => {
    const statusSlug = siteStatus?.status || 'aguardando_preenchimento';
    
    // Busca o template correspondente ao status atual
    const template = statusTemplates?.find((t: SiteStatusTemplate) => t.slug === statusSlug);
    
    // Se não encontrou template, usa fallback padrão
    if (!template) {
      return (
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-black text-dark mb-2">Status do Seu Site</h3>
              <p className="text-gray-700">Status não configurado</p>
            </div>
            <Globe className="w-16 h-16 text-gray-400 opacity-50" />
          </div>
        </Card>
      );
    }

    // Esquemas de cores
    const colorSchemes = {
      gray: {
        bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-800',
        textBold: 'text-gray-900',
        icon: 'text-gray-400',
      },
      blue: {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-800',
        textBold: 'text-blue-900',
        icon: 'text-blue-400',
      },
      yellow: {
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-100',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        textBold: 'text-yellow-900',
        icon: 'text-yellow-400',
      },
      green: {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-100',
        border: 'border-green-300',
        text: 'text-green-800',
        textBold: 'text-green-900',
        icon: 'text-green-400',
      },
      red: {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        border: 'border-red-300',
        text: 'text-red-800',
        textBold: 'text-red-900',
        icon: 'text-red-400',
      },
      purple: {
        bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
        border: 'border-purple-300',
        text: 'text-purple-800',
        textBold: 'text-purple-900',
        icon: 'text-purple-400',
      },
    };

    const colors = colorSchemes[template.color_scheme] || colorSchemes.gray;
    const DefaultIcon = renderIcon(template.buttons?.[0]?.icon, Globe);

    // Renderiza botões
    const renderButton = (button: StatusButton, index: number) => {
      const IconComponent = renderIcon(button.icon);
      
      const handleClick = () => {
        if (button.action === 'navigate' && button.url) {
          navigate(button.url);
        } else if (button.action === 'approve') {
          toast.success('Aprovação enviada! Nossa equipe receberá sua confirmação.');
        } else if (button.action === 'custom' && button.onClick) {
          // Para ações customizadas, pode-se implementar lógica específica
          toast.info('Ação customizada');
        }
      };

      // Define classes CSS baseadas na variante
      let buttonClassName = '';
      if (button.variant === 'primary') {
        buttonClassName = 'bg-green-600 hover:bg-green-700 text-white';
      } else if (button.variant === 'secondary') {
        buttonClassName = 'bg-gray-600 hover:bg-gray-700 text-white';
      } else if (button.variant === 'outline') {
        buttonClassName = `border-2 ${colors.border} ${colors.textBold} hover:${colors.bg.replace('bg-', 'bg-')}`;
      } else if (button.variant === 'ghost') {
        buttonClassName = `${colors.text} hover:${colors.bg.replace('bg-', 'bg-')}`;
      } else {
        buttonClassName = 'bg-green-600 hover:bg-green-700 text-white';
      }

      return (
        <Button
          key={index}
          onClick={handleClick}
          variant={button.variant === 'outline' || button.variant === 'ghost' ? 'outline' : 'primary'}
          className={buttonClassName}
        >
          {button.icon && <IconComponent className="w-4 h-4 mr-2" />}
          {button.label}
        </Button>
      );
    };

    return (
      <Card className={`${colors.bg} border-2 ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={`text-xl font-black ${colors.textBold} mb-2`}>{template.headline}</h3>
            {template.subheadline && (
              <p className={`${colors.textBold} font-semibold mb-4`}>
                {template.subheadline}
              </p>
            )}
            {siteStatus?.preview_url && statusSlug === 'em_aprovacao' && (
              <p className={`text-sm ${colors.text} mb-3`}>
                Acesse o link do seu site: <a href={siteStatus.preview_url} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:${colors.textBold}">{siteStatus.preview_url}</a>
              </p>
            )}
            {siteStatus?.live_url && statusSlug === 'site_publicado' && (
              <p className={`text-sm ${colors.text} mb-3`}>
                Seu site está no ar: <a href={siteStatus.live_url} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:${colors.textBold}">{siteStatus.live_url}</a>
              </p>
            )}
            {template.buttons && template.buttons.length > 0 && (
              <div className="flex gap-3 mt-4">
                {template.buttons.map((button, index) => renderButton(button, index))}
              </div>
            )}
          </div>
          <DefaultIcon className={`w-16 h-16 ${colors.icon} opacity-50`} />
        </div>
      </Card>
    );
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da sua conta DecolaWeb"
      />

      <div className="space-y-6">
        {/* Banner de Status do Site */}
        {renderStatusBanner()}

        {/* 2. Card: Precisa de ajuda? */}
        <Card hover className="bg-gradient-to-r from-primary to-red-700 text-white">
          <div>
            <h3 className="text-lg font-semibold mb-2">Precisa de ajuda?</h3>
            <p className="text-sm opacity-90 mb-4">
              Abra um ticket ou fale conosco pelo chat
            </p>
            <div className="flex gap-3">
              <Link to="/app/tickets" className="flex-1">
                <Button variant="secondary" size="md" className="w-full flex items-center justify-center">
                  <TicketIcon className="w-4 h-4 mr-2" />
                  Abrir Ticket
                </Button>
              </Link>
              <Link to="/app/chat" className="flex-1">
                <Button variant="secondary" size="md" className="w-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Falar no Chat
                </Button>
              </Link>
            </div>
          </div>
        </Card>


      </div>
    </div>
  );
}

