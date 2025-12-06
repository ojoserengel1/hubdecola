import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /site-status
 * Retorna o status do site do cliente autenticado
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data: siteStatus, error } = await supabaseAdmin
      .from('site_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return res.json({
      success: true,
      data: siteStatus || null,
    });
  } catch (error) {
    console.error('Erro ao buscar status do site:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar status do site',
    });
  }
});

export default router;

