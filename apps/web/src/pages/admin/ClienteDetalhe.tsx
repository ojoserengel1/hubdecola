import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminClientById, getChatConversations, getChatMessages, sendChatMessage, markChatMessagesAsRead, updateDomainStatus, updateClientSiteStatus } from '@/lib/api';
import { Card, PageHeader, Loading, StatusBadge, Button, Badge, Input } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Calendar, Edit, FileText, Globe, AtSign, MessageSquare, CheckCircle, AlertCircle, Building2, Palette, Download, Send, User } from 'lucide-react';
import { EditClientModal } from '@/components/admin/EditClientModal';
import { BriefingReadOnly } from '@/components/admin/BriefingReadOnly';
import { exportBriefingToPDF } from '@/utils/exportBriefingPDF';
import { UpdateEmailStatusModal } from '@/components/admin/UpdateEmailStatusModal';
import { UpdateSiteStatusModal } from '@/components/admin/UpdateSiteStatusModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import type { ChatConversation, ChatMessage, EmailProfessional } from '@decolaweb/shared';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function ClienteDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resumo' | 'briefing' | 'pagamentos' | 'tickets' | 'contrato' | 'dominio' | 'emails' | 'chat'>('resumo');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmailStatusModalOpen, setIsEmailStatusModalOpen] = useState(false);
  const [isSiteStatusModalOpen, setIsSiteStatusModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailProfessional | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Estado para o domínio aprovado
  const [approvedDomain, setApprovedDomain] = useState('');

  // Mutation para atualizar status do domínio
  const updateDomainStatusMutation = useMutation({
    mutationFn: ({ status, domain }: { status: string; domain?: string }) => 
      updateDomainStatus(id!, status, domain),
    onSuccess: () => {
      toast.success('Domínio atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-client', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar domínio');
    },
  });

  // Mutation para atualizar status do site
  const updateSiteStatusMutation = useMutation({
    mutationFn: (data: { status: string; notes?: string; preview_url?: string; live_url?: string }) => 
      updateClientSiteStatus(id!, data),
    onSuccess: () => {
      toast.success('Status do site atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-client', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar status do site');
    },
  });

  // TODOS OS HOOKS DEVEM SER CHAMADOS ANTES DE QUALQUER EARLY RETURN
  const { data, isLoading } = useQuery({
    queryKey: ['admin-client', id],
    queryFn: () => getAdminClientById(id!),
    enabled: !!id,
  });

  // Atualiza o estado do domínio aprovado quando os dados são carregados
  useEffect(() => {
    const domainData = data?.data?.domain;
    if (domainData?.domain) {
      setApprovedDomain(domainData.domain);
    } else {
      setApprovedDomain('');
    }
  }, [data]);

  // Busca conversa do cliente (sempre chamado, mas só executa quando necessário)
  const { data: conversationsData } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: getChatConversations,
    enabled: activeTab === 'chat' && !!id,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const clientConversation = conversationsData?.data?.find(
    (conv: ChatConversation) => conv.user_id === id
  ) || null;

  // Busca mensagens da conversa (sempre chamado, mas só executa quando necessário)
  const { data: messagesData } = useQuery({
    queryKey: ['chat-messages', clientConversation?.id],
    queryFn: () => getChatMessages(clientConversation!.id),
    enabled: !!clientConversation?.id && activeTab === 'chat',
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 3000,
    placeholderData: (previousData) => previousData,
  });

  const messages = messagesData?.data || [];

  const sendMutation = useMutation({
    mutationFn: (msg: string) => sendChatMessage(clientConversation!.id, msg),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', clientConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Marca mensagens como lidas quando a aba é aberta
  useEffect(() => {
    if (activeTab === 'chat' && messages.length > 0 && clientConversation?.id) {
      const unreadMessages = messages.filter(
        (msg: ChatMessage) => !msg.is_read && msg.sender_type === 'client'
      );
      if (unreadMessages.length > 0) {
        markChatMessagesAsRead(clientConversation.id).then(() => {
          queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        });
      }
    }
  }, [activeTab, messages.length, clientConversation?.id, queryClient]);

  // AGORA SIM, PODEMOS FAZER EARLY RETURNS
  if (isLoading) return <Loading />;

  const clientData = data?.data;

  if (!clientData) {
    return <div>Cliente não encontrado</div>;
  }

  const { profile, subscription, siteStatus, briefing, invoices, emails, domain, tickets, contract } = clientData;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMutation.isPending && clientConversation?.id) {
      sendMutation.mutate(message.trim());
    }
  };

  const tabs = [
    { id: 'resumo', label: 'Resumo Geral' },
    { id: 'briefing', label: 'Briefing' },
    { id: 'contrato', label: 'Contrato' },
    { id: 'pagamentos', label: `Pagamentos (${invoices?.length || 0})` },
    { id: 'dominio', label: 'Domínio' },
    { id: 'emails', label: `E-mails (${emails?.length || 0})` },
    { id: 'tickets', label: `Suporte (${tickets?.length || 0})` },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="flex items-center justify-between mb-4">
        <PageHeader
          title={profile.company_name || profile.name}
          subtitle={profile.email}
        />
        <Button
          variant="primary"
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Editar Cliente
        </Button>
      </div>

      {/* Modal de Edição */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={{
          id: profile.id,
          name: profile.name,
          company_name: profile.company_name,
          email: profile.email || '',
          whatsapp: profile.whatsapp,
        }}
      />

      {/* Header com informações principais */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nome Completo</p>
            <p className="font-semibold">{profile.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">E-mail</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="font-semibold text-sm">{profile.email}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">WhatsApp</p>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <p className="font-semibold">{profile.whatsapp || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Cliente desde</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="font-semibold">
                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'resumo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assinatura */}
          <Card>
            <h3 className="text-lg font-semibold text-dark mb-4">Assinatura</h3>
            {subscription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-semibold">{subscription.plan?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold">
                    R$ {subscription.plan?.price_monthly.toFixed(2)}/mês
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={subscription.status} type="subscription" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Próxima renovação:</span>
                  <span className="font-semibold">
                    {new Date(subscription.renews_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma assinatura</p>
            )}
          </Card>

          {/* Status do Site */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark">Status do Site</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSiteStatusModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Status
              </Button>
            </div>
            {siteStatus ? (
              <div className="space-y-3">
                <StatusBadge status={siteStatus.status} type="site" />
                {siteStatus.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{siteStatus.notes}</p>
                  </div>
                )}
                {siteStatus.preview_url && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">URL de Preview:</p>
                    <p className="text-sm font-mono text-blue-900">{siteStatus.preview_url}</p>
                  </div>
                )}
                {siteStatus.live_url && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">URL do Site Publicado:</p>
                    <p className="text-sm font-mono text-green-900">{siteStatus.live_url}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-500">Status não disponível</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSiteStatusModalOpen(true)}
                >
                  Criar Status
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'briefing' && (
        <div className="space-y-6">
          {/* Header do Briefing */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black text-dark">Briefing do Projeto</h2>
                <p className="text-gray-600 mt-1">Quanto mais detalhes você fornecer, melhor será seu site</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={briefing?.status || 'nao_enviado'} type="briefing" />
                {briefing && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      const updatedAt = briefing.updated_at 
                        ? new Date(briefing.updated_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : undefined;
                      
                      exportBriefingToPDF(
                        briefing,
                        {
                          name: profile?.name,
                          company_name: profile?.company_name || briefing.company_name,
                          email: profile?.email,
                          phone: profile?.phone || briefing.whatsapp_commercial,
                        },
                        updatedAt
                      );
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </Button>
                )}
              </div>
            </div>
            {briefing?.updated_at && (
              <p className="text-sm text-gray-500">
                Última atualização: {new Date(briefing.updated_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </Card>

          {/* Componente de Briefing Read-Only */}
          {briefing ? (
            <BriefingReadOnly briefing={briefing} />
          ) : (
            <Card padding="lg">
              <p className="text-gray-500 text-center py-8">Briefing ainda não preenchido pelo cliente</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'pagamentos' && (
        <Card>
          <h3 className="text-lg font-semibold text-dark mb-4">Histórico de Pagamentos</h3>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-semibold">
                      {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      R$ {invoice.amount.toFixed(2)}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} type="invoice" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma fatura</p>
          )}
        </Card>
      )}

      {activeTab === 'tickets' && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Tickets de Suporte</h3>
          </div>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{ticket.subject}</h4>
                    <StatusBadge status={ticket.status} type="ticket" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <Badge variant="default">{ticket.priority}</Badge>
                    <span>•</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum ticket de suporte</p>
          )}
        </Card>
      )}

      {activeTab === 'contrato' && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Contrato</h3>
          </div>
          {contract ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {contract.status === 'assinado' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <Badge variant="success">Assinado</Badge>
                      {contract.signed_at && (
                        <p className="text-sm text-gray-500 mt-1">
                          Assinado em: {new Date(contract.signed_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <Badge variant="warning">Pendente de Assinatura</Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        Aguardando assinatura do cliente
                      </p>
                    </div>
                  </>
                )}
              </div>

              {contract.contract_url && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Documento do Contrato:</p>
                  <a
                    href={contract.contract_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-semibold"
                  >
                    📄 Ver contrato (PDF)
                  </a>
                </div>
              )}

              <div className="mt-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ℹ️ Informação:</strong> O contrato está disponível para o cliente na área
                  "Contrato" do painel dele. Ele pode assinar digitalmente quando estiver pronto.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum contrato gerado</p>
          )}
        </Card>
      )}

      {activeTab === 'dominio' && (
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Domínio</h3>
          </div>
          {domain ? (
            <div className="space-y-6">
              {/* Status e Domínio */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Status:</p>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={domain.status} type="domain" />
                      <select
                        value={domain.status}
                        onChange={(e) => {
                          updateDomainStatusMutation.mutate({ 
                            status: e.target.value,
                            domain: approvedDomain || undefined
                          });
                        }}
                        disabled={updateDomainStatusMutation.isPending}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="aguardando_dns">Aguardando DNS</option>
                        <option value="configurando">Configurando</option>
                        <option value="ativo">Ativo</option>
                      </select>
                    </div>
                  </div>
                  {domain.domain && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Domínio Atual:</p>
                      <p className="text-xl font-mono font-bold text-primary">{domain.domain}</p>
                    </div>
                  )}
                </div>

                {/* Campo para definir o domínio aprovado */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-3">
                    🌐 Domínio Aprovado e em Uso
                  </p>
                  <p className="text-xs text-green-800 mb-3">
                    Defina aqui qual domínio foi aprovado e será utilizado. Esta informação será exibida para o cliente na área do cliente.
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        label="Domínio Aprovado"
                        type="text"
                        placeholder="exemplo.com.br"
                        value={approvedDomain}
                        onChange={(e) => setApprovedDomain(e.target.value)}
                        helperText="Digite o domínio completo que será utilizado (ex: meusite.com.br)"
                        className="font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          updateDomainStatusMutation.mutate({ 
                            status: domain.status,
                            domain: approvedDomain || undefined
                          });
                        }}
                        disabled={updateDomainStatusMutation.isPending || !approvedDomain.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updateDomainStatusMutation.isPending ? 'Salvando...' : 'Salvar Domínio'}
                      </Button>
                    </div>
                  </div>
                  {domain.domain && (
                    <div className="mt-3 p-3 bg-white rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Domínio configurado:</p>
                      <p className="text-sm font-mono font-semibold text-green-900">{domain.domain}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações da Solicitação */}
              {domain.notes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-3">Informações da Solicitação:</p>
                  <div className="space-y-3">
                    {(() => {
                      // Parse das informações do notes
                      const notes = domain.notes;
                      
                      // Verifica se é domínio existente ou novo
                      if (notes.includes('Domínio existente registrado em')) {
                        // Domínio existente
                        const platformMatch = notes.match(/registrado em (.+?)\./);
                        const loginMatch = notes.match(/Login: (.+)/);
                        const platform = platformMatch ? platformMatch[1] : '';
                        const login = loginMatch ? loginMatch[1] : '';
                        
                        return (
                          <>
                            <div className="bg-white p-3 rounded border border-blue-100">
                              <p className="text-xs font-semibold text-blue-800 mb-2">Tipo: Domínio Existente</p>
                              {domain.domain && (
                                <div className="mb-2">
                                  <p className="text-xs text-gray-600">Domínio:</p>
                                  <p className="text-sm font-mono font-semibold text-gray-900">{domain.domain}</p>
                                </div>
                              )}
                              {platform && (
                                <div className="mb-2">
                                  <p className="text-xs text-gray-600">Plataforma/Registrador:</p>
                                  <p className="text-sm font-semibold text-gray-900">{platform}</p>
                                </div>
                              )}
                              {login && (
                                <div>
                                  <p className="text-xs text-gray-600">Login/Acesso:</p>
                                  <p className="text-sm font-mono text-gray-900">{login}</p>
                                </div>
                              )}
                              <div className="mt-2 pt-2 border-t border-blue-100">
                                <p className="text-xs text-gray-500">Senha: [fornecida pelo cliente]</p>
                              </div>
                            </div>
                          </>
                        );
                      } else if (notes.includes('Solicitação de novo domínio')) {
                        // Novo domínio
                        const optionsMatch = notes.match(/Opções desejadas:\n(.+)/s);
                        const options = optionsMatch ? optionsMatch[1].trim() : '';
                        
                        return (
                          <>
                            <div className="bg-white p-3 rounded border border-blue-100">
                              <p className="text-xs font-semibold text-blue-800 mb-2">Tipo: Novo Domínio</p>
                              {options && (
                                <div>
                                  <p className="text-xs text-gray-600 mb-2">Opções de Domínio Desejadas:</p>
                                  <div className="space-y-1">
                                    {options.split('\n').map((option, index) => (
                                      <p key={index} className="text-sm font-mono text-gray-900">
                                        {index + 1}. {option.trim()}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      } else {
                        // Fallback: mostra as notas como estão
                        return (
                          <div className="bg-white p-3 rounded border border-blue-100">
                            <p className="text-sm text-gray-700 whitespace-pre-line">{notes}</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Datas */}
              <div className="pt-4 border-t text-sm text-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Solicitado em:</p>
                    <p>{new Date(domain.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Última atualização:</p>
                    <p>{new Date((domain as any).updated_at || domain.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma solicitação de domínio</p>
              <p className="text-sm text-gray-400 mt-1">
                O cliente ainda não solicitou um domínio
              </p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'emails' && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <AtSign className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-dark">E-mails Profissionais</h3>
          </div>
          {emails && emails.length > 0 ? (
            <div className="space-y-3">
              {emails.map((email: EmailProfessional) => (
                <div key={email.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono font-semibold text-primary">{email.email}</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={email.status} type="email" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedEmail(email);
                          setIsEmailStatusModalOpen(true);
                        }}
                      >
                        Editar Status
                      </Button>
                    </div>
                  </div>
                  {email.access_url && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>URL de Acesso:</strong>{' '}
                      <a
                        href={email.access_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-xs"
                      >
                        {email.access_url}
                      </a>
                    </p>
                  )}
                  {email.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Observações:</strong> {email.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Criado em: {new Date(email.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum e-mail profissional configurado</p>
              <p className="text-sm text-gray-400 mt-1">
                O cliente ainda não solicitou e-mails corporativos
              </p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'chat' && (
        <Card padding="none" className="h-[calc(100vh-400px)] flex flex-col">
          {/* Header do Chat */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-dark">
                  {profile.name || profile.company_name || 'Cliente'}
                </h3>
                {profile.email && (
                  <p className="text-xs text-gray-500">{profile.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Área de Mensagens */}
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
                          {msg.sender?.name || msg.sender?.company_name || 'Cliente'}
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

          {/* Input de Mensagem */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={sendMutation.isPending || !clientConversation?.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!message.trim() || sendMutation.isPending || !clientConversation?.id}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Modal de Atualização de Status do Site */}
      <UpdateSiteStatusModal
        isOpen={isSiteStatusModalOpen}
        onClose={() => setIsSiteStatusModalOpen(false)}
        siteStatus={siteStatus || null}
        clientId={id!}
      />

      {/* Modal de Atualização de Status do E-mail */}
      {selectedEmail && (
        <UpdateEmailStatusModal
          isOpen={isEmailStatusModalOpen}
          onClose={() => {
            setIsEmailStatusModalOpen(false);
            setSelectedEmail(null);
          }}
          email={selectedEmail}
          clientId={id!}
        />
      )}
    </div>
  );
}

