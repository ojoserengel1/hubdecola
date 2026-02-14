import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api';
import { Card, PageHeader, Loading, StatusBadge, Button, Input } from '@/components/ui';
import { AtSign, Globe, Lock } from 'lucide-react';
import { RequestDomainModal } from '@/components/client/RequestDomainModal';

export function Dominio() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  if (isLoading) return <Loading />;

  const domain = data?.data?.domain;

  // Parse das informações do notes
  const parseDomainInfo = () => {
    if (!domain?.notes) return null;

    const notes = domain.notes;

    // Verifica se é domínio existente
    if (notes.includes('Domínio existente registrado em')) {
      const platformMatch = notes.match(/registrado em (.+?)\./);
      const loginMatch = notes.match(/Login: (.+)/);
      return {
        type: 'existing' as const,
        domain: domain.domain || '',
        platform: platformMatch ? platformMatch[1] : '',
        login: loginMatch ? loginMatch[1] : '',
      };
    }

    // Verifica se é novo domínio
    if (notes.includes('Solicitação de novo domínio')) {
      const optionsMatch = notes.match(/Opções desejadas:\n(.+)/s);
      const options = optionsMatch ? optionsMatch[1].trim().split('\n').filter(Boolean) : [];
      return {
        type: 'new' as const,
        options,
      };
    }

    return null;
  };

  const domainInfo = parseDomainInfo();

  return (
    <div>
      <PageHeader
        title="Domínio"
        subtitle="Informações sobre o domínio do seu site"
        action={
          !domain && (
            <Button 
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Solicitar Domínio
            </Button>
          )
        }
      />

      {/* Card: Informações */}
      <Card className="mb-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Domínio do seu site
            </h4>
            <p className="text-sm text-blue-800">
              O domínio é o endereço do seu site na internet. Você pode usar um domínio que já possui ou solicitar um novo.
            </p>
          </div>
        </div>
      </Card>

      {domain ? (
        <div className="space-y-6">
          {/* Card: Domínio Aprovado (se existir) */}
          {domain.domain && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Domínio Aprovado e em Uso</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-green-800 mb-2">Seu domínio:</p>
                  <p className="text-2xl font-mono font-black text-green-900">{domain.domain}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={domain.status} type="domain" />
                  <p className="text-xs text-green-700">
                    {domain.status === 'ativo' 
                      ? 'Domínio ativo e configurado' 
                      : 'Domínio em processo de configuração'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Card: Solicitação de Domínio */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark">Sua Solicitação de Domínio</h3>
              <StatusBadge status={domain.status} type="domain" />
            </div>

          {/* Informações da Solicitação - Read Only */}
          {domainInfo && (
            <div className="space-y-6">
              {domainInfo.type === 'existing' ? (
                <>
                  {/* Domínio Existente */}
                  <div>
                    <Input
                      label="Você já possui um domínio registrado?"
                      value="Sim, já tenho"
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Input
                      label="Qual é o domínio?"
                      value={domainInfo.domain || ''}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <Input
                      label="Plataforma/Registrador"
                      value={domainInfo.platform}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Input
                      label="Login/Acesso"
                      value={domainInfo.login}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Senha</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value="••••••••"
                        readOnly
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Senha fornecida na solicitação
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Novo Domínio */}
                  <div>
                    <Input
                      label="Você já possui um domínio registrado?"
                      value="Não, quero um novo"
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Opções de Domínio Desejadas
                      </label>
                    </div>
                    <div className="space-y-2">
                      {domainInfo.options.map((option, index) => (
                        <input
                          key={index}
                          value={`${index + 1}. ${option.trim()}`}
                          readOnly
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-mono"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Nossa equipe verificará a disponibilidade e registrará o primeiro disponível.
                    </p>
                  </div>
                </>
              )}

              {/* Informações Adicionais */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Solicitado em:</p>
                    <p>
                      {new Date(domain.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Última atualização:</p>
                    <p>
                      {new Date((domain as any).updated_at || domain.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Se não conseguir parsear, mostra as notas */}
          {!domainInfo && domain.notes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Informações da Solicitação:</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{domain.notes}</p>
            </div>
          )}
          </Card>
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <AtSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma solicitação de domínio
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Solicite a configuração do domínio do seu site
            </p>
            <Button 
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Solicitar Domínio
            </Button>
          </div>
        </Card>
      )}

      {/* Modal de Solicitação de Domínio */}
      <RequestDomainModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}

