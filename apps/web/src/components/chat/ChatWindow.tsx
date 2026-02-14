import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, sendChatMessage, markChatMessagesAsRead } from '@/lib/api';
import { Card, Button, Loading } from '@/components/ui';
import { Send, User } from 'lucide-react';
import type { ChatMessage, ChatConversation } from '@decolaweb/shared';
import { useAuthStore } from '@/store/authStore';

interface ChatWindowProps {
  conversation: ChatConversation;
  onClientInfoClick?: () => void;
  isClientView?: boolean; // Se true, mostra "Suporte DecolaWeb" ao invés do nome do cliente
}

export function ChatWindow({ conversation, onClientInfoClick, isClientView = false }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: messagesData, isLoading, error: messagesError } = useQuery({
    queryKey: ['chat-messages', conversation.id],
    queryFn: () => getChatMessages(conversation.id),
    refetchInterval: 5000, // Atualiza a cada 5 segundos em background (silenciosamente)
    refetchOnWindowFocus: true,
    staleTime: 3000, // Considera os dados "frescos" por 3 segundos
    enabled: !!conversation?.id, // Só busca se tiver conversation.id válido
    // Mantém os dados anteriores enquanto carrega novos (evita loading ao trocar de conversa)
    placeholderData: (previousData) => previousData,
    retry: 2, // Tenta novamente em caso de erro
    // Não mostra loading durante refetch
    refetchIntervalInBackground: true,
  });

  const messages = messagesData?.data || [];
  
  // Só mostra loading se realmente não há dados E está carregando pela primeira vez
  // isLoading só é true na primeira carga, não durante refetch
  const showLoading = isLoading && !messagesData && !messagesError;

  const sendMutation = useMutation({
    mutationFn: (msg: string) => {
      if (!conversation?.id) {
        throw new Error('Conversa não encontrada');
      }
      return sendChatMessage(conversation.id, msg);
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (error: any) => {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => markChatMessagesAsRead(conversation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversation.id] });
    },
  });

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marca mensagens como lidas quando a conversa é aberta
  useEffect(() => {
    if (messages.length > 0 && user) {
      const isAdmin = user.role === 'admin';
      const unreadMessages = messages.filter(
        (msg: ChatMessage) => !msg.is_read && msg.sender_type !== (isAdmin ? 'admin' : 'client')
      );
      if (unreadMessages.length > 0) {
        markAsReadMutation.mutate();
      }
    }
  }, [conversation.id, messages.length, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation?.id) {
      alert('Erro: Conversa não encontrada');
      return;
    }
    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  };

  // Mostra loading apenas na primeira carga (quando não há dados), não durante refetch ou mudança de conversa
  // E só se realmente não tiver dados ainda E tiver conversation.id válido
  if (showLoading && conversation?.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
          <p className="text-sm text-gray-500">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  // Mostra erro se houver (apenas se não tiver dados)
  if (messagesError && !messagesData && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="text-sm">Erro ao carregar mensagens</p>
          <p className="text-xs mt-2">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div>
            {isClientView ? (
              <>
                <h3 className="font-semibold text-dark">Suporte DecolaWeb</h3>
                <p className="text-xs text-gray-500">Equipe de atendimento</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-dark">
                  {conversation.user?.name || conversation.user?.company_name || 'Cliente'}
                </h3>
                {conversation.user?.email && (
                  <p className="text-xs text-gray-500">{conversation.user.email}</p>
                )}
              </>
            )}
          </div>
        </div>
        {onClientInfoClick && !isClientView && (
          <Button variant="ghost" size="sm" onClick={onClientInfoClick}>
            Ver Informações
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm mt-2">Inicie a conversa enviando uma mensagem!</p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isOwnMessage = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.sender?.name || msg.sender?.company_name || 'Usuário'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={sendMutation.isPending || !conversation?.id}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!message.trim() || sendMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

