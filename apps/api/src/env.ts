/**
 * Arquivo para verificar variáveis de ambiente
 * DEVE ser importado PRIMEIRO, antes de qualquer outro módulo
 */

// Verifica se as variáveis essenciais estão definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'FALTANDO');
  console.error('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'FALTANDO');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente configuradas com sucesso!');

