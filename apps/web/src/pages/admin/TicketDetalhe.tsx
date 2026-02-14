import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAdminTicketById, 
  getAdminTicketMessages, 
  sendAdminTicketMessage,
  updateAdminTicketStatus
} from '@/lib/api';
import {
  Card,
  PageHeader,
  Loading,
  Button,
  Textarea,
  StatusBadge,
  Select,
} from '@/components/ui';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { SupportTicket, SupportMessage, MessageSenderType, TicketStatus } from '@decolaweb/shared';

export function TicketDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');

  // Buscar ticket
  const { data: ticketData, isLoading: isLoadingTicket, error: ticketError } = useQuery({
    queryKey: ['admin-ticket', id],
    queryFn: () => getAdminTicketById(id!),
    enabled: !!id,
    retry: false, // Não tentar novamente se falhar
  });

  // Buscar mensagens
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['admin-ticket-messages', id],
    queryFn: () => getAdminTicketMessages(id!),
    enabled: !!id,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) =>
      sendAdminTicketMessage(id!, messageText),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-messages', id] });
    },
  });

  // Atualizar status do ticket
  const updateStatusMutation = useMutation({
    mutationFn: (status: TicketStatus) =>
      updateAdminTicketStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      // Feedback visual será mostrado através do StatusBadge atualizado
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do ticket. Tente novamente.');
    },
  });

  const ticket = ticketData?.data;
  const messages = messagesData?.data || [];

  // Debug: log dos dados recebidos
  useEffect(() => {
    if (ticketData) {
      console.log('📊 [TICKET DETAIL] Ticket data:', ticketData);
      console.log('📊 [TICKET DETAIL] User data:', (ticketData.data as any)?.user);
      console.log('📊 [TICKET DETAIL] User ID:', (ticketData.data as any)?.user_id);
      console.log('📊 [TICKET DETAIL] Company Name:', (ticketData.data as any)?.user?.company_name);
      console.log('📊 [TICKET DETAIL] User Name:', (ticketData.data as any)?.user?.name);
    }
    if (ticketError) {
      console.error('❌ [TICKET DETAIL] Erro:', ticketError);
    }
  }, [ticketData, ticketError]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate(message);
  };

  if (isLoadingTicket) return <Loading />;

  // Verifica se houve erro na busca
  if (ticketError || (ticketData && !ticketData.success)) {
    const errorMessage = ticketError?.message || ticketData?.error || 'O ticket solicitado não foi encontrado.';
    console.error('Erro ao buscar ticket:', ticketError || ticketData);
    
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/tickets')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PageHeader title="Ticket não encontrado" />
        </div>
        <Card>
          <p className="text-gray-500 mb-4">{errorMessage}</p>
          <p className="text-sm text-gray-400 mb-4">ID do ticket: {id}</p>
          <Button onClick={() => navigate('/admin/tickets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Tickets
          </Button>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/tickets')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PageHeader title="Ticket não encontrado" />
        </div>
        <Card>
          <p className="text-gray-500 mb-4">O ticket solicitado não foi encontrado.</p>
          <p className="text-sm text-gray-400 mb-4">ID do ticket: {id}</p>
          <Button onClick={() => navigate('/admin/tickets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Tickets
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/tickets')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title={`Ticket: ${ticket.subject}`}
          subtitle={
            <div className="flex items-center gap-2">
              <span>Cliente:</span>
              {(ticket as any).user?.id || (ticket as any).user_id ? (
                <button
                  onClick={() => navigate(`/admin/clientes/${(ticket as any).user?.id || (ticket as any).user_id}`)}
                  className="text-primary hover:underline font-semibold"
                >
                  {((ticket as any).user?.company_name && (ticket as any).user.company_name.trim()) 
                    ? (ticket as any).user.company_name 
                    : (ticket as any).user?.name || `Cliente (ID: ${((ticket as any).user?.id || (ticket as any).user_id)?.substring(0, 8)}...)`}
                </button>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
              <span>|</span>
              <span>Status: {ticket.status}</span>
            </div>
          }
        />
      </div>

      {/* Informações do Ticket */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-dark mb-2">{ticket.subject}</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <StatusBadge status={ticket.status} type="ticket" />
              <div className="w-48">
                <Select
                  label="Alterar Status"
                  value={ticket.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as TicketStatus;
                    updateStatusMutation.mutate(newStatus);
                  }}
                  disabled={updateStatusMutation.isPending}
                  options={[
                    { value: TicketStatus.OPEN, label: 'Aberto' },
                    { value: TicketStatus.IN_PROGRESS, label: 'Em Andamento' },
                    { value: TicketStatus.ANSWERED, label: 'Respondido' },
                    { value: TicketStatus.CLOSED, label: 'Fechado' },
                  ]}
                />
              </div>
            </div>
          </div>

          {ticket.attachment_url && (
            <div className="pt-4 border-t">
              <a
                href={ticket.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Paperclip className="w-4 h-4" />
                Ver anexo
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t text-sm">
            <div>
              <span className="text-gray-500">Cliente:</span>
              {(ticket as any).user?.id || (ticket as any).user_id ? (
                <button
                  onClick={() => navigate(`/admin/clientes/${(ticket as any).user?.id || (ticket as any).user_id}`)}
                  className="block font-semibold text-primary hover:underline text-left"
                >
                  {((ticket as any).user?.company_name && (ticket as any).user.company_name.trim()) 
                    ? (ticket as any).user.company_name 
                    : (ticket as any).user?.name || `Cliente (ID: ${((ticket as any).user?.id || (ticket as any).user_id)?.substring(0, 8)}...)`}
                </button>
              ) : (
                <p className="font-semibold text-gray-400">N/A</p>
              )}
              {(ticket as any).user?.company_name && (
                <p className="text-xs text-gray-500">{(ticket as any).user.company_name}</p>
              )}
              {(ticket as any).user?.email && (
                <p className="text-xs text-gray-500">{(ticket as any).user.email}</p>
              )}
            </div>
            <div>
              <span className="text-gray-500">Prioridade:</span>
              <span className="ml-2 font-semibold capitalize">{ticket.priority}</span>
            </div>
            <div>
              <span className="text-gray-500">Criado em:</span>
              <span className="ml-2">
                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Atualizado em:</span>
              <span className="ml-2">
                {ticket.updated_at
                  ? new Date(ticket.updated_at).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Chat */}
      <Card>
        <h3 className="text-lg font-semibold text-dark mb-4">Conversa</h3>

        {/* Mensagens */}
        <div className="space-y-4 mb-6 min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
          {isLoadingMessages ? (
            <Loading />
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma mensagem ainda. Seja o primeiro a comentar!
            </p>
          ) : (
            messages.map((msg: SupportMessage) => {
              const isAdmin = msg.sender_type === MessageSenderType.ADMIN;
              const isOwnMessage = isAdmin; // Admin sempre vê suas próprias mensagens

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {isAdmin ? 'Admin' : 'Cliente'} •{' '}
                      {new Date(msg.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulário de Mensagem */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua resposta..."
            rows={3}
            disabled={sendMessageMutation.isPending}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={sendMessageMutation.isPending}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Resposta
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

