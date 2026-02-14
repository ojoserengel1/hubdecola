import { supabase } from '@/config/supabase';
import type {
  DashboardData,
  Invoice,
  SiteStatusData,
  SupportTicket,
  SupportMessage,
  Briefing,
  CreateTicketRequest,
  CreateMessageRequest,
  UpdateBriefingRequest,
  ApiResponse,
} from '@decolaweb/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Função auxiliar para fazer requisições autenticadas
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Obter sessão atual e renovar se necessário
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('Sessão não encontrada. Por favor, faça login novamente.');
  }
  
  const token = session.access_token;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Se for erro 401, tentar renovar a sessão
    if (response.status === 401) {
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !newSession) {
        // Sessão realmente expirada, redirecionar para login
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      
      // Tentar novamente com o novo token
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newSession.access_token}`,
          ...options.headers,
        },
      });
      
      if (!retryResponse.ok) {
        const retryErrorData = await retryResponse.json().catch(() => ({}));
        throw new Error(retryErrorData.error || 'Erro ao fazer requisição');
      }
      
      return retryResponse.json();
    }
    
    // Para erros 404, retornar o objeto de erro completo para que o componente possa tratá-lo
    if (response.status === 404) {
      return {
        success: false,
        error: errorData.error || 'Recurso não encontrado',
        data: null,
      } as ApiResponse<T>;
    }
    
    throw new Error(errorData.error || 'Erro ao fazer requisição');
  }

  return response.json();
}

// ==================== AUTH ====================

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getMe() {
  return fetchAPI('/auth/me');
}

// ==================== DASHBOARD ====================

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  return fetchAPI<DashboardData>('/dashboard');
}

export async function initializeDashboard(): Promise<ApiResponse<any>> {
  return fetchAPI<any>('/dashboard/initialize', {
    method: 'POST',
  });
}

// ==================== BRIEFING ====================

export async function getBriefing(): Promise<ApiResponse<Briefing>> {
  return fetchAPI<Briefing>('/briefing');
}

export async function submitBriefing(
  data: UpdateBriefingRequest
): Promise<ApiResponse<Briefing>> {
  return fetchAPI<Briefing>('/briefing', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== INVOICES ====================

export async function getInvoices(): Promise<ApiResponse<Invoice[]>> {
  return fetchAPI<Invoice[]>('/invoices');
}

export async function getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
  return fetchAPI<Invoice>(`/invoices/${id}`);
}

// ==================== SITE STATUS ====================

export async function getSiteStatus(): Promise<ApiResponse<SiteStatusData>> {
  return fetchAPI<SiteStatusData>('/site-status');
}

// ==================== DOMAIN ====================

export async function requestDomain(data: {
  has_domain: 'sim' | 'nao';
  domain?: string;
  platform?: string;
  login?: string;
  password?: string;
  domain_options?: string;
}): Promise<ApiResponse<any>> {
  return fetchAPI<any>('/domain/request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== TICKETS ====================

export async function getTickets(): Promise<ApiResponse<SupportTicket[]>> {
  return fetchAPI<SupportTicket[]>('/tickets');
}

export async function getTicketById(id: string): Promise<ApiResponse<SupportTicket>> {
  return fetchAPI<SupportTicket>(`/tickets/${id}`);
}

export async function createTicket(
  data: CreateTicketRequest
): Promise<ApiResponse<SupportTicket>> {
  return fetchAPI<SupportTicket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTicketMessages(
  ticketId: string
): Promise<ApiResponse<SupportMessage[]>> {
  return fetchAPI<SupportMessage[]>(`/tickets/${ticketId}/messages`);
}

export async function sendTicketMessage(
  data: CreateMessageRequest
): Promise<ApiResponse<SupportMessage>> {
  return fetchAPI<SupportMessage>(`/tickets/${data.ticket_id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message: data.message }),
  });
}

// ==================== ADMIN ====================

export async function getAdminClients() {
  return fetchAPI('/admin/clients');
}

export async function getAdminClientById(id: string) {
  return fetchAPI(`/admin/clients/${id}`);
}

export interface CreateClientRequest {
  email: string;
  password: string;
  name: string;
  company_name: string;
  whatsapp?: string;
  plan_id?: string;
}

export async function createClient(data: CreateClientRequest) {
  return fetchAPI('/admin/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(clientId: string) {
  return fetchAPI(`/admin/clients/${clientId}`, {
    method: 'DELETE',
  });
}

export interface UpdateClientRequest {
  name?: string;
  company_name?: string;
  email?: string;
  whatsapp?: string;
}

export async function updateClient(clientId: string, data: UpdateClientRequest) {
  return fetchAPI(`/admin/clients/${clientId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateClientSiteStatus(clientId: string, data: any) {
  return fetchAPI(`/admin/clients/${clientId}/site-status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAdminPipeline() {
  return fetchAPI('/admin/pipeline');
}

export async function updatePipeline(userId: string, data: any) {
  return fetchAPI(`/admin/pipeline/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAdminTickets(filters?: { status?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/admin/tickets${query}`);
}

export async function getAdminTicketById(id: string): Promise<ApiResponse<SupportTicket>> {
  return fetchAPI<SupportTicket>(`/admin/tickets/${id}`);
}

export async function getAdminTicketMessages(
  ticketId: string
): Promise<ApiResponse<SupportMessage[]>> {
  return fetchAPI<SupportMessage[]>(`/admin/tickets/${ticketId}/messages`);
}

export async function sendAdminTicketMessage(ticketId: string, message: string) {
  return fetchAPI(`/admin/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function updateAdminTicketStatus(
  ticketId: string,
  status: string
): Promise<ApiResponse<SupportTicket>> {
  return fetchAPI(`/admin/tickets/${ticketId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminFinanceiro() {
  return fetchAPI('/admin/financeiro');
}

// ==================== PIPELINE STAGES ====================

export async function getPipelineStages() {
  return fetchAPI('/admin/pipeline/stages');
}

export async function createPipelineStage(data: { name: string; slug: string; color?: string }) {
  return fetchAPI('/admin/pipeline/stages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePipelineStage(id: string, data: { name?: string; slug?: string; color?: string; is_active?: boolean }) {
  return fetchAPI(`/admin/pipeline/stages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function reorderPipelineStages(stages: Array<{ id: string; display_order: number }>) {
  return fetchAPI('/admin/pipeline/stages/reorder', {
    method: 'PUT',
    body: JSON.stringify({ stages }),
  });
}

export async function deletePipelineStage(id: string) {
  return fetchAPI(`/admin/pipeline/stages/${id}`, {
    method: 'DELETE',
  });
}

// ==================== CHAT ====================

export async function getChatConversations() {
  return fetchAPI('/chat/conversations');
}

export async function getChatMessages(conversationId: string) {
  return fetchAPI(`/chat/conversations/${conversationId}/messages`);
}

export async function sendChatMessage(conversationId: string, message: string) {
  return fetchAPI('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId, message }),
  });
}

export async function markChatMessagesAsRead(conversationId: string, messageIds?: string[]) {
  return fetchAPI(`/chat/conversations/${conversationId}/read`, {
    method: 'PUT',
    body: JSON.stringify({ message_ids: messageIds }),
  });
}

// ==================== EMAILS ====================

export async function requestEmail(email: string) {
  return fetchAPI('/emails/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function updateEmailStatus(emailId: string, status: string, notes?: string, access_url?: string, password_plain?: string) {
  return fetchAPI(`/emails/${emailId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes, access_url, password_plain }),
  });
}

// ==================== DOMAIN ====================

export async function updateDomainStatus(clientId: string, status: string, domain?: string) {
  return fetchAPI(`/admin/clients/${clientId}/domain/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, domain }),
  });
}

export async function getAdminEmails() {
  return fetchAPI('/admin/emails');
}

// ==================== SITE STATUS TEMPLATES ====================

export async function getSiteStatusTemplates() {
  return fetchAPI('/admin/site-status-templates');
}

export async function createSiteStatusTemplate(data: any) {
  return fetchAPI('/admin/site-status-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSiteStatusTemplate(id: string, data: any) {
  return fetchAPI(`/admin/site-status-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function reorderSiteStatusTemplates(templates: Array<{ id: string; display_order: number }>) {
  return fetchAPI('/admin/site-status-templates/reorder', {
    method: 'PUT',
    body: JSON.stringify({ templates }),
  });
}

export async function deleteSiteStatusTemplate(id: string) {
  return fetchAPI(`/admin/site-status-templates/${id}`, {
    method: 'DELETE',
  });
}

// ==================== PLANS ====================

export async function getPlans() {
  return fetchAPI('/admin/plans');
}

export async function getPlanById(id: string) {
  return fetchAPI(`/admin/plans/${id}`);
}

export async function createPlan(data: any) {
  return fetchAPI('/admin/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePlan(id: string, data: any) {
  return fetchAPI(`/admin/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePlan(id: string) {
  return fetchAPI(`/admin/plans/${id}`, {
    method: 'DELETE',
  });
}

