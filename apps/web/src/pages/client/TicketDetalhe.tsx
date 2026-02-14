import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTicketById, 
  getTicketMessages, 
  sendTicketMessage 
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  Card,
  PageHeader,
  Loading,
  Button,
  Textarea,
  StatusBadge,
} from '@/components/ui';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { SupportTicket, SupportMessage, MessageSenderType } from '@decolaweb/shared';

export function TicketDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();

  // Buscar ticket
  const { data: ticketData, isLoading: isLoadingTicket } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicketById(id!),
    enabled: !!id,
  });

  // Buscar mensagens
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['ticket-messages', id],
    queryFn: () => getTicketMessages(id!),
    enabled: !!id,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) =>
      sendTicketMessage({
        ticket_id: id!,
        message: messageText,
      }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', id] });
    },
  });

  const ticket = ticketData?.data;
  const messages = messagesData?.data || [];

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

  if (!ticket) {
    return (
      <div>
        <PageHeader title="Ticket não encontrado" />
        <Card>
          <p className="text-gray-500">O ticket solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/app/tickets')} className="mt-4">
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
          onClick={() => navigate('/app/tickets')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title={`Ticket: ${ticket.subject}`}
          subtitle={`Status: ${ticket.status} | Criado em ${new Date(ticket.created_at).toLocaleDateString('pt-BR')}`}
        />
      </div>

      {/* Informações do Ticket */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-dark mb-2">{ticket.subject}</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
            </div>
            <StatusBadge status={ticket.status} type="ticket" />
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

          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div>
              <span className="text-gray-500">Prioridade:</span>
              <span className="ml-2 font-semibold capitalize">{ticket.priority}</span>
            </div>
            <div>
              <span className="text-gray-500">Criado em:</span>
              <span className="ml-2">
                {new Date(ticket.created_at).toLocaleString('pt-BR')}
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
              const isClient = msg.sender_type === MessageSenderType.CLIENT;
              const isOwnMessage = isClient; // Cliente sempre vê suas próprias mensagens

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
            placeholder="Digite sua mensagem..."
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
              Enviar Mensagem
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


