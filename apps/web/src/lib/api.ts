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
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

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

export async function getAdminTickets(filters?: { status?: string; priority?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/admin/tickets${query}`);
}

export async function sendAdminTicketMessage(ticketId: string, message: string) {
  return fetchAPI(`/admin/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
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

