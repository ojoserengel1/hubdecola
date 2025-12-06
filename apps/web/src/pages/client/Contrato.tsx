import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api';
import { Card, PageHeader, Loading, Badge, Button } from '@/components/ui';
import { FileCheck, Download, CheckCircle, AlertCircle } from 'lucide-react';

export function Contrato() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  if (isLoading) return <Loading />;

  const contract = data?.data?.contract;
  const profile = data?.data?.profile;

  return (
    <div>
      <PageHeader
        title="Contrato"
        subtitle="Contrato de prestação de serviços DecolaWeb"
      />

      {contract ? (
        <>
          {/* Card: Status do Contrato */}
          <Card className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark mb-2">
                  Status do Contrato
                </h3>
                <Badge variant={contract.status === 'assinado' ? 'success' : 'warning'}>
                  {contract.status === 'assinado' ? 'Assinado' : 'Pendente de Assinatura'}
                </Badge>
              </div>
              <FileCheck className="w-8 h-8 text-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600 mb-1">Data de envio</p>
                <p className="font-semibold">
                  {contract.sent_at
                    ? new Date(contract.sent_at).toLocaleDateString('pt-BR')
                    : 'Não enviado'}
                </p>
              </div>
              {contract.signed_at && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Data de assinatura</p>
                  <p className="font-semibold">
                    {new Date(contract.signed_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Card: Ação necessária */}
          {contract.status === 'pendente' && (
            <Card className="mb-6 bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Ação Necessária: Assine o Contrato
                  </h4>
                  <p className="text-sm text-yellow-800 mb-4">
                    Para prosseguirmos com o desenvolvimento do seu site, precisamos que
                    você leia e assine o contrato de prestação de serviços.
                  </p>
                  <Button variant="primary">Assinar Contrato Digitalmente</Button>
                </div>
              </div>
            </Card>
          )}

          {contract.status === 'assinado' && (
            <Card className="mb-6 bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">
                    Contrato Assinado
                  </h4>
                  <p className="text-sm text-green-800">
                    Seu contrato foi assinado com sucesso. Você pode baixar uma cópia
                    a qualquer momento.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Card: Resumo do Contrato */}
          <Card>
            <h3 className="text-lg font-semibold text-dark mb-4">
              Resumo do Contrato
            </h3>

            <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
              <section>
                <h4 className="font-semibold text-dark">1. Objeto do Contrato</h4>
                <p>
                  Este contrato tem por objeto a prestação de serviços de criação,
                  desenvolvimento, hospedagem e manutenção de website profissional pela
                  CONTRATADA (DecolaWeb) para o CONTRATANTE ({profile?.name}).
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-dark">2. Serviços Inclusos</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Desenvolvimento completo do website</li>
                  <li>Design responsivo (mobile, tablet e desktop)</li>
                  <li>Hospedagem em servidor otimizado</li>
                  <li>Certificado SSL (HTTPS)</li>
                  <li>Registro e renovação de domínio</li>
                  <li>Até 5 contas de e-mail profissional</li>
                  <li>Suporte técnico contínuo</li>
                  <li>Backups automáticos</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-dark">3. Valor e Pagamento</h4>
                <p>
                  O valor da mensalidade é de <strong>R$ 99,90</strong> (noventa e nove
                  reais e noventa centavos), a ser pago através de cartão de crédito,
                  PIX ou boleto bancário até o dia 10 de cada mês.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-dark">4. Prazo de Desenvolvimento</h4>
                <p>
                  O prazo para desenvolvimento e publicação do site é de até 15 (quinze)
                  dias úteis após o recebimento do briefing completo e aprovação do
                  contrato.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-dark">5. Alterações e Manutenção</h4>
                <p>
                  Pequenas alterações de texto e imagens estão incluídas no plano.
                  Alterações estruturais ou funcionais podem gerar custo adicional,
                  conforme orçamento prévio.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-dark">6. Cancelamento</h4>
                <p>
                  O cancelamento pode ser solicitado a qualquer momento, sem multa,
                  com efeito ao final do período já pago. Após o cancelamento, o site
                  será removido em até 30 dias.
                </p>
              </section>
            </div>

            <div className="mt-6 pt-6 border-t flex gap-3">
              <Button variant="outline" fullWidth>
                <Download className="w-4 h-4 mr-2" />
                Baixar Contrato Completo (PDF)
              </Button>
              {contract.status === 'pendente' && (
                <Button variant="primary" fullWidth>
                  Assinar Agora
                </Button>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-8">
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum contrato disponível
            </h3>
            <p className="text-gray-600">
              O contrato será disponibilizado em breve
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

