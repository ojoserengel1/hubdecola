import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /emails/request
 * Cliente solicita criação de um e-mail profissional
 */
router.post('/request', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório',
      });
    }

    // Valida formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de e-mail inválido',
      });
    }

    // Verifica se já existe um e-mail com esse endereço para este usuário
    const { data: existingEmail } = await supabaseAdmin
      .from('emails_profissionais')
      .select('id')
      .eq('user_id', userId)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Este e-mail já foi solicitado',
      });
    }

    // Cria solicitação de e-mail com status 'pendente' (sem senha - será configurada pelo admin)
    const { data: newEmail, error } = await supabaseAdmin
      .from('emails_profissionais')
      .insert({
        user_id: userId,
        email: email.toLowerCase().trim(),
        status: 'pendente',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar solicitação de e-mail:', error);
      throw error;
    }

    return res.json({
      success: true,
      data: {
        ...newEmail,
        password_hash: undefined, // Não retorna o hash
      },
      message: 'Solicitação de e-mail criada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao solicitar e-mail:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao solicitar e-mail',
    });
  }
});

/**
 * PUT /emails/:id/status
 * Admin atualiza status do e-mail
 */
router.put('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const emailId = req.params.id;
    const { status, notes, access_url, password_plain } = req.body;

    // Verifica se é admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem atualizar status de e-mails',
      });
    }

    if (!status || !['ativo', 'pendente', 'cancelado'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido. Use: ativo, pendente ou cancelado',
      });
    }

    // Atualiza status do e-mail
    const updateData: any = {
      status,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (access_url !== undefined) {
      updateData.access_url = access_url;
    }

    if (password_plain !== undefined) {
      updateData.password_plain = password_plain;
    }

    const { data: updatedEmail, error } = await supabaseAdmin
      .from('emails_profissionais')
      .update(updateData)
      .eq('id', emailId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status do e-mail:', error);
      throw error;
    }

    return res.json({
      success: true,
      data: {
        ...updatedEmail,
        password_hash: undefined, // Não retorna o hash
      },
      message: 'Status do e-mail atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status do e-mail:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar status do e-mail',
    });
  }
});

export default router;

