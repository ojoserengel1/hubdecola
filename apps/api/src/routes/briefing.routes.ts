import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';
import { BriefingStatus, UpdateBriefingRequest } from '@decolaweb/shared';

const router = Router();

/**
 * GET /briefing
 * Retorna o briefing do cliente autenticado
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data: briefing, error } = await supabaseAdmin
      .from('briefings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = não encontrado
      throw error;
    }

    return res.json({
      success: true,
      data: briefing || null,
    });
  } catch (error) {
    console.error('Erro ao buscar briefing:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar briefing',
    });
  }
});

/**
 * POST /briefing
 * Cria ou atualiza o briefing do cliente
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const briefingData: UpdateBriefingRequest = req.body;

    if (!briefingData || typeof briefingData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Dados do briefing são obrigatórios',
      });
    }

    // Verifica se já existe um briefing
    const { data: existingBriefing } = await supabaseAdmin
      .from('briefings')
      .select('id')
      .eq('user_id', userId)
      .single();

    // Prepara os dados para salvar
    const dataToSave = {
      ...briefingData,
      status: BriefingStatus.SENT,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (existingBriefing) {
      // Atualiza
      result = await supabaseAdmin
        .from('briefings')
        .update(dataToSave)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Cria novo
      result = await supabaseAdmin
        .from('briefings')
        .insert({
          user_id: userId,
          ...dataToSave,
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
      message: 'Briefing salvo com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao salvar briefing:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao salvar briefing',
    });
  }
});

export default router;

