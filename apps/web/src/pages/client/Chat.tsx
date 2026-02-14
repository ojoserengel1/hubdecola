import { useState, useEffect } from 'react';
import { PageHeader, Card, Loading } from '@/components/ui';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useQuery } from '@tanstack/react-query';
import { getChatConversations } from '@/lib/api';
import type { ChatConversation } from '@decolaweb/shared';

export function Chat() {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: getChatConversations,
  });

  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      setConversation(data.data[0]);
    }
  }, [data]);

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Chat com Suporte"
        subtitle="Entre em contato com nossa equipe"
      />

      <div className="max-w-4xl mx-auto">
        {conversation ? (
          <Card padding="none" className="h-[calc(100vh-250px)] flex flex-col">
            <ChatWindow conversation={conversation} isClientView={true} />
          </Card>
        ) : (
          <Card className="h-[calc(100vh-250px)] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">Carregando conversa...</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

