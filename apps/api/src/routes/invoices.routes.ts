import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /invoices
 * Retorna todas as faturas do cliente autenticado
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Busca a assinatura do usuário
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Busca as faturas da assinatura
    const { data: invoices, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('subscription_id', subscription.id)
      .order('due_date', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: invoices || [],
    });
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar faturas',
    });
  }
});

/**
 * GET /invoices/:id
 * Retorna detalhes de uma fatura específica
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const invoiceId = req.params.id;

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*, subscription:subscriptions(user_id)')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return res.status(404).json({
        success: false,
        error: 'Fatura não encontrada',
      });
    }

    // Verifica se a fatura pertence ao usuário
    if (invoice.subscription.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
      });
    }

    return res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Erro ao buscar fatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar fatura',
    });
  }
});

export default router;

