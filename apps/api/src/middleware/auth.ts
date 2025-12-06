import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { UserRole } from '@decolaweb/shared';

/**
 * Estende o tipo Request do Express para incluir o usuário autenticado
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware de autenticação
 * Valida o token JWT do Supabase e anexa os dados do usuário à requisição
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔐 [AUTH] Iniciando autenticação para:', req.method, req.path);
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH] Token não fornecido');
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
      });
    }

    const token = authHeader.substring(7);
    console.log('🔑 [AUTH] Token presente, validando...');

    // Verifica o token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('❌ [AUTH] Erro ao validar token:', {
        error: error?.message,
        code: error?.status,
        userId: user?.id
      });
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
      });
    }

    console.log('✅ [AUTH] Token válido, user ID:', user.id, 'Email:', user.email);

    // Busca o perfil do usuário
    // Primeiro tenta buscar apenas os campos essenciais
    console.log('🔍 [AUTH] Buscando perfil para user ID:', user.id);
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, name, company_name, created_at, deleted_at')
      .eq('id', user.id)
      .single();

    console.log('📊 [AUTH] Resultado da busca do perfil:', {
      found: !!profile,
      error: profileError?.message,
      role: profile?.role,
      deleted_at: profile?.deleted_at
    });

    if (profileError) {
      console.error('❌ [AUTH] Erro ao buscar perfil no middleware:', {
        error: profileError,
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        userId: user.id,
        email: user.email
      });
      
      // Se falhar, tenta buscar tudo (pode ter problema com coluna específica)
      console.log('⚠️ Tentando buscar perfil completo como fallback...');
      const { data: profileFallback, error: fallbackError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fallbackError || !profileFallback) {
        console.error('❌ Fallback também falhou:', fallbackError);
        return res.status(401).json({
          success: false,
          error: 'Perfil do usuário não encontrado',
        });
      }
      
      // Usa o perfil do fallback
      if (!profileFallback.role) {
        console.error('❌ Perfil do fallback sem role');
        return res.status(401).json({
          success: false,
          error: 'Perfil do usuário inválido (sem role)',
        });
      }
      
      // Usa o perfil do fallback
      req.user = {
        id: user.id,
        email: user.email!,
        role: profileFallback.role as UserRole,
      };
      
      console.log('✅ Usuário autenticado (fallback):', {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      });
      
      return next();
    }

    if (!profile) {
      console.error('❌ Perfil não encontrado:', {
        userId: user.id,
        email: user.email
      });
      return res.status(401).json({
        success: false,
        error: 'Perfil do usuário não encontrado',
      });
    }

    // Verifica se o perfil tem role
    if (!profile.role) {
      console.error('❌ Perfil sem role:', {
        userId: user.id,
        email: user.email,
        profile
      });
      return res.status(401).json({
        success: false,
        error: 'Perfil do usuário inválido (sem role)',
      });
    }

    // Verifica se o usuário foi excluído (soft delete)
    // Verifica apenas se a propriedade existir (coluna pode não existir ainda)
    if (profile && 'deleted_at' in profile && profile.deleted_at) {
      console.log(`🚫 Acesso negado para user ID: ${user.id}. Conta desativada em: ${profile.deleted_at}`);
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Conta desativada.',
      });
    }

    // Anexa os dados do usuário à requisição
    req.user = {
      id: user.id,
      email: user.email!,
      role: profile.role as UserRole,
    };

    console.log('✅ [AUTH] Usuário autenticado com sucesso:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      path: req.path
    });

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
    });
  }
};

/**
 * Middleware para verificar se o usuário é admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Requer permissão de administrador.',
    });
  }
  next();
};

