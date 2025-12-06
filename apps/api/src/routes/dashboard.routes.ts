import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';
import { DashboardData } from '@decolaweb/shared';

const router = Router();

/**
 * GET /dashboard
 * Retorna todos os dados necessários para o dashboard do cliente
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Busca todos os dados em paralelo
    const [
      profileResult,
      subscriptionResult,
      siteStatusResult,
      invoicesResult,
      briefingResult,
      emailsResult,
      domainResult,
      contractResult,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin
        .from('subscriptions')
        .select('*, plan:plans(*)')
        .eq('user_id', userId)
        .single(),
      supabaseAdmin.from('site_status').select('*').eq('user_id', userId).single(),
      supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('subscription_id', userId)
        .order('due_date', { ascending: false })
        .limit(5),
      supabaseAdmin.from('briefings').select('*').eq('user_id', userId).single(),
      supabaseAdmin.from('emails_profissionais').select('*').eq('user_id', userId),
      supabaseAdmin.from('domains').select('*').eq('user_id', userId).single(),
      supabaseAdmin.from('contracts').select('*').eq('user_id', userId).single(),
    ]);

    const dashboardData: DashboardData = {
      profile: {
        ...profileResult.data,
        email: req.user!.email,
      },
      subscription: subscriptionResult.data || undefined,
      siteStatus: siteStatusResult.data || undefined,
      recentInvoices: invoicesResult.data || [],
      briefing: briefingResult.data || undefined,
      emails: emailsResult.data || [],
      domain: domainResult.data || undefined,
      contract: contractResult.data || undefined,
    };

    return res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do dashboard',
    });
  }
});

/**
 * POST /dashboard/initialize
 * Inicializa todos os registros necessários para um cliente
 * Útil para corrigir clientes que foram criados antes do trigger automático
 */
router.post('/initialize', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Verificar se é cliente
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || profile.role !== 'client') {
      return res.status(403).json({
        success: false,
        error: 'Apenas clientes podem inicializar seus dados',
      });
    }

    // Buscar plano ativo
    const { data: plan } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();

    const planId = plan?.id || null;

    const results: any = {};

    // 1. Criar subscription se não existir
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingSubscription && planId) {
      const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'ativa',
          started_at: new Date().toISOString(),
          renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_method: 'pendente',
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar subscription:', error);
      } else {
        results.subscription = 'criado';
      }
    } else {
      results.subscription = existingSubscription ? 'já existe' : 'sem plano disponível';
    }

    // 2. Criar site_status se não existir
    const { data: existingSiteStatus } = await supabaseAdmin
      .from('site_status')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingSiteStatus) {
      const { data: siteStatus, error } = await supabaseAdmin
        .from('site_status')
        .insert({
          user_id: userId,
          status: 'aguardando_briefing',
          notes: 'Cliente recém cadastrado. Aguardando envio do briefing inicial.',
          last_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar site_status:', error);
      } else {
        results.siteStatus = 'criado';
      }
    } else {
      results.siteStatus = 'já existe';
    }

    // 3. Criar production_pipeline se não existir
    const { data: existingPipeline } = await supabaseAdmin
      .from('production_pipeline')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingPipeline) {
      const { data: pipeline, error } = await supabaseAdmin
        .from('production_pipeline')
        .insert({
          user_id: userId,
          stage: 'aguardando_briefing',
          notes: 'Cliente novo. Aguardando preenchimento do briefing.',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pipeline:', error);
      } else {
        results.pipeline = 'criado';
      }
    } else {
      results.pipeline = 'já existe';
    }

    // 4. Criar contract se não existir
    const { data: existingContract } = await supabaseAdmin
      .from('contracts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingContract) {
      const { data: contract, error } = await supabaseAdmin
        .from('contracts')
        .insert({
          user_id: userId,
          status: 'pendente',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar contract:', error);
      } else {
        results.contract = 'criado';
      }
    } else {
      results.contract = 'já existe';
    }

    // 5. Criar briefing se não existir
    const { data: existingBriefing } = await supabaseAdmin
      .from('briefings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingBriefing) {
      const { data: briefing, error } = await supabaseAdmin
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

      if (error) {
        console.error('Erro ao criar briefing:', error);
      } else {
        results.briefing = 'criado';
      }
    } else {
      results.briefing = 'já existe';
    }

    return res.json({
      success: true,
      message: 'Dados inicializados com sucesso!',
      results,
    });
  } catch (error) {
    console.error('Erro ao inicializar dados do cliente:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao inicializar dados do cliente',
    });
  }
});

export default router;

