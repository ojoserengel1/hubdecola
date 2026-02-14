import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChatConversations } from '@/lib/api';
import { Card, Loading, Badge } from '@/components/ui';
import { User, MessageSquare } from 'lucide-react';
import type { ChatConversation } from '@decolaweb/shared';

interface ChatListProps {
  onSelectConversation: (conversation: ChatConversation) => void;
  selectedConversationId?: string;
}

export function ChatList({ onSelectConversation, selectedConversationId }: ChatListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: getChatConversations,
    refetchInterval: 10000, // Atualiza a cada 10 segundos em background (silenciosamente)
    refetchOnWindowFocus: true,
    staleTime: 5000, // Considera os dados "frescos" por 5 segundos
    // Não mostra loading durante refetch
    refetchIntervalInBackground: true,
  });

  const conversations = data?.data || [];

  // Mostra loading apenas na primeira carga real (quando não há dados), não durante refetch
  if (isLoading && !data && conversations.length === 0) {
    return (
      <Card padding="md">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
          <p className="text-sm text-gray-500">Carregando clientes...</p>
        </div>
      </Card>
    );
  }

  // Mostra erro se houver
  if (error) {
    console.error('Erro ao carregar conversas:', error);
    return (
      <Card padding="md">
        <p className="text-center text-red-500 py-8">
          Erro ao carregar conversas. Tente recarregar a página.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <Card padding="md">
          <p className="text-center text-gray-500 py-8">Nenhum cliente encontrado</p>
        </Card>
      ) : (
        conversations.map((conversation: ChatConversation) => {
          const isSelected = conversation.id === selectedConversationId;
          const unreadCount = conversation.admin_unread_count || conversation.client_unread_count || 0;
          
          return (
            <Card
              key={conversation.id}
              padding="md"
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectConversation(conversation);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-dark truncate">
                      {conversation.user?.name || conversation.user?.company_name || 'Cliente'}
                    </h4>
                    {unreadCount > 0 && (
                      <Badge variant="error" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  {conversation.user?.email && (
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {conversation.user.email}
                    </p>
                  )}
                  {conversation.last_message && (
                    <div className="flex items-center gap-2 mt-1">
                      <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.last_message.message}
                      </p>
                    </div>
                  )}
                  {conversation.last_message_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.last_message_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

