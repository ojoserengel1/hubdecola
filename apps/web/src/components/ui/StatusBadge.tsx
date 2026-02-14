import { Badge } from './Badge';
import {
  SubscriptionStatus,
  InvoiceStatus,
  BriefingStatus,
  SiteStatus,
  TicketStatus,
  DomainStatus,
  EmailStatus,
} from '@decolaweb/shared';

interface StatusBadgeProps {
  status:
    | SubscriptionStatus
    | InvoiceStatus
    | BriefingStatus
    | SiteStatus
    | TicketStatus
    | DomainStatus
    | EmailStatus
    | string; // Aceita strings customizadas para status dinâmicos
  type:
    | 'subscription'
    | 'invoice'
    | 'briefing'
    | 'site'
    | 'ticket'
    | 'domain'
    | 'email';
}

const statusConfig = {
  subscription: {
    ativa: { label: 'Ativa', variant: 'success' as const },
    pendente: { label: 'Pendente', variant: 'warning' as const },
    cancelada: { label: 'Cancelada', variant: 'error' as const },
  },
  invoice: {
    pago: { label: 'Pago', variant: 'success' as const },
    pendente: { label: 'Pendente', variant: 'warning' as const },
    atrasado: { label: 'Atrasado', variant: 'error' as const },
    cancelado: { label: 'Cancelado', variant: 'default' as const },
  },
  briefing: {
    nao_enviado: { label: 'Não Enviado', variant: 'default' as const },
    enviado: { label: 'Enviado', variant: 'info' as const },
    em_analise: { label: 'Em Análise', variant: 'warning' as const },
    aprovado: { label: 'Aprovado', variant: 'success' as const },
  },
  site: {
    aguardando_briefing: { label: 'Aguardando Briefing', variant: 'default' as const },
    aguardando_preenchimento: { label: 'Aguardando Preenchimento', variant: 'default' as const },
    briefing_enviado: { label: 'Briefing Enviado', variant: 'info' as const },
    em_producao: { label: 'Em Produção', variant: 'info' as const },
    em_aprovacao: { label: 'Em Aprovação', variant: 'warning' as const },
    site_publicado: { label: 'Site no Ar', variant: 'success' as const },
  },
  ticket: {
    aberto: { label: 'Aberto', variant: 'error' as const },
    em_andamento: { label: 'Em Andamento', variant: 'warning' as const },
    respondido: { label: 'Respondido', variant: 'info' as const },
    fechado: { label: 'Fechado', variant: 'success' as const },
  },
  domain: {
    pendente: { label: 'Pendente', variant: 'warning' as const },
    aguardando_dns: { label: 'Aguardando DNS', variant: 'warning' as const },
    configurando: { label: 'Configurando', variant: 'info' as const },
    ativo: { label: 'Ativo', variant: 'success' as const },
  },
  email: {
    ativo: { label: 'Ativo', variant: 'success' as const },
    pendente: { label: 'Pendente', variant: 'warning' as const },
    cancelado: { label: 'Cancelado', variant: 'error' as const },
  },
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]];

  if (!config) {
    return <Badge>{status}</Badge>;
  }

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

