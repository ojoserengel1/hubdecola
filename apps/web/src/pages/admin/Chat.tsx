import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card } from '@/components/ui';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import type { ChatConversation } from '@decolaweb/shared';

export function Chat() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const navigate = useNavigate();

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
  };

  const handleClientInfoClick = () => {
    if (selectedConversation?.user?.id) {
      navigate(`/admin/clientes/${selectedConversation.user.id}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Chat com Clientes"
        subtitle="Comunicação direta com seus clientes"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Lista de Conversas */}
        <div className="lg:col-span-1 overflow-y-auto">
          <ChatList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>

        {/* Janela de Chat */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card padding="none" className="h-full flex flex-col">
              <ChatWindow
                conversation={selectedConversation}
                onClientInfoClick={handleClientInfoClick}
              />
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[500px]">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">Selecione uma conversa</p>
                <p className="text-sm">Escolha um cliente na lista ao lado para iniciar o chat</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

