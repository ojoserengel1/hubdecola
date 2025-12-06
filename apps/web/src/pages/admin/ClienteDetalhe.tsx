import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminClientById } from '@/lib/api';
import { Card, PageHeader, Loading, StatusBadge, Button, Badge } from '@/components/ui';
import { ArrowLeft, Mail, Phone, Calendar, Edit, FileText, Globe, AtSign, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { EditClientModal } from '@/components/admin/EditClientModal';

export function ClienteDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resumo' | 'briefing' | 'pagamentos' | 'tickets' | 'contrato' | 'dominio' | 'emails'>('resumo');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-client', id],
    queryFn: () => getAdminClientById(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;

  const clientData = data?.data;

  if (!clientData) {
    return <div>Cliente não encontrado</div>;
  }

  const { profile, subscription, siteStatus, briefing, invoices, emails, domain, tickets, pipeline, contract } = clientData;

  const tabs = [
    { id: 'resumo', label: 'Resumo Geral' },
    { id: 'briefing', label: 'Briefing' },
    { id: 'contrato', label: 'Contrato' },
    { id: 'pagamentos', label: `Pagamentos (${invoices?.length || 0})` },
    { id: 'dominio', label: 'Domínio' },
    { id: 'emails', label: `E-mails (${emails?.length || 0})` },
    { id: 'tickets', label: `Suporte (${tickets?.length || 0})` },
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
            <h3 className="text-lg font-semibold text-dark mb-4">Status do Site</h3>
            {siteStatus ? (
              <div className="space-y-3">
                <StatusBadge status={siteStatus.status} type="site" />
                {siteStatus.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{siteStatus.notes}</p>
                  </div>
                )}
                {pipeline && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-1">Pipeline:</p>
                    <Badge>{pipeline.stage}</Badge>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Status não disponível</p>
            )}
          </Card>

          {/* Domínio */}
          <Card>
            <h3 className="text-lg font-semibold text-dark mb-4">Domínio</h3>
            {domain ? (
              <div className="space-y-3">
                <p className="font-mono font-semibold text-primary">{domain.domain}</p>
                <StatusBadge status={domain.status} type="domain" />
                {domain.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{domain.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum domínio configurado</p>
            )}
          </Card>

          {/* E-mails */}
          <Card>
            <h3 className="text-lg font-semibold text-dark mb-4">E-mails Profissionais</h3>
            {emails && emails.length > 0 ? (
              <div className="space-y-2">
                {emails.map((email: any) => (
                  <div key={email.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm font-mono">{email.email}</span>
                    <StatusBadge status={email.status} type="email" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum e-mail configurado</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'briefing' && (
        <Card>
          <h3 className="text-lg font-semibold text-dark mb-4">Briefing do Cliente</h3>
          {briefing ? (
            <div className="space-y-4">
              <div className="mb-4">
                <StatusBadge status={briefing.status} type="briefing" />
                <p className="text-sm text-gray-500 mt-2">
                  Última atualização: {new Date(briefing.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              {/* Mostra dados novos (campos diretos) se existirem */}
              {(briefing.company_name || briefing.segment || briefing.full_name) ? (
                <div className="space-y-6">
                  {/* Seção 1: Dados da Empresa */}
                  {(briefing.company_name || briefing.segment || briefing.full_name) && (
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-dark mb-3">Dados da Empresa</h4>
                      <div className="space-y-2">
                        {briefing.company_name && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Nome da Empresa</p>
                            <p className="text-gray-600">{briefing.company_name}</p>
                          </div>
                        )}
                        {briefing.segment && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Segmento</p>
                            <p className="text-gray-600">{briefing.segment}</p>
                          </div>
                        )}
                        {briefing.full_name && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Nome Completo</p>
                            <p className="text-gray-600">{briefing.full_name}</p>
                          </div>
                        )}
                        {briefing.commercial_email && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">E-mail Comercial</p>
                            <p className="text-gray-600">{briefing.commercial_email}</p>
                          </div>
                        )}
                        {(briefing.whatsapp_commercial || (briefing as any).whatsapp) && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">WhatsApp</p>
                            <p className="text-gray-600">{briefing.whatsapp_commercial || (briefing as any).whatsapp}</p>
                          </div>
                        )}
                        {briefing.landline && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Telefone Fixo</p>
                            <p className="text-gray-600">{briefing.landline}</p>
                          </div>
                        )}
                        {briefing.address && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Endereço</p>
                            <p className="text-gray-600">{briefing.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seção 2: Estrutura do Site */}
                  {(briefing.company_description || briefing.target_audience || briefing.main_services) && (
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-dark mb-3">Estrutura do Site</h4>
                      <div className="space-y-3">
                        {briefing.has_website !== undefined && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Já possui site?</p>
                            <p className="text-gray-600">{briefing.has_website ? 'Sim' : 'Não'}</p>
                          </div>
                        )}
                        {briefing.current_website_url && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Site Atual</p>
                            <p className="text-gray-600">
                              <a href={briefing.current_website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {briefing.current_website_url}
                              </a>
                            </p>
                          </div>
                        )}
                        {briefing.company_description && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Descrição da Empresa</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{briefing.company_description}</p>
                          </div>
                        )}
                        {briefing.target_audience && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Público-alvo</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{briefing.target_audience}</p>
                          </div>
                        )}
                        {briefing.service_region && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Região de Atendimento</p>
                            <p className="text-gray-600">{briefing.service_region}</p>
                          </div>
                        )}
                        {briefing.main_services && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Principais Serviços</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{briefing.main_services}</p>
                          </div>
                        )}
                        {briefing.differentials && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Diferenciais</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{briefing.differentials}</p>
                          </div>
                        )}
                        {briefing.business_hours && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Horário de Atendimento</p>
                            <p className="text-gray-600">{briefing.business_hours}</p>
                          </div>
                        )}
                        {briefing.social_links && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Redes Sociais</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{briefing.social_links}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seção 3: Identidade Visual */}
                  {(briefing.has_brand_identity !== undefined || briefing.main_colors) && (
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-dark mb-3">Identidade Visual</h4>
                      <div className="space-y-3">
                        {briefing.has_brand_identity !== undefined && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Possui identidade visual?</p>
                            <p className="text-gray-600">{briefing.has_brand_identity ? 'Sim' : 'Não'}</p>
                          </div>
                        )}
                        {briefing.brand_assets_links && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Links dos Arquivos</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{briefing.brand_assets_links}</p>
                          </div>
                        )}
                        {briefing.main_colors && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Cores Principais</p>
                            <p className="text-gray-600">{briefing.main_colors}</p>
                          </div>
                        )}
                        {briefing.forbidden_colors && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Cores Proibidas</p>
                            <p className="text-gray-600">{briefing.forbidden_colors}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seção 4: Observações Finais */}
                  {briefing.general_notes && (
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-dark mb-3">Observações Finais</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{briefing.general_notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Fallback: mostra answers antigo se não tiver campos novos
                briefing.answers && typeof briefing.answers === 'object' && Object.keys(briefing.answers).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(briefing.answers).map(([key, value]) => (
                      <div key={key} className="border-l-4 border-primary pl-4">
                        <p className="text-sm font-semibold text-gray-700 capitalize mb-1">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-gray-600">{value as string}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Briefing ainda não preenchido</p>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500">Briefing não enviado</p>
          )}
        </Card>
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
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Domínio</h3>
          </div>
          {domain ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Domínio configurado:</p>
                <p className="text-2xl font-mono font-bold text-primary">{domain.domain}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Status:</p>
                <StatusBadge status={domain.status} type="domain" />
              </div>

              {domain.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Observações:</p>
                  <p className="text-sm text-gray-600">{domain.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                <p className="mb-1">
                  <strong>Registrado em:</strong>{' '}
                  {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p>
                  <strong>Última atualização:</strong>{' '}
                  {new Date(domain.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum domínio configurado</p>
              <p className="text-sm text-gray-400 mt-1">
                O cliente ainda não tem um domínio registrado
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
              {emails.map((email: any) => (
                <div key={email.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono font-semibold text-primary">{email.email}</p>
                    <StatusBadge status={email.status} type="email" />
                  </div>
                  {email.notes && (
                    <p className="text-sm text-gray-600">{email.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Criado em: {new Date(email.created_at).toLocaleDateString('pt-BR')}
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
    </div>
  );
}

