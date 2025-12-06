import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * POST /webhooks/stripe
 * Webhook do Stripe para receber eventos de pagamento
 * 
 * FUTURO: Implementar validação de assinatura do Stripe
 * e processamento completo dos eventos
 */
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    console.log('🔔 Webhook Stripe recebido:', {
      type: req.body.type,
      timestamp: new Date().toISOString(),
    });

    const event = req.body;

    // TODO: Validar assinatura do webhook do Stripe
    // const sig = req.headers['stripe-signature'];
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        // Cliente completou o pagamento
        console.log('✅ Checkout completado:', event.data.object);
        
        // TODO: 
        // 1. Buscar customer_id do Stripe
        // 2. Criar/atualizar perfil do usuário
        // 3. Criar assinatura ativa
        // 4. Criar primeira fatura como paga
        // 5. Enviar email de boas-vindas com credenciais
        
        break;

      case 'invoice.paid':
        // Fatura foi paga
        console.log('💰 Fatura paga:', event.data.object);
        
        // TODO:
        // 1. Atualizar status da fatura no banco
        // 2. Atualizar data de renovação da assinatura
        // 3. Enviar email de confirmação
        
        break;

      case 'invoice.payment_failed':
        // Falha no pagamento
        console.log('❌ Falha no pagamento:', event.data.object);
        
        // TODO:
        // 1. Atualizar status da fatura para "atrasado"
        // 2. Notificar cliente por email
        // 3. Após X tentativas, suspender assinatura
        
        break;

      case 'customer.subscription.updated':
        // Assinatura foi atualizada
        console.log('🔄 Assinatura atualizada:', event.data.object);
        
        // TODO:
        // 1. Atualizar dados da assinatura no banco
        
        break;

      case 'customer.subscription.deleted':
        // Assinatura foi cancelada
        console.log('🚫 Assinatura cancelada:', event.data.object);
        
        // TODO:
        // 1. Atualizar status da assinatura para "cancelada"
        // 2. Notificar cliente
        // 3. Desativar acesso após período de carência
        
        break;

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }

    // Sempre retornar 200 para o Stripe saber que recebemos
    return res.json({ received: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(400).json({
      success: false,
      error: 'Erro ao processar webhook',
    });
  }
});

/**
 * POST /webhooks/n8n
 * Webhook para integração com n8n
 * 
 * Pode ser usado para automações como:
 * - Notificações no WhatsApp
 * - Emails automáticos
 * - Integrações com outras ferramentas
 */
router.post('/n8n', async (req: Request, res: Response) => {
  try {
    console.log('🔔 Webhook n8n recebido:', {
      action: req.body.action,
      timestamp: new Date().toISOString(),
    });

    const { action, data } = req.body;

    // TODO: Implementar ações específicas do n8n
    // Exemplos:
    // - 'send_welcome_email'
    // - 'notify_whatsapp'
    // - 'create_notion_page'
    // - 'update_google_sheets'

    return res.json({
      success: true,
      message: 'Webhook n8n processado',
    });
  } catch (error) {
    console.error('❌ Erro ao processar webhook n8n:', error);
    return res.status(400).json({
      success: false,
      error: 'Erro ao processar webhook',
    });
  }
});

export default router;

