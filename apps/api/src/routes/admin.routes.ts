import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';
import { UpdateSiteStatusRequest, UpdatePipelineRequest } from '@decolaweb/shared';

const router = Router();

// Todos os endpoints admin requerem autenticação + permissão de admin
router.use(authenticate, requireAdmin);

/**
 * GET /admin/clients
 * Lista todos os clientes (apenas não excluídos)
 */
router.get('/clients', async (req: AuthRequest, res) => {
  try {
    // Busca todos os clientes
    // Nota: deleted_at será filtrado quando a migration for aplicada
    // Por enquanto busca todos os clientes
    const { data: clients, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        subscription:subscriptions(*, plan:plans(*)),
        site_status(*)
      `)
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    // Filtra clientes excluídos manualmente (se deleted_at existir)
    let activeClients = (clients || []).filter((client: any) => {
      // Se deleted_at não existir, retorna true (inclui o cliente)
      // Se deleted_at existir e for null, retorna true (cliente ativo)
      // Se deleted_at existir e tiver valor, retorna false (cliente excluído)
      return !client.deleted_at;
    });

    // Garantir que todos os clientes tenham email (buscar do auth se necessário)
    activeClients = await Promise.all(
      activeClients.map(async (client: any) => {
        if (!client.email) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(client.id);
          if (authUser?.user?.email) {
            client.email = authUser.user.email;
          }
        }
        return client;
      })
    );

    return res.json({
      success: true,
      data: activeClients,
    });
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar clientes',
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
    const { status, notes }: UpdateSiteStatusRequest = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório',
      });
    }

    // Verifica se já existe
    const { data: existing } = await supabaseAdmin
      .from('site_status')
      .select('id')
      .eq('user_id', clientId)
      .single();

    let result;

    if (existing) {
      result = await supabaseAdmin
        .from('site_status')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', clientId)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('site_status')
        .insert({
          user_id: clientId,
          status,
          notes,
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
    const { stage, notes }: UpdatePipelineRequest = req.body;

    if (!stage) {
      return res.status(400).json({
        success: false,
        error: 'Estágio é obrigatório',
      });
    }

    // Verifica se já existe
    const { data: existing } = await supabaseAdmin
      .from('production_pipeline')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;

    if (existing) {
      result = await supabaseAdmin
        .from('production_pipeline')
        .update({
          stage,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('production_pipeline')
        .insert({
          user_id: userId,
          stage,
          notes,
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
      message: 'Pipeline atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar pipeline:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar pipeline',
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
    const { status, priority } = req.query;

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

    if (priority) {
      query = query.eq('priority', priority);
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

      if (priority) {
        fallbackQuery = fallbackQuery.eq('priority', priority);
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
        email, // Adicionar email ao perfil
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

export default router;

