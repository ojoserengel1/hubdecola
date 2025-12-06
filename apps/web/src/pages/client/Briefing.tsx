import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBriefing, submitBriefing } from '@/lib/api';
import { Card, PageHeader, Button, Loading } from '@/components/ui';
import { 
  FileText, 
  Building2, 
  Globe, 
  Palette, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface BriefingFormData {
  // Dados da Empresa
  company_name: string;
  segment: string;
  full_name: string;
  commercial_email: string;
  whatsapp_commercial: string;
  landline: string;
  address: string;
  // Presença Digital
  has_website: string;
  current_website_url: string;
  company_description: string;
  target_audience: string;
  service_region: string;
  main_services: string;
  differentials: string;
  business_hours: string;
  social_links: string;
  // Identidade Visual
  has_brand_identity: string;
  brand_assets_links: string;
  main_colors: string;
  forbidden_colors: string;
  // Observações
  general_notes: string;
}

export function Briefing() {
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<BriefingFormData>({
    company_name: '',
    segment: '',
    full_name: '',
    commercial_email: '',
    whatsapp_commercial: '',
    landline: '',
    address: '',
    has_website: 'false',
    current_website_url: '',
    company_description: '',
    target_audience: '',
    service_region: '',
    main_services: '',
    differentials: '',
    business_hours: '',
    social_links: '',
    has_brand_identity: 'false',
    brand_assets_links: '',
    main_colors: '',
    forbidden_colors: '',
    general_notes: '',
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['briefing'],
    queryFn: getBriefing,
  });

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (data?.data?.answers) {
      setFormData(prev => ({ ...prev, ...data.data.answers }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: submitBriefing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefing'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      alert('✅ Briefing salvo com sucesso!');
    },
    onError: () => {
      alert('❌ Erro ao salvar briefing. Tente novamente.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.company_name || !formData.segment || !formData.full_name) {
      alert('❌ Preencha todos os campos obrigatórios da Seção 1');
      setCurrentSection(1);
      return;
    }
    
    mutation.mutate({ answers: formData });
  };

  if (isLoading) return <Loading />;

  const briefing = data?.data;
  const status = briefing?.status || 'nao_enviado';

  const sections = [
    { id: 1, title: 'Dados da Empresa', icon: Building2 },
    { id: 2, title: 'Estrutura do Site', icon: Globe },
    { id: 3, title: 'Identidade Visual', icon: Palette },
    { id: 4, title: 'Observações Finais', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Briefing do Projeto"
        subtitle="Quanto mais detalhes você fornecer, melhor será seu site"
      />

      {/* Status Banner */}
      <div className="mb-6">
        {status === 'nao_enviado' ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Briefing ainda não enviado</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Preencha todas as informações necessárias sobre seu projeto. Você pode salvar e editar quantas vezes quiser.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Briefing enviado ✓</h3>
                <p className="text-sm text-green-800 mt-1">
                  Nossa equipe já recebeu suas informações. Você pode editar e salvar novamente se desejar.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Navigation */}
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
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
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Ex: DecolaWeb Soluções Digitais"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Segmento/Nicho <span className="text-primary">*</span>
                  </label>
                  <input
                    name="segment"
                    value={formData.segment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Ex: Desenvolvimento de Websites, Marketing Digital"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Seu Nome Completo <span className="text-primary">*</span>
                </label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Nome completo do responsável"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    E-mail Comercial
                  </label>
                  <input
                    type="email"
                    name="commercial_email"
                    value={formData.commercial_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
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
                    name="whatsapp_commercial"
                    value={formData.whatsapp_commercial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="(11) 99999-9999"
                    required
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
                    name="landline"
                    value={formData.landline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="(11) 3333-4444"
                  />
                  <p className="text-xs text-gray-500 mt-1">Caso tenha e queira colocar no site</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Endereço
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="has_website"
                      value="true"
                      checked={formData.has_website === 'true'}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="has_website"
                      value="false"
                      checked={formData.has_website === 'false'}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">Não</span>
                  </label>
                </div>
              </div>

              {formData.has_website === 'true' && (
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Link do site atual <span className="text-primary">*</span>
                  </label>
                  <input
                    type="url"
                    name="current_website_url"
                    value={formData.current_website_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="https://www.seusite.com.br"
                    required={formData.has_website === 'true'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Descrição completa da empresa <span className="text-primary">*</span>
                </label>
                <textarea
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                  placeholder="O que vocês fazem, o que vendem, há quanto tempo existem, história da empresa... Quanto mais informação, melhor!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Público-alvo <span className="text-primary">*</span>
                </label>
                <textarea
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                  placeholder="Ex: Mulheres de 25 a 45 anos, classe B, interessadas em moda sustentável..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Região de Atendimento <span className="text-primary">*</span>
                </label>
                <input
                  name="service_region"
                  value={formData.service_region}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Ex: São Paulo capital, Nacional, Online, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Principais produtos/serviços <span className="text-primary">*</span>
                </label>
                <textarea
                  name="main_services"
                  value={formData.main_services}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                  placeholder="Descreva cada produto ou serviço que deve aparecer no site..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Principais diferenciais <span className="text-primary">*</span>
                </label>
                <textarea
                  name="differentials"
                  value={formData.differentials}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                  placeholder="O que torna sua empresa única? Por que os clientes devem escolher você?"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Horário de atendimento
                  </label>
                  <input
                    name="business_hours"
                    value={formData.business_hours}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Ex: Seg a Sex, 9h às 18h"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Links das Redes Sociais
                  </label>
                  <textarea
                    name="social_links"
                    value={formData.social_links}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                    placeholder="Cole os links das suas redes sociais (um por linha)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Instagram, Facebook, LinkedIn, etc.
                  </p>
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="has_brand_identity"
                      value="true"
                      checked={formData.has_brand_identity === 'true'}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="has_brand_identity"
                      value="false"
                      checked={formData.has_brand_identity === 'false'}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    <span className="text-gray-700">Não</span>
                  </label>
                </div>
              </div>

              {formData.has_brand_identity === 'true' && (
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Links dos arquivos da sua marca <span className="text-primary">*</span>
                  </label>
                  <textarea
                    name="brand_assets_links"
                    value={formData.brand_assets_links}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                    placeholder="Cole aqui links de pastas do Google Drive, Dropbox, WeTransfer, etc. com todos os arquivos da sua marca (logo, aplicações, manual de marca, etc.)"
                    required={formData.has_brand_identity === 'true'}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Inclua logo em alta resolução, variações, fontes, cores e quaisquer outros arquivos relacionados à sua identidade visual
                  </p>
                </div>
              )}

              {formData.has_brand_identity === 'false' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Cores principais <span className="text-primary">*</span>
                    </label>
                    <input
                      name="main_colors"
                      value={formData.main_colors}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      placeholder="Ex: Vermelho #FF002E, Azul escuro, Cinza"
                      required={formData.has_brand_identity === 'false'}
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
                      name="forbidden_colors"
                      value={formData.forbidden_colors}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
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
                <textarea
                  name="general_notes"
                  value={formData.general_notes}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                  placeholder="Se você tiver alguma observação importante, preferência de estilo ou algo que faça muita questão de ter no seu site (uma seção, um botão, uma cor, uma frase, etc.), descreva aqui..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Este é o espaço para você nos contar qualquer detalhe que não foi coberto nas perguntas anteriores
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Pronto para salvar?</h3>
                <p className="text-sm text-blue-800">
                  Revise todas as informações nas seções anteriores antes de salvar. Você pode editar e salvar quantas vezes quiser!
                </p>
              </div>
            </div>
          )}

          {/* Navigation and Submit Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => setCurrentSection(prev => Math.max(1, prev - 1))}
              disabled={currentSection === 1}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Anterior
            </button>

            <div className="flex gap-3">
              {currentSection < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection(prev => Math.min(4, prev + 1))}
                  className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold transition shadow-lg"
                >
                  Próxima →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-12 py-4 bg-primary text-white rounded-lg hover:bg-red-700 font-black text-lg transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Salvar Briefing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
