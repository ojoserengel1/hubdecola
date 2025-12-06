import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTickets, createTicket } from '@/lib/api';
import {
  Card,
  PageHeader,
  Loading,
  Button,
  Input,
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
import { MessageCircle, Mail, Plus, ExternalLink } from 'lucide-react';
import { TicketPriority } from '@decolaweb/shared';

export function Suporte() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'media' as TicketPriority,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsModalOpen(false);
      setFormData({
        subject: '',
        description: '',
        priority: 'media' as TicketPriority,
      });
      alert('Ticket criado com sucesso!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const faqs = [
    {
      question: 'Como funciona o plano de R$ 99,90/mês?',
      answer:
        'Nosso plano inclui criação completa do site, hospedagem, domínio, certificado SSL, e-mails profissionais e suporte contínuo. Você paga uma mensalidade fixa e nós cuidamos de tudo!',
    },
    {
      question: 'Quanto tempo leva para meu site ficar pronto?',
      answer:
        'O prazo médio é de 7 a 15 dias após o envio do briefing completo. Dependendo da complexidade e da rapidez nas aprovações, pode ser até mais rápido!',
    },
    {
      question: 'Posso usar meu próprio domínio?',
      answer:
        'Sim! Se você já tem um domínio registrado, podemos configurá-lo para apontar para seu site. Se não tiver, nós registramos um para você sem custo adicional.',
    },
    {
      question: 'Posso solicitar alterações no site?',
      answer:
        'Sim! Você pode solicitar alterações através do suporte. Pequenas alterações de texto e imagens são gratuitas. Mudanças estruturais podem ter custo adicional.',
    },
    {
      question: 'Como cancelo minha assinatura?',
      answer:
        'Você pode cancelar a qualquer momento através do suporte. O cancelamento será efetivado ao final do período já pago, sem multas ou taxas.',
    },
    {
      question: 'O que está incluído na hospedagem?',
      answer:
        'A hospedagem inclui servidor otimizado, certificado SSL (HTTPS), backups automáticos, proteção contra ataques e suporte técnico especializado.',
    },
  ];

  if (isLoading) return <Loading />;

  const tickets = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Suporte"
        subtitle="Estamos aqui para ajudar você"
      />

      {/* Cards de Contato Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card hover className="bg-green-50 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark mb-1">WhatsApp</h3>
              <p className="text-sm text-gray-600 mb-3">
                Fale diretamente com nossa equipe
              </p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="w-full">
                  Abrir WhatsApp
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark mb-1">E-mail</h3>
              <p className="text-sm text-gray-600 mb-1">suporte@decolaweb.com.br</p>
              <a href="mailto:suporte@decolaweb.com.br">
                <Button size="sm" variant="ghost" className="w-full">
                  Enviar E-mail
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-dark mb-4">
          Perguntas Frequentes
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full px-4 py-3 text-left font-semibold text-dark hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                {faq.question}
                <span className="text-primary">
                  {expandedFAQ === index ? '−' : '+'}
                </span>
              </button>
              {expandedFAQ === index && (
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

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
              <TableHead>Assunto</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {ticket.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{ticket.priority}</span>
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
          <Input
            label="Assunto"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            placeholder="Descreva brevemente o problema"
          />

          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={5}
            placeholder="Descreva em detalhes o que você precisa..."
          />

          <Select
            label="Prioridade"
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as TicketPriority })
            }
            options={[
              { value: 'baixa', label: 'Baixa' },
              { value: 'media', label: 'Média' },
              { value: 'alta', label: 'Alta' },
            ]}
          />

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
              isLoading={mutation.isPending}
              disabled={mutation.isPending}
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

