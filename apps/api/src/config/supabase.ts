import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente são carregadas no index.ts antes deste arquivo ser importado
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Definida' : 'Não definida');
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidos nas variáveis de ambiente');
}

/**
 * Cliente Supabase com service role key
 * Usado no backend para operações administrativas
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

