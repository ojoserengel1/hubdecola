import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /domain/request
 * Cliente solicita configuração de domínio
 */
router.post('/request', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { has_domain, domain, platform, login, password, domain_options } = req.body;

    if (!has_domain || !['sim', 'nao'].includes(has_domain)) {
      return res.status(400).json({
        success: false,
        error: 'É necessário informar se você já possui um domínio (sim/nao)',
      });
    }

    // Se já tem domínio, valida campos obrigatórios
    if (has_domain === 'sim') {
      if (!domain || !platform || !login || !password) {
        return res.status(400).json({
          success: false,
          error: 'Para domínio existente, é necessário informar: domínio, plataforma, login e senha',
        });
      }
    }

    // Se não tem domínio, valida opções
    if (has_domain === 'nao') {
      if (!domain_options || domain_options.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'É necessário informar pelo menos uma opção de domínio desejada',
        });
      }
    }

    // Verifica se já existe uma solicitação pendente para este usuário
    const { data: existingDomain } = await supabaseAdmin
      .from('domains')
      .select('id, status')
      .eq('user_id', userId)
      .in('status', ['aguardando_dns', 'configurando', 'pendente'])
      .single();

    if (existingDomain) {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma solicitação de domínio em andamento. Aguarde a conclusão ou entre em contato com o suporte.',
      });
    }

    // Prepara os dados para salvar
    const domainData: any = {
      user_id: userId,
      status: 'pendente',
    };

    if (has_domain === 'sim') {
      // Domínio existente
      domainData.domain = domain.trim().toLowerCase();
      domainData.notes = `Domínio existente registrado em ${platform}.\nLogin: ${login}\nSenha: [fornecida pelo cliente]`;
    } else {
      // Novo domínio - salva as opções nas notas
      domainData.notes = `Solicitação de novo domínio.\nOpções desejadas:\n${domain_options}`;
      // O domínio será definido pelo admin após verificar disponibilidade
      // Não define domain (deixa como NULL) - será preenchido pelo admin
    }

    // Cria ou atualiza o registro de domínio
    const { data: existingRecord } = await supabaseAdmin
      .from('domains')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;

    if (existingRecord) {
      // Atualiza registro existente
      result = await supabaseAdmin
        .from('domains')
        .update(domainData)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Cria novo registro
      result = await supabaseAdmin
        .from('domains')
        .insert(domainData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Erro ao criar/atualizar solicitação de domínio:', result.error);
      throw result.error;
    }

    return res.json({
      success: true,
      data: result.data,
      message: 'Solicitação de domínio enviada com sucesso! Nossa equipe entrará em contato em breve.',
    });
  } catch (error: any) {
    console.error('Erro ao solicitar domínio:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao solicitar domínio',
    });
  }
});

export default router;

