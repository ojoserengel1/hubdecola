import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /chat/conversations
 * Lista todas as conversas (admin vê todas, cliente vê apenas a sua)
 */
router.get('/conversations', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Verifica se é admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'admin';

    let conversations;

    if (isAdmin) {
      // Admin: Busca TODOS os clientes primeiro
      const { data: allClients, error: clientsError } = await supabaseAdmin
        .from('profiles')
        .select('id, name, company_name, whatsapp')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('❌ [Chat API] Erro ao buscar clientes:', clientsError);
        throw clientsError;
      }

      console.log(`📋 [Chat API] Encontrados ${allClients?.length || 0} clientes`);

      // Busca emails do auth.users para cada cliente
      const clientsWithEmail = await Promise.all(
        (allClients || []).map(async (client: any) => {
          try {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(client.id);
            return {
              ...client,
              email: authUser?.user?.email || null,
            };
          } catch (err) {
            console.error(`Erro ao buscar email para cliente ${client.id}:`, err);
            return {
              ...client,
              email: null,
            };
          }
        })
      );

      // Busca todas as conversas existentes
      const { data: existingConversations, error: convError } = await supabaseAdmin
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convError) {
        console.error('❌ [Chat API] Erro ao buscar conversas:', convError);
        throw convError;
      }

      console.log(`💬 [Chat API] Encontradas ${existingConversations?.length || 0} conversas existentes`);

      // Cria um mapa de conversas por user_id
      const conversationsMap = new Map();
      (existingConversations || []).forEach((conv: any) => {
        conversationsMap.set(conv.user_id, conv);
      });

      // Para cada cliente, garante que tenha uma conversa
      conversations = await Promise.all(
        clientsWithEmail.map(async (client: any) => {
          let conversation = conversationsMap.get(client.id);

          // Se não existe conversa, cria uma
          if (!conversation) {
            const { data: newConv, error: createError } = await supabaseAdmin
              .from('chat_conversations')
              .insert({ user_id: client.id })
              .select()
              .single();

            if (createError) {
              console.error(`Erro ao criar conversa para cliente ${client.id}:`, createError);
              // Continua mesmo se der erro ao criar
              conversation = {
                id: null,
                user_id: client.id,
                last_message_at: null,
                admin_unread_count: 0,
                client_unread_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            } else {
              conversation = newConv;
            }
          }

          // Busca última mensagem (apenas se a conversa foi criada com sucesso)
          let lastMsg = null;
          if (conversation.id) {
            const { data: msgData } = await supabaseAdmin
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            lastMsg = msgData || null;
          }

          return {
            ...conversation,
            user: client,
            last_message: lastMsg,
          };
        })
      );

      // Ordena por last_message_at (mais recente primeiro), depois por created_at
      conversations.sort((a: any, b: any) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        // Se não há mensagens, ordena por data de criação da conversa
        const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return createdB - createdA;
      });

      console.log(`✅ [Chat API] Retornando ${conversations.length} conversas para admin`);
    } else {
      // Cliente vê apenas sua própria conversa
      const { data, error } = await supabaseAdmin
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Busca última mensagem
        const { data: lastMsgData } = await supabaseAdmin
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', data.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        conversations = [{
          ...data,
          last_message: lastMsgData || null,
        }];
      } else {
        // Cria conversa se não existir
        const { data: newConv, error: createError } = await supabaseAdmin
          .from('chat_conversations')
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;

        conversations = [{
          ...newConv,
          last_message: null,
        }];
      }
    }

    return res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    console.error('Erro ao buscar conversas:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar conversas',
    });
  }
});

/**
 * GET /chat/conversations/:conversationId/messages
 * Busca mensagens de uma conversa específica
 */
router.get('/conversations/:conversationId/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    // Verifica permissão
    const { data: conversation } = await supabaseAdmin
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    // Verifica se é admin ou o próprio cliente
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (!isAdmin && conversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
      });
    }

    // Busca mensagens
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey (
          id,
          name,
          company_name,
          whatsapp,
          role
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [Chat API] Erro ao buscar mensagens:', error);
      throw error;
    }

    // Busca emails do auth.users para cada sender
    const messagesWithEmail = await Promise.all(
      (messages || []).map(async (msg: any) => {
        if (msg.sender) {
          try {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(msg.sender.id);
            return {
              ...msg,
              sender: {
                ...msg.sender,
                email: authUser?.user?.email || null,
              },
            };
          } catch (err) {
            console.error(`Erro ao buscar email para sender ${msg.sender.id}:`, err);
            return {
              ...msg,
              sender: {
                ...msg.sender,
                email: null,
              },
            };
          }
        }
        return msg;
      })
    );

    return res.json({
      success: true,
      data: messagesWithEmail || [],
    });
  } catch (error: any) {
    console.error('Erro ao buscar mensagens:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar mensagens',
    });
  }
});

/**
 * POST /chat/messages
 * Envia uma nova mensagem
 */
router.post('/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { conversation_id, message } = req.body;

    if (!conversation_id || !message) {
      return res.status(400).json({
        success: false,
        error: 'conversation_id e message são obrigatórios',
      });
    }

    // Verifica permissão
    const { data: conversation } = await supabaseAdmin
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversation_id)
      .single();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    // Verifica se é admin ou o próprio cliente
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'admin';
    const senderType = isAdmin ? 'admin' : 'client';

    if (!isAdmin && conversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
      });
    }

    // Cria mensagem
    const { data: newMessage, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id,
        sender_id: userId,
        sender_type: senderType,
        message: message.trim(),
        is_read: false,
      })
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey (
          id,
          name,
          company_name,
          whatsapp,
          role
        )
      `)
      .single();

    if (error) {
      console.error('❌ [Chat API] Erro ao criar mensagem:', error);
      throw error;
    }

    // Busca email do auth.users para o sender
    let messageWithEmail = newMessage;
    if (newMessage?.sender) {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(newMessage.sender.id);
        messageWithEmail = {
          ...newMessage,
          sender: {
            ...newMessage.sender,
            email: authUser?.user?.email || null,
          },
        };
      } catch (err) {
        console.error(`Erro ao buscar email para sender ${newMessage.sender.id}:`, err);
        messageWithEmail = {
          ...newMessage,
          sender: {
            ...newMessage.sender,
            email: null,
          },
        };
      }
    }

    return res.json({
      success: true,
      data: messageWithEmail,
    });
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao enviar mensagem',
    });
  }
});

/**
 * PUT /chat/conversations/:conversationId/read
 * Marca mensagens como lidas
 */
router.put('/conversations/:conversationId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;
    const { message_ids } = req.body;

    // Verifica permissão
    const { data: conversation } = await supabaseAdmin
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada',
      });
    }

    // Verifica se é admin ou o próprio cliente
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (!isAdmin && conversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
      });
    }

    // Determina quais mensagens marcar como lidas
    let query = supabaseAdmin
      .from('chat_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .eq('is_read', false);

    // Se message_ids for fornecido, marca apenas essas
    if (message_ids && Array.isArray(message_ids) && message_ids.length > 0) {
      query = query.in('id', message_ids);
    } else {
      // Marca todas as mensagens do outro usuário como lidas
      const senderType = isAdmin ? 'client' : 'admin';
      query = query.eq('sender_type', senderType);
    }

    const { error } = await query;

    if (error) throw error;

    // Atualiza contadores na conversa
    const updateField = isAdmin ? 'admin_unread_count' : 'client_unread_count';
    await supabaseAdmin
      .from('chat_conversations')
      .update({ [updateField]: 0 })
      .eq('id', conversationId);

    return res.json({
      success: true,
      message: 'Mensagens marcadas como lidas',
    });
  } catch (error: any) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao marcar mensagens como lidas',
    });
  }
});

export default router;

