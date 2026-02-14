import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getTickets } from '@/lib/api';
import { supabase } from '@/config/supabase';
import {
  Card,
  PageHeader,
  Loading,
  Button,
  Textarea,
  Select,
  StatusBadge,
  Modal,
  EmptyState,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui';
import { Plus } from 'lucide-react';

export function Suporte() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    subject: '', // Usado para armazenar a categoria
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const ticketCategories = [
    {
      value: 'Financeiro / Pagamentos',
      label: 'Financeiro / Pagamentos',
      description: 'Fatura em aberto, 2ª via, erro no pagamento, cobrança em duplicidade.',
    },
    {
      value: 'Plano / Assinatura / Contrato',
      label: 'Plano / Assinatura / Contrato',
      description: 'Dúvidas sobre o plano R$ 99,90, upgrades/downgrades, cancelamento, período de fidelidade, contrato para assinatura.',
    },
    {
      value: 'Briefing / Informações do Site',
      label: 'Briefing / Informações do Site',
      description: 'Problemas para enviar o briefing, ajustes nas informações enviadas, dúvidas sobre como preencher.',
    },
    {
      value: 'Site / Conteúdo / Ajustes',
      label: 'Site / Conteúdo / Ajustes',
      description: 'Mudanças de texto, inclusão/remoção de seções, fotos, portfólio, depoimentos, correção de erros no site.',
    },
    {
      value: 'E-mails Profissionais',
      label: 'E-mails Profissionais',
      description: 'Criação, alteração ou exclusão de contas, problemas de acesso, configuração em celular/computador.',
    },
    {
      value: 'Suporte Geral / Dúvidas',
      label: 'Suporte Geral / Dúvidas',
      description: 'Qualquer assunto que não se encaixe nas categorias anteriores, dúvidas gerais sobre o serviço.',
    },
    {
      value: 'Solicitação de Novos Serviços / Upgrades',
      label: 'Solicitação de Novos Serviços / Upgrades',
      description: 'Landing pages extras, páginas adicionais, integrações (Pixel, Google Analytics, etc.), serviços fora do escopo do plano.',
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: categoria é obrigatória
    if (!formData.subject || formData.subject === '') {
      alert('Por favor, selecione uma categoria para o ticket.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Criar FormData para enviar arquivo se houver
    const formDataToSend = new FormData();
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('priority', 'media');
    
    if (selectedFile) {
      formDataToSend.append('attachment', selectedFile);
    }
    
    // Usar fetch diretamente para enviar FormData
    try {
      // Obter token da sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Não definir Content-Type para FormData - o browser define automaticamente com boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Se for erro de autenticação, redireciona para login
        if (response.status === 401) {
          alert('Sessão expirada. Por favor, faça login novamente.');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(errorData.error || 'Erro ao criar ticket');
      }

      const result = await response.json();

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        setIsModalOpen(false);
        setFormData({
          subject: '',
          description: '',
        });
        setSelectedFile(null);
        alert('Ticket criado com sucesso!');
      } else {
        alert(result.error || 'Erro ao criar ticket');
      }
    } catch (error: any) {
      console.error('Erro ao criar ticket:', error);
      alert(error.message || 'Erro ao criar ticket. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;

  const tickets = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Tickets"
        subtitle="Gerencie seus tickets de suporte"
      />

      {/* Meus Tickets */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark">Meus Tickets</h3>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>

        {tickets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow 
                  key={ticket.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/app/tickets/${ticket.id}`)}
                >
                  <TableCell>
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {ticket.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} type="ticket" />
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Nenhum ticket aberto"
            description="Crie um ticket quando precisar de ajuda"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Abrir Primeiro Ticket
              </Button>
            }
          />
        )}
      </Card>

      {/* Modal: Novo Ticket */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Abrir Novo Ticket"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Categoria do Ticket"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            options={[
              { value: '', label: 'Escolha a categoria do seu ticket' },
              ...ticketCategories.map((cat) => ({
                value: cat.value,
                label: cat.label,
              })),
            ]}
          />
          
          {formData.subject && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                {ticketCategories.find((cat) => cat.value === formData.subject)?.description}
              </p>
            </div>
          )}

          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={5}
            placeholder="Descreva em detalhes o que você precisa..."
          />

          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Anexar Arquivo (Opcional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Se quiser, você pode adicionar um arquivo (imagem, PDF ou documento) que ajude a descrever melhor o problema.
            </p>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Arquivo selecionado: <span className="font-semibold">{selectedFile.name}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
            >
              Abrir Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

