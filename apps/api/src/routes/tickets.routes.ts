import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';
import { CreateTicketRequest, CreateMessageRequest, TicketStatus } from '@decolaweb/shared';

const router = Router();

/**
 * GET /tickets
 * Retorna todos os tickets do cliente autenticado
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data: tickets, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: tickets || [],
    });
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar tickets',
    });
  }
});

/**
 * POST /tickets
 * Cria um novo ticket de suporte
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { subject, description, priority }: CreateTicketRequest = req.body;

    if (!subject || !description || !priority) {
      return res.status(400).json({
        success: false,
        error: 'Assunto, descrição e prioridade são obrigatórios',
      });
    }

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject,
        description,
        priority,
        status: TicketStatus.OPEN,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar ticket',
    });
  }
});

/**
 * GET /tickets/:id
 * Retorna detalhes de um ticket específico
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const ticketId = req.params.id;

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', userId)
      .single();

    if (error || !ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    return res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar ticket',
    });
  }
});

/**
 * GET /tickets/:id/messages
 * Retorna todas as mensagens de um ticket
 */
router.get('/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const ticketId = req.params.id;

    // Verifica se o ticket pertence ao usuário
    const { data: ticket } = await supabaseAdmin
      .from('support_tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    if (!ticket || ticket.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
      });
    }

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
 * POST /tickets/:id/messages
 * Adiciona uma mensagem a um ticket
 */
router.post('/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const ticketId = req.params.id;
    const { message }: CreateMessageRequest = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória',
      });
    }

    // Verifica se o ticket pertence ao usuário
    const { data: ticket } = await supabaseAdmin
      .from('support_tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    if (!ticket || ticket.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
      });
    }

    // Cria a mensagem
    const { data: newMessage, error } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'client',
        message,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Atualiza o status do ticket se estava fechado
    await supabaseAdmin
      .from('support_tickets')
      .update({
        status: TicketStatus.OPEN,
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

export default router;

