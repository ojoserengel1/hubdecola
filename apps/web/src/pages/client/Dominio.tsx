import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api';
import { Card, PageHeader, Loading, StatusBadge, Button } from '@/components/ui';
import { AtSign, AlertCircle, CheckCircle } from 'lucide-react';

export function Dominio() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  if (isLoading) return <Loading />;

  const domain = data?.data?.domain;

  return (
    <div>
      <PageHeader
        title="Domínio"
        subtitle="Informações sobre o domínio do seu site"
      />

      {domain ? (
        <>
          {/* Card: Domínio Atual */}
          <Card className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark mb-2">Seu Domínio</h3>
                <p className="text-2xl font-mono font-bold text-primary mb-3">
                  {domain.domain}
                </p>
                <StatusBadge status={domain.status} type="domain" />
              </div>
              <AtSign className="w-8 h-8 text-primary" />
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Registrado em:</strong>{' '}
                {new Date(domain.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </Card>

          {/* Card: Status e Instruções */}
          {domain.status === 'aguardando_dns' && (
            <Card className="mb-6 bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Aguardando Configuração DNS
                  </h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    Para que seu site fique acessível através deste domínio, é necessário
                    configurar os registros DNS. Se você já possui o domínio registrado,
                    entre em contato conosco para receber as instruções.
                  </p>
                  <Button size="sm" variant="outline">
                    Ver Instruções DNS
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {domain.status === 'configurando' && (
            <Card className="mb-6 bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Configuração em Andamento
                  </h4>
                  <p className="text-sm text-blue-800">
                    Estamos configurando seu domínio. Este processo pode levar até 48 horas
                    para propagação completa. Você será notificado quando estiver concluído.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {domain.status === 'ativo' && (
            <Card className="mb-6 bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">
                    Domínio Ativo
                  </h4>
                  <p className="text-sm text-green-800 mb-3">
                    Seu domínio está configurado e ativo! Seu site está acessível em:
                  </p>
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-green-700 hover:underline"
                  >
                    https://{domain.domain}
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* Notas da Equipe */}
          {domain.notes && (
            <Card>
              <h4 className="font-semibold text-dark mb-3">Notas da Equipe</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">{domain.notes}</p>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-8">
            <AtSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum domínio configurado
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Entre em contato com nossa equipe para configurar o domínio do seu site
            </p>
            <Button>Solicitar Domínio</Button>
          </div>
        </Card>
      )}

      {/* Card: Informações sobre Domínio */}
      <Card className="mt-6">
        <h4 className="font-semibold text-dark mb-3">❓ Perguntas Frequentes</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Posso usar meu próprio domínio?
            </p>
            <p className="text-sm text-gray-600">
              Sim! Se você já possui um domínio registrado, podemos configurá-lo para
              apontar para seu site DecolaWeb. Entre em contato com o suporte.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Quanto tempo leva para o domínio ficar ativo?
            </p>
            <p className="text-sm text-gray-600">
              A configuração do domínio pode levar de algumas horas até 48 horas para
              propagação completa em todos os servidores DNS da internet.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              O domínio está incluído no plano?
            </p>
            <p className="text-sm text-gray-600">
              O registro e renovação anual do domínio estão inclusos no seu plano DecolaWeb.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

