import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';
import { UpdateSiteStatusRequest, UpdatePipelineRequest, CreateSiteStatusTemplateRequest, UpdateSiteStatusTemplateRequest, ReorderSiteStatusTemplatesRequest, CreatePlanRequest, UpdatePlanRequest } from '@decolaweb/shared';

const router = Router();

// Todos os endpoints admin requerem autenticação + permissão de admin
router.use(authenticate, requireAdmin);

/**
 * GET /admin/clients
 * Lista todos os clientes (apenas não excluídos)
 */
router.get('/clients', async (req: AuthRequest, res) => {
  try {
    // Busca todos os clientes primeiro sem joins complexos
    const { data: clients, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!clients || clients.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Filtra clientes excluídos manualmente (se deleted_at existir)
    let activeClients = (clients || []).filter((client: any) => {
      // Se deleted_at não existir, retorna true (inclui o cliente)
      // Se deleted_at existir e for null, retorna true (cliente ativo)
      // Se deleted_at existir e tiver valor, retorna false (cliente excluído)
      return !client.deleted_at;
    });

    // Buscar subscriptions e plans separadamente para cada cliente
    activeClients = await Promise.all(
      activeClients.map(async (client: any) => {
        try {
          // Buscar email do auth se não tiver
          if (!client.email) {
            try {
              const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(client.id);
              if (authUser?.user?.email) {
                client.email = authUser.user.email;
              }
            } catch (authError: any) {
              console.warn(`Erro ao buscar email do auth para cliente ${client.id}:`, authError.message);
            }
          }

          // Buscar subscriptions do cliente
          try {
            const { data: subscriptions } = await supabaseAdmin
              .from('subscriptions')
              .select('*, plan:plans(*)')
              .eq('user_id', client.id)
              .order('created_at', { ascending: false });

            if (subscriptions && subscriptions.length > 0) {
              // Pega a subscription ativa ou a mais recente
              const activeSubscription = subscriptions.find((s: any) => s.status === 'ativa') || subscriptions[0];
              client.subscription = activeSubscription;
              if (activeSubscription?.plan) {
                client.plan = activeSubscription.plan;
              }
            }
          } catch (subError: any) {
            console.warn(`Erro ao buscar subscriptions para cliente ${client.id}:`, subError.message);
          }

          // Se não tiver plano na subscription mas tiver plan_id no profile, buscar o plano
          if (!client.plan && client.plan_id) {
            try {
              const { data: plan, error: planError } = await supabaseAdmin
                .from('plans')
                .select('*')
                .eq('id', client.plan_id)
                .single();
              
              if (planError) {
                console.warn(`Erro ao buscar plano ${client.plan_id} para cliente ${client.id}:`, planError.message);
              } else if (plan) {
                client.plan = plan;
              }
            } catch (planError: any) {
              console.warn(`Erro ao buscar plano para cliente ${client.id}:`, planError.message);
            }
          }

          // Buscar site_status
          try {
            const { data: siteStatus } = await supabaseAdmin
              .from('site_status')
              .select('*')
              .eq('user_id', client.id)
              .order('updated_at', { ascending: false })
              .limit(1);
            
            if (siteStatus && siteStatus.length > 0) {
              client.site_status = siteStatus;
            }
          } catch (statusError: any) {
            console.warn(`Erro ao buscar site_status para cliente ${client.id}:`, statusError.message);
          }

          return client;
        } catch (clientError: any) {
          console.error(`Erro ao processar cliente ${client.id}:`, clientError.message);
          // Retorna o cliente mesmo com erro, para não quebrar a lista toda
          return client;
        }
      })
    );

    return res.json({
      success: true,
      data: activeClients,
    });
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar clientes',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * GET /admin/clients/:id
 * Retorna detalhes completos de um cliente
 */
router.get('/clients/:id', async (req: AuthRequest, res) => {
  try {
    const clientId = req.params.id;

    const [
      profileResult,
      subscriptionResult,
      siteStatusResult,
      briefingResult,
      invoicesResult,
      emailsResult,
      domainResult,
      ticketsResult,
      pipelineResult,
      contractResult,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', clientId).single(),
      supabaseAdmin
        .from('subscriptions')
        .select('*, plan:plans(*)')
        .eq('user_id', clientId)
        .single(),
      supabaseAdmin.from('site_status').select('*').eq('user_id', clientId).single(),
      supabaseAdmin.from('briefings').select('*').eq('user_id', clientId).single(),
      supabaseAdmin.from('invoices').select('*').eq('subscription_id', clientId),
      supabaseAdmin.from('emails_profissionais').select('*').eq('user_id', clientId),
      supabaseAdmin.from('domains').select('*').eq('user_id', clientId).single(),
      supabaseAdmin.from('support_tickets').select('*').eq('user_id', clientId),
      supabaseAdmin.from('production_pipeline').select('*').eq('user_id', clientId).single(),
      supabaseAdmin.from('contracts').select('*').eq('user_id', clientId).single(),
    ]);

    if (profileResult.error || !profileResult.data) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    // Garantir que o email esteja presente (pode estar no auth mas não na tabela profiles)
    let profileWithEmail = {
      ...profileResult.data,
    };

    // Se não tiver email no perfil, buscar do auth
    if (!profileWithEmail.email) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(clientId);
      if (authUser?.user?.email) {
        profileWithEmail.email = authUser.user.email;
      }
    }

    const clientData = {
      profile: profileWithEmail,
      subscription: subscriptionResult.data || null,
      siteStatus: siteStatusResult.data || null,
      briefing: briefingResult.data || null,
      invoices: invoicesResult.data || [],
      emails: emailsResult.data || [],
      domain: domainResult.data || null,
      tickets: ticketsResult.data || [],
      pipeline: pipelineResult.data || null,
      contract: contractResult.data || null,
    };

    return res.json({
      success: true,
      data: clientData,
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar cliente',
    });
  }
});

/**
 * PUT /admin/clients/:id
 * Atualiza os dados de um cliente
 */
router.put('/clients/:id', async (req: AuthRequest, res) => {
  try {
    const clientId = req.params.id;
    const { name, company_name, email, whatsapp } = req.body;

    if (!name && !company_name && !email && !whatsapp) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum dado fornecido para atualização',
      });
    }

    // Monta objeto com apenas os campos fornecidos
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (company_name) updateData.company_name = company_name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp; // Permite string vazia

    // Se email foi fornecido, precisamos atualizar no auth também
    if (email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        clientId,
        { email }
      );

      if (authError) {
        console.error('Erro ao atualizar email no auth:', authError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao atualizar e-mail',
        });
      }
    }

    // Atualiza no profiles
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: updatedProfile,
      message: 'Cliente atualizado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar cliente',
    });
  }
});

/**
 * PUT /admin/clients/:id/site-status
 * Atualiza o status do site de um cliente
 */
router.put('/clients/:id/site-status', async (req: AuthRequest, res) => {
  try {
    const clientId = req.params.id;
    const { status, notes, preview_url, live_url }: UpdateSiteStatusRequest = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório',
      });
    }

    // Valida status
    const validStatuses = [
      'aguardando_preenchimento',
      'briefing_enviado',
      'em_producao',
      'em_aprovacao',
      'site_publicado',
      'aguardando_briefing', // Compatibilidade
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status inválido. Use: ${validStatuses.join(', ')}`,
      });
    }

    // Verifica se já existe
    const { data: existing } = await supabaseAdmin
      .from('site_status')
      .select('id')
      .eq('user_id', clientId)
      .single();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes !== undefined) updateData.notes = notes;
    if (preview_url !== undefined) updateData.preview_url = preview_url;
    if (live_url !== undefined) updateData.live_url = live_url;

    let result;

    if (existing) {
      result = await supabaseAdmin
        .from('site_status')
        .update(updateData)
        .eq('user_id', clientId)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('site_status')
        .insert({
          user_id: clientId,
          ...updateData,
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return res.json({
      success: true,
      data: result.data,
      message: 'Status atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar status do site:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar status do site',
    });
  }
});

/**
 * GET /admin/pipeline
 * Retorna todos os clientes no pipeline de produção
 * Garante que TODOS os clientes apareçam, mesmo sem registro em production_pipeline
 */
router.get('/pipeline', async (req: AuthRequest, res) => {
  try {
    // Busca todos os registros de pipeline com dados do cliente
    // Usa join direto para garantir que todos apareçam
    const { data: pipelineRecords, error: pipelineError } = await supabaseAdmin
      .from('production_pipeline')
      .select(`
        *,
        user:profiles!production_pipeline_user_id_fkey(id, name, company_name, created_at)
      `)
      .order('updated_at', { ascending: false });

    if (pipelineError) {
      console.error('Erro ao buscar pipeline com join:', pipelineError);
      
      // Fallback: busca pipeline e clientes separadamente
      const { data: allPipelines } = await supabaseAdmin
        .from('production_pipeline')
        .select('*')
        .order('updated_at', { ascending: false });

      const { data: allClients } = await supabaseAdmin
        .from('profiles')
        .select('id, name, company_name, created_at')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (!allPipelines || !allClients) {
        throw new Error('Erro ao buscar dados do pipeline');
      }

      const clientsMap = new Map(
        (allClients || []).map((c: any) => [c.id, c])
      );

      const pipelineWithClients = (allPipelines || []).map((p: any) => ({
        ...p,
        user: clientsMap.get(p.user_id) || null,
      }));

      return res.json({
        success: true,
        data: pipelineWithClients || [],
      });
    }

    // Se o join funcionou, retorna os dados
    return res.json({
      success: true,
      data: pipelineRecords || [],
    });
  } catch (error: any) {
    console.error('Erro ao buscar pipeline:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar pipeline',
    });
  }
});

/**
 * PUT /admin/pipeline/:userId
 * Atualiza o estágio do pipeline de um cliente
 */
router.put('/pipeline/:userId', async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId;
    const { stage, notes } = req.body;

    console.log('📥 [API] Recebendo atualização de pipeline:', {
      userId,
      stage,
      notes,
      body: req.body,
    });

    if (!stage) {
      console.error('❌ [API] Stage não fornecido');
      return res.status(400).json({
        success: false,
        error: 'Estágio é obrigatório',
      });
    }

    // Valida se o stage existe na tabela pipeline_stages (se a tabela existir)
    const stageStr = String(stage);
    
    // Tenta buscar na tabela pipeline_stages (pode não existir ainda)
    const { data: stageExists, error: stageCheckError } = await supabaseAdmin
      .from('pipeline_stages')
      .select('slug, is_active')
      .eq('slug', stageStr)
      .single();

    // Se a tabela existe e encontrou o stage, valida se está ativo
    if (!stageCheckError && stageExists) {
      if (!stageExists.is_active) {
        console.error('❌ [API] Stage inativo:', stageStr);
        return res.status(400).json({
          success: false,
          error: `Estágio "${stageStr}" está inativo`,
        });
      }
    } else if (!stageCheckError && !stageExists) {
      // Tabela existe mas stage não encontrado - permite valores do enum antigo como fallback
      const validEnumStages = ['aguardando_briefing', 'copy', 'design', 'web', 'infraestrutura', 'dominio'];
      if (!validEnumStages.includes(stageStr)) {
        console.warn('⚠️ [API] Stage não encontrado na tabela pipeline_stages:', stageStr);
        // Permite continuar mesmo assim (a constraint foi removida)
      }
    }
    // Se stageCheckError existe, a tabela pipeline_stages não existe ainda - permite qualquer valor

    // Verifica se já existe
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('production_pipeline')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('❌ [API] Erro ao verificar pipeline existente:', existingError);
      throw existingError;
    }

    let result;

    if (existing) {
      console.log('🔄 [API] Atualizando pipeline existente');
      result = await supabaseAdmin
        .from('production_pipeline')
        .update({
          stage: String(stage), // Garante que é string
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      console.log('➕ [API] Criando novo registro de pipeline');
      result = await supabaseAdmin
        .from('production_pipeline')
        .insert({
          user_id: userId,
          stage: String(stage), // Garante que é string
          notes: notes || null,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('❌ [API] Erro do Supabase:', result.error);
      throw result.error;
    }

    console.log('✅ [API] Pipeline atualizado com sucesso:', result.data);

    return res.json({
      success: true,
      data: result.data,
      message: 'Pipeline atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('🔥 [API] Erro ao atualizar pipeline:', error);
    console.error('🔥 [API] Detalhes do erro:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar pipeline',
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
    });
  }
});

/**
 * GET /admin/pipeline/stages
 * Retorna todos os estágios do pipeline
 */
router.get('/pipeline/stages', async (req: AuthRequest, res) => {
  try {
    // Verifica se a tabela existe antes de buscar
    const { data: stages, error } = await supabaseAdmin
      .from('pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Se a tabela não existir, retorna array vazio (frontend usará fallback)
    if (error) {
      // Se for erro de tabela não encontrada, retorna array vazio
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('⚠️ Tabela pipeline_stages não existe. Retornando array vazio para usar fallback.');
        return res.json({
          success: true,
          data: [],
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      data: stages || [],
    });
  } catch (error: any) {
    console.error('Erro ao buscar stages:', error);
    // Em caso de erro, retorna array vazio para o frontend usar fallback
    return res.json({
      success: true,
      data: [],
    });
  }
});

/**
 * POST /admin/pipeline/stages
 * Cria um novo estágio
 */
router.post('/pipeline/stages', async (req: AuthRequest, res) => {
  try {
    const { name, slug, color } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Nome e slug são obrigatórios',
      });
    }

    // Busca o maior display_order para colocar no final
    const { data: lastStage } = await supabaseAdmin
      .from('pipeline_stages')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const displayOrder = lastStage?.display_order ? lastStage.display_order + 1 : 1;

    const { data: newStage, error } = await supabaseAdmin
      .from('pipeline_stages')
      .insert({
        name,
        slug,
        display_order: displayOrder,
        color: color || '#FF002E',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: newStage,
      message: 'Estágio criado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao criar stage:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao criar stage',
    });
  }
});

/**
 * PUT /admin/pipeline/stages/reorder
 * Reordena os estágios (recebe array de {id, display_order})
 * IMPORTANTE: Esta rota deve vir ANTES de /:id para não capturar "reorder" como ID
 */
router.put('/pipeline/stages/reorder', async (req: AuthRequest, res) => {
  try {
    const { stages } = req.body; // Array de {id, display_order}

    if (!Array.isArray(stages)) {
      return res.status(400).json({
        success: false,
        error: 'Array de stages é obrigatório',
      });
    }

    // Atualiza cada stage
    const updates = stages.map((stage: any) =>
      supabaseAdmin
        .from('pipeline_stages')
        .update({ display_order: stage.display_order })
        .eq('id', stage.id)
    );

    await Promise.all(updates);

    return res.json({
      success: true,
      message: 'Ordem dos estágios atualizada com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao reordenar stages:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao reordenar stages',
    });
  }
});

/**
 * PUT /admin/pipeline/stages/:id
 * Atualiza um estágio
 * IMPORTANTE: Esta rota deve vir DEPOIS de /reorder para não capturar "reorder" como ID
 */
router.put('/pipeline/stages/:id', async (req: AuthRequest, res) => {
  try {
    const stageId = req.params.id;
    const { name, slug, color, is_active } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (color) updateData.color = color;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedStage, error } = await supabaseAdmin
      .from('pipeline_stages')
      .update(updateData)
      .eq('id', stageId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: updatedStage,
      message: 'Estágio atualizado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar stage:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar stage',
    });
  }
});

/**
 * DELETE /admin/pipeline/stages/:id
 * Exclui um estágio (soft delete - marca como inativo)
 */
router.delete('/pipeline/stages/:id', async (req: AuthRequest, res) => {
  try {
    const stageId = req.params.id;

    // Busca o slug do estágio antes de verificar clientes
    const { data: stageData } = await supabaseAdmin
      .from('pipeline_stages')
      .select('slug')
      .eq('id', stageId)
      .single();

    if (!stageData) {
      return res.status(404).json({
        success: false,
        error: 'Estágio não encontrado',
      });
    }

    // Verifica se há clientes neste estágio
    const { data: clientsInStage } = await supabaseAdmin
      .from('production_pipeline')
      .select('id')
      .eq('stage', stageData.slug)
      .limit(1);

    if (clientsInStage && clientsInStage.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir um estágio que possui clientes. Mova os clientes primeiro.',
      });
    }

    // Marca como inativo ao invés de deletar
    const { error } = await supabaseAdmin
      .from('pipeline_stages')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', stageId);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: 'Estágio excluído com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao excluir stage:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao excluir stage',
    });
  }
});

/**
 * GET /admin/tickets
 * Lista todos os tickets de suporte
 */
router.get('/tickets', async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    // Busca tickets com perfil do usuário
    let query = supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        user:profiles!support_tickets_user_id_fkey(name, company_name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Erro ao buscar tickets:', error);
      // Se falhar com join, tenta sem join
      let fallbackQuery = supabaseAdmin
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        fallbackQuery = fallbackQuery.eq('status', status);
      }

      const { data: fallbackTickets, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        throw fallbackError;
      }

      // Busca perfis separadamente
      if (fallbackTickets && fallbackTickets.length > 0) {
        const userIds = fallbackTickets.map((t: any) => t.user_id);
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, name, company_name, email')
          .in('id', userIds);

        const profilesMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

        const ticketsWithProfiles = fallbackTickets.map((ticket: any) => ({
          ...ticket,
          user: profilesMap.get(ticket.user_id) || null,
        }));

        return res.json({
          success: true,
          data: ticketsWithProfiles || [],
        });
      }

      return res.json({
        success: true,
        data: fallbackTickets || [],
      });
    }

    return res.json({
      success: true,
      data: tickets || [],
    });
  } catch (error: any) {
    console.error('Erro ao buscar tickets:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar tickets',
    });
  }
});

/**
 * GET /admin/tickets/:id
 * Retorna detalhes de um ticket específico (admin)
 */
router.get('/tickets/:id', async (req: AuthRequest, res) => {
  try {
    const ticketId = req.params.id;
    console.log('🔍 [ADMIN] Buscando ticket:', ticketId);

    // Busca o ticket primeiro
    const { data: ticketData, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticketData) {
      console.error('❌ [ADMIN] Ticket não encontrado:', {
        ticketId,
        error: ticketError?.message,
        code: ticketError?.code,
      });
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    // Busca o perfil do usuário separadamente
    let userProfile: any = null;
    if (ticketData.user_id) {
      console.log('🔍 [ADMIN] Buscando perfil do usuário:', ticketData.user_id);
      
      // Primeiro tenta buscar todos os campos do perfil
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', ticketData.user_id)
        .single();

      if (profileError) {
        console.warn('⚠️ [ADMIN] Erro ao buscar perfil:', profileError.message);
        console.warn('⚠️ [ADMIN] Detalhes do erro:', JSON.stringify(profileError, null, 2));
        
        // Tenta buscar do auth.users como fallback
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(ticketData.user_id);
          if (authUser?.user) {
            userProfile = {
              id: ticketData.user_id,
              name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'N/A',
              company_name: authUser.user.user_metadata?.company_name || null,
              email: authUser.user.email || null,
            };
            console.log('✅ [ADMIN] Perfil obtido do auth.users:', userProfile);
          } else {
            // Se não encontrou no auth.users também, cria um objeto mínimo com o user_id
            userProfile = {
              id: ticketData.user_id,
              name: null,
              company_name: null,
              email: null,
            };
          }
        } catch (authError: any) {
          console.error('❌ [ADMIN] Erro ao buscar do auth.users:', authError.message);
          // Cria um objeto mínimo com o user_id mesmo em caso de erro
          userProfile = {
            id: ticketData.user_id,
            name: null,
            company_name: null,
            email: null,
          };
        }
      } else if (profile) {
        userProfile = {
          id: profile.id,
          name: profile.name,
          company_name: profile.company_name,
          email: profile.email,
        };
        console.log('✅ [ADMIN] Perfil encontrado:', JSON.stringify(userProfile, null, 2));
        console.log('📊 [ADMIN] Company Name:', userProfile.company_name);
        console.log('📊 [ADMIN] Name:', userProfile.name);
        console.log('📊 [ADMIN] Raw Profile:', JSON.stringify(profile, null, 2));
      } else {
        console.warn('⚠️ [ADMIN] Perfil não encontrado, mas não houve erro');
        // Se não encontrou perfil mas não houve erro, tenta buscar do auth.users
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(ticketData.user_id);
          if (authUser?.user) {
            userProfile = {
              id: ticketData.user_id,
              name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'N/A',
              company_name: authUser.user.user_metadata?.company_name || null,
              email: authUser.user.email || null,
            };
            console.log('✅ [ADMIN] Perfil obtido do auth.users (fallback):', userProfile);
          } else {
            userProfile = {
              id: ticketData.user_id,
              name: null,
              company_name: null,
              email: null,
            };
          }
        } catch (authError: any) {
          console.error('❌ [ADMIN] Erro ao buscar do auth.users:', authError.message);
          userProfile = {
            id: ticketData.user_id,
            name: null,
            company_name: null,
            email: null,
          };
        }
      }
    }

    // Monta o ticket com o perfil do usuário (sempre retorna user, mesmo que seja mínimo)
    const ticket = {
      ...ticketData,
      user: userProfile,
    };

    console.log('✅ [ADMIN] Ticket encontrado:', ticket?.id);
    console.log('📊 [ADMIN] User Profile Final:', userProfile);
    console.log('📊 [ADMIN] Company Name Final:', userProfile?.company_name);
    console.log('📊 [ADMIN] Name Final:', userProfile?.name);
    return res.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('❌ [ADMIN] Erro ao buscar ticket:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar ticket',
    });
  }
});

/**
 * GET /admin/tickets/:id/messages
 * Retorna todas as mensagens de um ticket (admin)
 */
router.get('/tickets/:id/messages', async (req: AuthRequest, res) => {
  try {
    const ticketId = req.params.id;

    const { data: messages, error } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar mensagens',
    });
  }
});

/**
 * PUT /admin/tickets/:id/status
 * Atualiza o status de um ticket
 */
router.put('/tickets/:id/status', async (req: AuthRequest, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório',
      });
    }

    // Valida status
    const validStatuses = ['aberto', 'em_andamento', 'respondido', 'fechado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido',
      });
    }

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !ticket) {
      console.error('Erro ao atualizar status do ticket:', error);
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    return res.json({
      success: true,
      data: ticket,
      message: 'Status atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status do ticket:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar status do ticket',
    });
  }
});

/**
 * POST /admin/tickets/:id/messages
 * Admin responde a um ticket
 */
router.post('/tickets/:id/messages', async (req: AuthRequest, res) => {
  try {
    const ticketId = req.params.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória',
      });
    }

    // Cria a mensagem
    const { data: newMessage, error } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'admin',
        message,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Atualiza o status do ticket
    await supabaseAdmin
      .from('support_tickets')
      .update({
        status: 'respondido',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    return res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Mensagem enviada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem',
    });
  }
});

/**
 * POST /admin/clients
 * Cria um novo cliente completo (usuário + perfil + todos os registros)
 */
router.post('/clients', async (req: AuthRequest, res) => {
  try {
    const {
      email,
      password,
      name,
      company_name,
      whatsapp,
      plan_id,
    } = req.body;

    // Validações
    if (!email || !password || !name || !company_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, senha, nome e nome da empresa são obrigatórios',
      });
    }

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
    });

    if (authError || !authData.user) {
      console.error('Erro ao criar usuário:', authError);
      return res.status(400).json({
        success: false,
        error: authError?.message || 'Erro ao criar usuário',
      });
    }

    const userId = authData.user.id;

    // 2. Buscar plano (se não fornecido, pega o primeiro ativo)
    let finalPlanId = plan_id;
    if (!finalPlanId) {
      const { data: activePlan } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();

      finalPlanId = activePlan?.id || null;
    }

    // 3. Criar perfil do cliente
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        role: 'client',
        name,
        company_name,
        whatsapp: whatsapp || null,
        plan_id: finalPlanId,
      })
      .select()
      .single();

    if (profileError) {
      // Se falhar, tenta deletar o usuário criado
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // 4. Criar todos os registros relacionados
    const results: any = {};

    // 4.1. Subscription
    if (finalPlanId) {
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: finalPlanId,
          status: 'ativa',
          started_at: new Date().toISOString(),
          renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_method: 'pendente',
        })
        .select()
        .single();

      if (subError) {
        console.error('Erro ao criar subscription:', subError);
      } else {
        results.subscription = 'criado';
      }
    }

    // 4.2. Site Status
    const { data: siteStatus, error: statusError } = await supabaseAdmin
      .from('site_status')
      .insert({
        user_id: userId,
        status: 'aguardando_briefing',
        notes: 'Cliente recém cadastrado. Aguardando envio do briefing inicial.',
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (statusError) {
      console.error('Erro ao criar site_status:', statusError);
    } else {
      results.siteStatus = 'criado';
    }

    // 4.3. Production Pipeline
    const { data: pipeline, error: pipelineError } = await supabaseAdmin
      .from('production_pipeline')
      .insert({
        user_id: userId,
        stage: 'aguardando_briefing',
        notes: 'Cliente novo. Aguardando preenchimento do briefing.',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pipelineError) {
      console.error('Erro ao criar pipeline:', pipelineError);
    } else {
      results.pipeline = 'criado';
    }

    // 4.4. Contract
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('contracts')
      .insert({
        user_id: userId,
        status: 'pendente',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (contractError) {
      console.error('Erro ao criar contract:', contractError);
    } else {
      results.contract = 'criado';
    }

    // 4.5. Briefing
    const { data: briefing, error: briefingError } = await supabaseAdmin
      .from('briefings')
      .insert({
        user_id: userId,
        status: 'nao_enviado',
        answers: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (briefingError) {
      console.error('Erro ao criar briefing:', briefingError);
    } else {
      results.briefing = 'criado';
    }

    return res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso!',
      data: {
        user: {
          id: userId,
          email: authData.user.email,
        },
        profile,
        results,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao criar cliente',
    });
  }
});

/**
 * DELETE /admin/clients/:id
 * Soft delete de um cliente (remove acesso e oculta do painel)
 */
router.delete('/clients/:id', async (req: AuthRequest, res) => {
  try {
    const clientId = req.params.id;

    // Verificar se o cliente existe e não está deletado
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', clientId)
      .eq('role', 'client')
      .is('deleted_at', null)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    // 1. Marcar como deletado (soft delete) no banco
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', clientId);

    if (updateError) {
      throw updateError;
    }

    // 2. Desabilitar acesso do usuário no Supabase Auth (não deletar, apenas bloquear)
    // Usando user_metadata para marcar como banido
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        clientId,
        {
          user_metadata: {
            banned: true,
            banned_at: new Date().toISOString(),
          },
        }
      );

      if (authError) {
        console.warn('Aviso: Não foi possível desabilitar acesso do usuário:', authError);
        // Não falha a operação se não conseguir desabilitar o auth
      }
    } catch (authErr) {
      console.warn('Aviso: Erro ao desabilitar acesso do usuário:', authErr);
      // Continua mesmo se falhar
    }

    return res.json({
      success: true,
      message: 'Cliente excluído com sucesso. Acesso removido.',
    });
  } catch (error: any) {
    console.error('Erro ao excluir cliente:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao excluir cliente',
    });
  }
});

/**
 * GET /admin/financeiro
 * Retorna overview financeiro
 */
router.get('/financeiro', async (req: AuthRequest, res) => {
  try {
    // Busca todas as assinaturas ativas com planos
    const { data: subsWithoutJoin, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('status', 'ativa');

    if (subsError) {
      throw subsError;
    }

    // Busca perfis dos clientes separadamente (mais confiável)
    const subscriptionsWithUsers = await Promise.all(
      (subsWithoutJoin || []).map(async (sub: any) => {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, name, company_name, email')
          .eq('id', sub.user_id)
          .single();

        if (profileError) {
          console.error(`Erro ao buscar perfil para user_id ${sub.user_id}:`, profileError);
        }

        return {
          ...sub,
          user: profile || null,
        };
      })
    );

    // Conta clientes ativos
    const activeClients = subscriptionsWithUsers.length;

    // Calcula receita mensal
    const monthlyRevenue = subscriptionsWithUsers.reduce((acc, sub) => {
      return acc + (sub.plan?.price_monthly || 0);
    }, 0);

    // Busca faturas recentes
    const { data: recentInvoices } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .order('due_date', { ascending: false })
      .limit(20);

    return res.json({
      success: true,
      data: {
        activeClients,
        monthlyRevenue,
        subscriptions: subscriptionsWithUsers || [],
        recentInvoices: recentInvoices || [],
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados financeiros:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar dados financeiros',
    });
  }
});

/**
 * GET /admin/emails
 * Lista todos os e-mails profissionais de todos os clientes
 */
router.get('/emails', async (req: AuthRequest, res) => {
  try {
    // Busca todos os e-mails
    const { data: emails, error: emailsError } = await supabaseAdmin
      .from('emails_profissionais')
      .select('*')
      .order('created_at', { ascending: false });

    if (emailsError) {
      console.error('Erro ao buscar e-mails:', emailsError);
      throw emailsError;
    }

    // Para cada e-mail, busca informações do cliente
    const emailsWithClient = await Promise.all(
      (emails || []).map(async (email: any) => {
        // Busca perfil do cliente
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, name, company_name')
          .eq('id', email.user_id)
          .single();

        // Busca email do auth.users
        let clientEmail = null;
        if (profile) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          if (authUser?.user?.email) {
            clientEmail = authUser.user.email;
          }
        }

        return {
          ...email,
          profile: profile
            ? {
                id: profile.id,
                name: profile.name,
                company_name: profile.company_name,
                email: clientEmail,
              }
            : null,
        };
      })
    );

    return res.json({
      success: true,
      data: emailsWithClient,
    });
  } catch (error: any) {
    console.error('Erro ao buscar e-mails:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar e-mails',
    });
  }
});

/**
 * PUT /admin/clients/:id/domain/status
 * Atualiza o status do domínio de um cliente
 */
router.put('/clients/:id/domain/status', async (req: AuthRequest, res) => {
  try {
    const clientId = req.params.id;
    const { status, domain: newDomain } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório',
      });
    }

    // Valida status
    const validStatuses = ['pendente', 'aguardando_dns', 'configurando', 'ativo'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status inválido. Use: ${validStatuses.join(', ')}`,
      });
    }

    // Verifica se já existe um domínio para este cliente
    const { data: existing } = await supabaseAdmin
      .from('domains')
      .select('id')
      .eq('user_id', clientId)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Domínio não encontrado para este cliente',
      });
    }

    // Atualiza o status e/ou o domínio
    const updateData: any = {
      status,
    };

    // Se um novo domínio foi fornecido, atualiza
    if (newDomain !== undefined && newDomain !== null && newDomain.trim() !== '') {
      updateData.domain = newDomain.trim().toLowerCase();
    }

    // Só adiciona updated_at se a coluna existir (para compatibilidade)
    // O trigger cuidará disso automaticamente se existir
    const { data: updatedDomain, error } = await supabaseAdmin
      .from('domains')
      .update(updateData)
      .eq('user_id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status do domínio:', error);
      throw error;
    }

    return res.json({
      success: true,
      data: updatedDomain,
      message: 'Status do domínio atualizado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status do domínio:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar status do domínio',
    });
  }
});

// ==================== SITE STATUS TEMPLATES ====================

/**
 * GET /admin/site-status-templates
 * Lista todos os templates de status do site
 */
router.get('/site-status-templates', async (req: AuthRequest, res) => {
  try {
    const { data: templates, error } = await supabaseAdmin
      .from('site_status_templates')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: templates || [],
    });
  } catch (error: any) {
    console.error('Erro ao buscar templates de status:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar templates de status',
    });
  }
});

/**
 * POST /admin/site-status-templates
 * Cria um novo template de status
 */
router.post('/site-status-templates', async (req: AuthRequest, res) => {
  try {
    const templateData: CreateSiteStatusTemplateRequest = req.body;

    // Validações
    if (!templateData.slug || !templateData.name || !templateData.headline) {
      return res.status(400).json({
        success: false,
        error: 'Slug, name e headline são obrigatórios',
      });
    }

    // Verifica se o slug já existe
    const { data: existing } = await supabaseAdmin
      .from('site_status_templates')
      .select('id')
      .eq('slug', templateData.slug)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um template com este slug',
      });
    }

    // Se não forneceu display_order, pega o próximo
    if (templateData.display_order === undefined) {
      const { data: lastTemplate } = await supabaseAdmin
        .from('site_status_templates')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      templateData.display_order = (lastTemplate?.display_order || 0) + 1;
    }

    const { data: newTemplate, error } = await supabaseAdmin
      .from('site_status_templates')
      .insert({
        slug: templateData.slug,
        name: templateData.name,
        headline: templateData.headline,
        subheadline: templateData.subheadline || null,
        color_scheme: templateData.color_scheme || 'gray',
        display_order: templateData.display_order || 0,
        is_active: templateData.is_active !== undefined ? templateData.is_active : true,
        buttons: templateData.buttons || [],
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: newTemplate,
      message: 'Template criado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao criar template de status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao criar template de status',
    });
  }
});

/**
 * PUT /admin/site-status-templates/:id
 * Atualiza um template de status
 */
router.put('/site-status-templates/:id', async (req: AuthRequest, res) => {
  try {
    const templateId = req.params.id;
    const updateData: UpdateSiteStatusTemplateRequest = req.body;

    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.headline !== undefined) updateFields.headline = updateData.headline;
    if (updateData.subheadline !== undefined) updateFields.subheadline = updateData.subheadline;
    if (updateData.color_scheme !== undefined) updateFields.color_scheme = updateData.color_scheme;
    if (updateData.display_order !== undefined) updateFields.display_order = updateData.display_order;
    if (updateData.is_active !== undefined) updateFields.is_active = updateData.is_active;
    if (updateData.buttons !== undefined) updateFields.buttons = updateData.buttons;

    const { data: updatedTemplate, error } = await supabaseAdmin
      .from('site_status_templates')
      .update(updateFields)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    return res.json({
      success: true,
      data: updatedTemplate,
      message: 'Template atualizado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar template de status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar template de status',
    });
  }
});

/**
 * PUT /admin/site-status-templates/reorder
 * Reordena os templates de status
 */
router.put('/site-status-templates/reorder', async (req: AuthRequest, res) => {
  try {
    const { templates }: ReorderSiteStatusTemplatesRequest = req.body;

    if (!templates || !Array.isArray(templates)) {
      return res.status(400).json({
        success: false,
        error: 'Lista de templates é obrigatória',
      });
    }

    // Atualiza cada template
    const updates = templates.map(({ id, display_order }) =>
      supabaseAdmin
        .from('site_status_templates')
        .update({ display_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    await Promise.all(updates);

    return res.json({
      success: true,
      message: 'Ordem dos templates atualizada com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao reordenar templates:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao reordenar templates',
    });
  }
});

/**
 * DELETE /admin/site-status-templates/:id
 * Deleta um template de status
 */
router.delete('/site-status-templates/:id', async (req: AuthRequest, res) => {
  try {
    const templateId = req.params.id;

    const { error } = await supabaseAdmin
      .from('site_status_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: 'Template deletado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao deletar template:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao deletar template',
    });
  }
});

// ==================== PLANS ====================

/**
 * GET /admin/plans
 * Lista todos os planos
 */
router.get('/plans', async (req: AuthRequest, res) => {
  try {
    const { data: plans, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: plans || [],
    });
  } catch (error: any) {
    console.error('Erro ao buscar planos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar planos',
    });
  }
});

/**
 * GET /admin/plans/:id
 * Busca um plano específico
 */
router.get('/plans/:id', async (req: AuthRequest, res) => {
  try {
    const planId = req.params.id;

    const { data: plan, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Plano não encontrado',
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('Erro ao buscar plano:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar plano',
    });
  }
});

/**
 * POST /admin/plans
 * Cria um novo plano
 */
router.post('/plans', async (req: AuthRequest, res) => {
  try {
    const planData: CreatePlanRequest = req.body;

    // Validações
    if (!planData.name || !planData.price_monthly) {
      return res.status(400).json({
        success: false,
        error: 'Nome e preço mensal são obrigatórios',
      });
    }

    if (planData.price_monthly < 0) {
      return res.status(400).json({
        success: false,
        error: 'O preço mensal deve ser maior ou igual a zero',
      });
    }

    const { data: newPlan, error } = await supabaseAdmin
      .from('plans')
      .insert({
        name: planData.name,
        price_monthly: planData.price_monthly,
        description: planData.description || null,
        is_active: planData.is_active !== undefined ? planData.is_active : true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: newPlan,
      message: 'Plano criado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao criar plano:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao criar plano',
    });
  }
});

/**
 * PUT /admin/plans/:id
 * Atualiza um plano
 */
router.put('/plans/:id', async (req: AuthRequest, res) => {
  try {
    const planId = req.params.id;
    const updateData: UpdatePlanRequest = req.body;

    // Validações
    if (updateData.price_monthly !== undefined && updateData.price_monthly < 0) {
      return res.status(400).json({
        success: false,
        error: 'O preço mensal deve ser maior ou igual a zero',
      });
    }

    const updateFields: any = {};

    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.price_monthly !== undefined) updateFields.price_monthly = updateData.price_monthly;
    if (updateData.description !== undefined) updateFields.description = updateData.description || null;
    if (updateData.is_active !== undefined) updateFields.is_active = updateData.is_active;

    const { data: updatedPlan, error } = await supabaseAdmin
      .from('plans')
      .update(updateFields)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Plano não encontrado',
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      data: updatedPlan,
      message: 'Plano atualizado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar plano',
    });
  }
});

/**
 * DELETE /admin/plans/:id
 * Deleta um plano (soft delete - desativa)
 */
router.delete('/plans/:id', async (req: AuthRequest, res) => {
  try {
    const planId = req.params.id;

    // Verifica se há assinaturas ativas usando este plano
    const { data: activeSubscriptions, error: checkError } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('plan_id', planId)
      .eq('status', 'ativa')
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      // Se há assinaturas ativas, apenas desativa o plano
      const { data: updatedPlan, error } = await supabaseAdmin
        .from('plans')
        .update({ is_active: false })
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        data: updatedPlan,
        message: 'Plano desativado com sucesso (há assinaturas ativas usando este plano)',
      });
    }

    // Se não há assinaturas ativas, pode deletar
    const { error } = await supabaseAdmin
      .from('plans')
      .delete()
      .eq('id', planId);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: 'Plano deletado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao deletar plano:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao deletar plano',
    });
  }
});

export default router;

