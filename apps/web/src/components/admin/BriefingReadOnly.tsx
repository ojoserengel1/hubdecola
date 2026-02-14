import { useState } from 'react';
import { Card } from '@/components/ui';
import { Building2, Globe, Palette, MessageSquare } from 'lucide-react';

interface BriefingData {
  // Dados da Empresa
  company_name?: string;
  segment?: string;
  full_name?: string;
  commercial_email?: string;
  whatsapp_commercial?: string;
  landline?: string;
  address?: string;
  // Presença Digital
  has_website?: boolean | string;
  current_website_url?: string;
  company_description?: string;
  target_audience?: string;
  service_region?: string;
  main_services?: string;
  differentials?: string;
  business_hours?: string;
  social_links?: string;
  // Identidade Visual
  has_brand_identity?: boolean | string;
  brand_assets_links?: string;
  main_colors?: string;
  forbidden_colors?: string;
  // Observações
  general_notes?: string;
  // Fallback
  answers?: Record<string, any>;
}

interface BriefingReadOnlyProps {
  briefing: BriefingData;
}

export function BriefingReadOnly({ briefing }: BriefingReadOnlyProps) {
  const [currentSection, setCurrentSection] = useState(1);
  
  const sections = [
    { id: 1, title: 'Dados da Empresa', icon: Building2 },
    { id: 2, title: 'Estrutura do Site', icon: Globe },
    { id: 3, title: 'Identidade Visual', icon: Palette },
    { id: 4, title: 'Observações Finais', icon: MessageSquare },
  ];

  // Extrai dados do formato answers se existir
  const data = briefing.answers || briefing;

  // Helper para pegar valor de qualquer formato
  const getValue = (key: string) => {
    return briefing[key as keyof BriefingData] || data[key] || '';
  };

  // Verifica se tem algum dado
  const hasAnyData = briefing.company_name || briefing.answers || briefing.segment;

  if (!hasAnyData) {
    return (
      <Card padding="lg">
        <p className="text-gray-500 text-center py-8">Briefing ainda não preenchido pelo cliente</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation - Igual ao cliente */}
      <Card className="mb-6" padding="md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = currentSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                type="button"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold text-sm text-left">{section.title}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Form - Mostra apenas a seção ativa */}
      <Card padding="lg">
        {/* Section 1: Dados da Empresa */}
        {currentSection === 1 && (
          <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-dark mb-2">Dados da Empresa</h2>
                <p className="text-gray-600">
                  Informações básicas sobre sua empresa e contato
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Nome da Empresa <span className="text-primary">*</span>
                  </label>
                  <input
                    value={getValue('company_name')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Ex: DecolaWeb Soluções Digitais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Segmento/Nicho <span className="text-primary">*</span>
                  </label>
                  <input
                    value={getValue('segment')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Ex: Desenvolvimento de Websites, Marketing Digital"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Seu Nome Completo <span className="text-primary">*</span>
                </label>
                <input
                  value={getValue('full_name')}
                  readOnly
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Nome completo do responsável"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    E-mail Comercial
                  </label>
                  <input
                    type="email"
                    value={getValue('commercial_email')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="contato@suaempresa.com.br"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    E-mail que aparecerá no site (caso queira colocar)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    WhatsApp Comercial <span className="text-primary">*</span>
                  </label>
                  <input
                    value={getValue('whatsapp_commercial')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="(11) 99999-9999"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número que receberá os leads do site
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Telefone Fixo
                  </label>
                  <input
                    value={getValue('landline')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="(11) 3333-4444"
                  />
                  <p className="text-xs text-gray-500 mt-1">Caso tenha e queira colocar no site</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Endereço
                  </label>
                  <input
                    value={getValue('address')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Rua, número, bairro, cidade"
                  />
                  <p className="text-xs text-gray-500 mt-1">Caso tenha e queira colocar no site</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Estrutura do Site */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-dark mb-2">Estrutura do Site</h2>
                <p className="text-gray-600">
                  Informações sobre seu negócio e presença digital
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-3">
                  Já possui site? <span className="text-primary">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={getValue('has_website') === true || getValue('has_website') === 'true'}
                      readOnly
                      disabled
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={getValue('has_website') === false || getValue('has_website') === 'false'}
                      readOnly
                      disabled
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-gray-700">Não</span>
                  </label>
                </div>
              </div>

              {(getValue('has_website') === true || getValue('has_website') === 'true' || getValue('current_website_url')) && (
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Link do site atual <span className="text-primary">*</span>
                  </label>
                  <input
                    type="url"
                    value={getValue('current_website_url')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="https://www.seusite.com.br"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Descrição completa da empresa <span className="text-primary">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  💡 O que vocês fazem, o que vendem, há quanto tempo existem, história da empresa... Quanto mais informação, melhor!
                </p>
                <textarea
                  value={getValue('company_description')}
                  readOnly
                  rows={6}
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed resize-none"
                  placeholder="Escreva a descrição completa da sua empresa aqui..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Público-alvo <span className="text-primary">*</span>
                </label>
                <textarea
                  value={getValue('target_audience')}
                  readOnly
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed resize-none"
                  placeholder="Ex: Mulheres de 25 a 45 anos, classe B, interessadas em moda sustentável..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Região de Atendimento <span className="text-primary">*</span>
                </label>
                <input
                  value={getValue('service_region')}
                  readOnly
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Ex: São Paulo capital, Nacional, Online, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Principais produtos/serviços <span className="text-primary">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  💡 Descreva cada produto ou serviço que deve aparecer no site.
                </p>
                <textarea
                  value={getValue('main_services')}
                  readOnly
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed resize-none"
                  placeholder="Escreva seus principais produtos/serviços aqui..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Principais diferenciais <span className="text-primary">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  💡 O que torna sua empresa única? Por que os clientes devem escolher você?
                </p>
                <textarea
                  value={getValue('differentials')}
                  readOnly
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed resize-none"
                  placeholder="Escreva os diferenciais da sua empresa aqui..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Horário de atendimento
                  </label>
                  <input
                    value={getValue('business_hours')}
                    readOnly
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Ex: Seg a Sex, 9h às 18h"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Links das Redes Sociais
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    💡 Instagram, Facebook, LinkedIn, etc. (um por linha)
                  </p>
                  <textarea
                    value={getValue('social_links')}
                    readOnly
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed resize-none"
                    placeholder="Cole os links das suas redes sociais aqui..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Identidade Visual */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-dark mb-2">Identidade Visual</h2>
                <p className="text-gray-600">
                  Informações sobre a aparência e estilo do seu site
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-3">
                  Já possui identidade visual definida? <span className="text-primary">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={getValue('has_brand_identity') === true || getValue('has_brand_identity') === 'true'}
                      readOnly
                      disabled
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={getValue('has_brand_identity') === false || getValue('has_brand_identity') === 'false'}
                      readOnly
                      disabled
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-gray-700">Não</span>
                  </label>
                </div>
              </div>

              {(getValue('has_brand_identity') === true || getValue('has_brand_identity') === 'true' || getValue('brand_assets_links')) ? (
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Links dos arquivos da sua marca <span className="text-primary">*</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    💡 Inclua logo em alta resolução, variações, fontes, cores e quaisquer outros arquivos relacionados à sua identidade visual. Use Google Drive, Dropbox, WeTransfer, etc.
                  </p>
                  <textarea
                    value={getValue('brand_assets_links')}
                    readOnly
                    rows={5}
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed resize-none"
                    placeholder="Cole os links dos arquivos aqui..."
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Cores principais <span className="text-primary">*</span>
                    </label>
                    <input
                      value={getValue('main_colors')}
                      readOnly
                      className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                      placeholder="Ex: Vermelho #FF002E, Azul escuro, Cinza"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pode ser nomes de cores ou códigos hexadecimais (#FF002E)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Cores que NÃO quer de jeito nenhum
                    </label>
                    <input
                      value={getValue('forbidden_colors')}
                      readOnly
                      className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                      placeholder="Ex: Rosa, Roxo, Amarelo claro"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cores que devemos evitar no projeto
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Section 4: Observações Finais */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-dark mb-2">Observações Finais</h2>
                <p className="text-gray-600">
                  Alguma informação adicional ou pedido específico
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Observações gerais e pedidos específicos
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  💡 Se você tiver alguma observação importante, preferência de estilo ou algo que faça muita questão de ter no seu site (uma seção, um botão, uma cor, uma frase, etc.), descreva aqui.
                </p>
                <textarea
                  value={getValue('general_notes')}
                  readOnly
                  rows={8}
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 cursor-not-allowed resize-none"
                  placeholder="Escreva suas observações aqui..."
                />
              </div>
            </div>
          )}
        </Card>
      </div>
  );
}

