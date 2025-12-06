import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /auth/me
 * Retorna os dados do usuário autenticado
 */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Perfil não encontrado',
      });
    }

    // Adiciona o email do auth
    profile.email = req.user!.email;

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar perfil do usuário',
    });
  }
});

export default router;

