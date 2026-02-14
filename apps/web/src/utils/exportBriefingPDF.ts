import jsPDF from 'jspdf';

interface BriefingData {
  company_name?: string;
  segment?: string;
  full_name?: string;
  commercial_email?: string;
  whatsapp_commercial?: string;
  landline?: string;
  address?: string;
  has_website?: boolean | string;
  current_website_url?: string;
  company_description?: string;
  target_audience?: string;
  service_region?: string;
  main_services?: string;
  differentials?: string;
  business_hours?: string;
  social_links?: string;
  has_brand_identity?: boolean | string;
  brand_assets_links?: string;
  main_colors?: string;
  forbidden_colors?: string;
  general_notes?: string;
  answers?: Record<string, any>;
}

interface ClientData {
  name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
}

export function exportBriefingToPDF(
  briefing: BriefingData,
  clientData: ClientData,
  updatedAt?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper para pegar valor
  const getValue = (key: string) => {
    return briefing[key as keyof BriefingData] || briefing.answers?.[key] || '';
  };

  // Helper para adicionar texto com quebra de linha
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; isBold?: boolean; color?: [number, number, number] }) => {
    const fontSize = options?.fontSize || 10;
    const isBold = options?.isBold || false;
    const color = options?.color || [0, 0, 0];
    
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    const lines = doc.splitTextToSize(String(text), maxWidth - (x - margin));
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4);
  };

  // Helper para verificar se precisa de nova página
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Cabeçalho
  doc.setFillColor(255, 0, 46); // #FF002E
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Briefing do Projeto', margin, 25);
  
  yPosition = 50;

  // Dados do Cliente
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Cliente', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (clientData.name) {
    doc.text(`Nome: ${clientData.name}`, margin, yPosition);
    yPosition += 7;
  }
  
  if (clientData.company_name) {
    doc.text(`Empresa: ${clientData.company_name}`, margin, yPosition);
    yPosition += 7;
  }
  
  if (clientData.email) {
    doc.text(`E-mail: ${clientData.email}`, margin, yPosition);
    yPosition += 7;
  }
  
  if (clientData.phone) {
    doc.text(`Telefone: ${clientData.phone}`, margin, yPosition);
    yPosition += 7;
  }

  if (updatedAt) {
    yPosition += 3;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Última atualização: ${updatedAt}`, margin, yPosition);
    yPosition += 10;
  }

  yPosition += 5;

  // Seção 1: Dados da Empresa
  checkNewPage(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('1. Dados da Empresa', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const companyFields = [
    { label: 'Nome da Empresa', key: 'company_name', required: true },
    { label: 'Segmento/Nicho', key: 'segment', required: true },
    { label: 'Nome Completo', key: 'full_name', required: true },
    { label: 'E-mail Comercial', key: 'commercial_email', required: false },
    { label: 'WhatsApp Comercial', key: 'whatsapp_commercial', required: true },
    { label: 'Telefone Fixo', key: 'landline', required: false },
    { label: 'Endereço', key: 'address', required: false },
  ];

  companyFields.forEach(field => {
    const value = getValue(field.key);
    if (value) {
      checkNewPage(15);
      const label = `${field.label}${field.required ? ' *' : ''}:`;
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      const height = addText(String(value), margin, yPosition);
      yPosition += height + 3;
    }
  });

  // Seção 2: Estrutura do Site
  checkNewPage(30);
  yPosition += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Estrutura do Site', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const hasWebsite = getValue('has_website');
  if (hasWebsite !== undefined && hasWebsite !== '') {
    checkNewPage(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Já possui site? *:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(hasWebsite === true || hasWebsite === 'true' ? 'Sim' : 'Não', margin, yPosition);
    yPosition += 8;
  }

  const structureFields = [
    { label: 'Link do site atual', key: 'current_website_url', required: true },
    { label: 'Descrição completa da empresa', key: 'company_description', required: true, multiline: true },
    { label: 'Público-alvo', key: 'target_audience', required: true, multiline: true },
    { label: 'Região de Atendimento', key: 'service_region', required: true },
    { label: 'Principais produtos/serviços', key: 'main_services', required: true, multiline: true },
    { label: 'Principais diferenciais', key: 'differentials', required: true, multiline: true },
    { label: 'Horário de atendimento', key: 'business_hours', required: false },
    { label: 'Links das Redes Sociais', key: 'social_links', required: false, multiline: true },
  ];

  structureFields.forEach(field => {
    const value = getValue(field.key);
    if (value) {
      checkNewPage(15);
      const label = `${field.label}${field.required ? ' *' : ''}:`;
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      const height = addText(String(value), margin, yPosition);
      yPosition += height + 3;
    }
  });

  // Seção 3: Identidade Visual
  checkNewPage(30);
  yPosition += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Identidade Visual', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const hasBrandIdentity = getValue('has_brand_identity');
  if (hasBrandIdentity !== undefined && hasBrandIdentity !== '') {
    checkNewPage(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Já possui identidade visual definida? *:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(hasBrandIdentity === true || hasBrandIdentity === 'true' ? 'Sim' : 'Não', margin, yPosition);
    yPosition += 8;
  }

  const brandFields = [
    { label: 'Links dos arquivos da sua marca', key: 'brand_assets_links', required: true, multiline: true },
    { label: 'Cores principais', key: 'main_colors', required: true },
    { label: 'Cores que NÃO quer de jeito nenhum', key: 'forbidden_colors', required: false },
  ];

  brandFields.forEach(field => {
    const value = getValue(field.key);
    if (value) {
      checkNewPage(15);
      const label = `${field.label}${field.required ? ' *' : ''}:`;
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      const height = addText(String(value), margin, yPosition);
      yPosition += height + 3;
    }
  });

  // Seção 4: Observações Finais
  const generalNotes = getValue('general_notes');
  if (generalNotes) {
    checkNewPage(30);
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Observações Finais', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setFont('helvetica', 'bold');
    doc.text('Observações gerais e pedidos específicos:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    const height = addText(String(generalNotes), margin, yPosition);
    yPosition += height + 3;
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin - 30,
      pageHeight - 10
    );
  }

  // Salvar PDF
  const fileName = `Briefing_${clientData.company_name || clientData.name || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

