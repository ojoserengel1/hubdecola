/**
 * Tipos compartilhados entre frontend e backend
 * DecolaWeb Hub - Área do Cliente
 */

// ==================== ENUMS ====================

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export enum SubscriptionStatus {
  ACTIVE = 'ativa',
  PENDING = 'pendente',
  CANCELED = 'cancelada',
}

export enum InvoiceStatus {
  PAID = 'pago',
  PENDING = 'pendente',
  OVERDUE = 'atrasado',
  CANCELED = 'cancelado',
}

export enum BriefingStatus {
  NOT_SENT = 'nao_enviado',
  SENT = 'enviado',
  UNDER_REVIEW = 'em_analise',
  APPROVED = 'aprovado',
}

export enum SiteStatus {
  WAITING_BRIEFING = 'aguardando_briefing',
  IN_PRODUCTION = 'em_producao',
  UNDER_APPROVAL = 'em_aprovacao',
  PUBLISHED = 'site_publicado',
}

export enum EmailStatus {
  ACTIVE = 'ativo',
  PENDING = 'pendente',
  CANCELED = 'cancelado',
}

export enum DomainStatus {
  WAITING_DNS = 'aguardando_dns',
  CONFIGURING = 'configurando',
  ACTIVE = 'ativo',
}

export enum TicketStatus {
  OPEN = 'aberto',
  IN_PROGRESS = 'em_andamento',
  ANSWERED = 'respondido',
  CLOSED = 'fechado',
}

export enum TicketPriority {
  LOW = 'baixa',
  MEDIUM = 'media',
  HIGH = 'alta',
}

export enum MessageSenderType {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export enum PipelineStage {
  WAITING_BRIEFING = 'aguardando_briefing',
  COPY = 'copy',
  DESIGN = 'design',
  WEB = 'web',
  INFRASTRUCTURE = 'infraestrutura',
  DOMAIN = 'dominio',
}

export enum ContractStatus {
  PENDING = 'pendente',
  SIGNED = 'assinado',
}

// ==================== INTERFACES ====================

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  company_name: string;
  whatsapp: string;
  stripe_customer_id?: string;
  plan_id?: string;
  created_at: string;
  email?: string;
}

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  description: string;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string;
  renews_at: string;
  payment_method: string;
  created_at: string;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: InvoiceStatus;
  payment_link?: string;
}

export interface Briefing {
  id: string;
  user_id: string;
  status: BriefingStatus;
  // Dados da Empresa
  company_name?: string;
  segment?: string;
  full_name?: string;
  commercial_email?: string;
  whatsapp_commercial?: string;
  landline?: string;
  address?: string;
  // Presença Digital
  has_website?: boolean;
  current_website_url?: string;
  company_description?: string;
  target_audience?: string;
  service_region?: string;
  main_services?: string;
  differentials?: string;
  business_hours?: string;
  social_links?: string;
  // Identidade Visual
  has_brand_identity?: boolean;
  brand_assets_links?: string;
  main_colors?: string;
  forbidden_colors?: string;
  // Observações
  general_notes?: string;
  // Legacy (manter compatibilidade)
  answers?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SiteStatusData {
  id: string;
  user_id: string;
  status: SiteStatus;
  updated_at: string;
  notes?: string;
}

export interface EmailProfessional {
  id: string;
  user_id: string;
  email: string;
  status: EmailStatus;
  created_at: string;
}

export interface Domain {
  id: string;
  user_id: string;
  domain: string;
  status: DomainStatus;
  notes?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  priority: TicketPriority;
  user?: Profile;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: MessageSenderType;
  message: string;
  created_at: string;
}

export interface ProductionPipeline {
  id: string;
  user_id: string;
  stage: PipelineStage;
  updated_at: string;
  notes?: string;
  user?: Profile;
}

export interface Contract {
  id: string;
  user_id: string;
  status: ContractStatus;
  sent_at?: string;
  signed_at?: string;
  contract_url?: string;
  created_at: string;
}

// ==================== DTOs ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Profile;
  token: string;
}

export interface DashboardData {
  profile: Profile;
  subscription?: Subscription;
  siteStatus?: SiteStatusData;
  recentInvoices: Invoice[];
  briefing?: Briefing;
  emails: EmailProfessional[];
  domain?: Domain;
  contract?: Contract;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
}

export interface CreateMessageRequest {
  ticket_id: string;
  message: string;
}

export interface UpdateBriefingRequest {
  // Dados da Empresa
  company_name?: string;
  segment?: string;
  full_name?: string;
  commercial_email?: string;
  whatsapp_commercial?: string;
  landline?: string;
  address?: string;
  // Presença Digital
  has_website?: boolean;
  current_website_url?: string;
  company_description?: string;
  target_audience?: string;
  service_region?: string;
  main_services?: string;
  differentials?: string;
  business_hours?: string;
  social_links?: string;
  // Identidade Visual
  has_brand_identity?: boolean;
  brand_assets_links?: string;
  main_colors?: string;
  forbidden_colors?: string;
  // Observações
  general_notes?: string;
}

export interface UpdateSiteStatusRequest {
  status: SiteStatus;
  notes?: string;
}

export interface UpdatePipelineRequest {
  stage: PipelineStage;
  notes?: string;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

