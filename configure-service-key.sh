#!/bin/bash

# Script para configurar a Service Role Key do Supabase
# Hub Decola - DecolaWeb

echo "🔐 Configuração da Service Role Key"
echo "===================================="
echo ""
echo "Este script vai ajudá-lo a configurar a chave service_role do Supabase."
echo ""
echo "📋 Passo a passo:"
echo "1. Acesse: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/settings/api"
echo "2. Role até 'Project API keys'"
echo "3. Localize a chave 'service_role'"
echo "4. Clique em 'Reveal' e depois em 'Copy'"
echo "5. Cole a chave abaixo quando solicitado"
echo ""
echo "⚠️  ATENÇÃO: Esta chave é SECRETA! Nunca compartilhe ou exponha no frontend."
echo ""

# Verificar se o arquivo .env existe
if [ ! -f "apps/api/.env" ]; then
    echo "❌ Erro: Arquivo apps/api/.env não encontrado!"
    echo "Execute primeiro o setup do projeto."
    exit 1
fi

# Solicitar a chave
echo -n "Cole a service_role_key aqui: "
read SERVICE_KEY

# Verificar se a chave foi fornecida
if [ -z "$SERVICE_KEY" ]; then
    echo "❌ Nenhuma chave fornecida. Operação cancelada."
    exit 1
fi

# Fazer backup do arquivo .env
cp apps/api/.env apps/api/.env.backup
echo "✅ Backup criado: apps/api/.env.backup"

# Substituir a chave no arquivo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/SUBSTITUA_PELA_SERVICE_ROLE_KEY_DO_DASHBOARD/$SERVICE_KEY/" apps/api/.env
else
    # Linux
    sed -i "s/SUBSTITUA_PELA_SERVICE_ROLE_KEY_DO_DASHBOARD/$SERVICE_KEY/" apps/api/.env
fi

echo "✅ Service key configurada com sucesso!"
echo ""
echo "🚀 Próximos passos:"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:5173"
echo "3. Faça login no sistema"
echo ""
echo "✨ Tudo pronto! Bom desenvolvimento!"

