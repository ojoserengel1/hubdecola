// PRIMEIRO: Carregar variáveis de ambiente
import './env';

import express, { Request, Response } from 'express';
import cors from 'cors';

// Rotas
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import briefingRoutes from './routes/briefing.routes';
import invoicesRoutes from './routes/invoices.routes';
import siteStatusRoutes from './routes/site-status.routes';
import ticketsRoutes from './routes/tickets.routes';
import adminRoutes from './routes/admin.routes';
import webhooksRoutes from './routes/webhooks.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Permitir localhost em qualquer porta + URLs específicas
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Verificar se é localhost em qualquer porta
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Verificar se está na lista de permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Para webhooks do Stripe, precisamos do body raw
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON parser para outras rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      timestamp: new Date().toISOString(),
    });
    next();
  });
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'DecolaWeb API está funcionando! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/briefing', briefingRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/site-status', siteStatusRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Erro não tratado:', err);
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log('🚀 DecolaWeb API iniciada!');
  console.log(`📍 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;

