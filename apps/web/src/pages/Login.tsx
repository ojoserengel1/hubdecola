import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@decolaweb/shared';

export function Login() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Iniciando login para:', email);
      
      // Faz login no Supabase
      const loginResult = await login(email, password);
      console.log('✅ Login bem-sucedido:', loginResult);
      
      if (!loginResult.user) {
        setError('Erro ao fazer login. Verifique suas credenciais.');
        setIsLoading(false);
        return;
      }
      
      // Aguarda um pouco para garantir que a sessão foi salva
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualiza o estado de autenticação
      console.log('🔄 Verificando autenticação...');
      await checkAuth();

      // Aguarda um pouco mais para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Busca o perfil do estado após checkAuth
      const profile = useAuthStore.getState().user;
      console.log('👤 Perfil encontrado no estado:', profile);
      
      if (!profile) {
        console.error('❌ Perfil não encontrado no estado após checkAuth');
        
        // Verifica se o backend está acessível
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        try {
          await fetch(`${apiUrl}/health`);
        } catch (healthError) {
          setError('Backend não está acessível. Verifique se o servidor está rodando na porta 3001.');
          setIsLoading(false);
          return;
        }
        
        setError('Perfil não encontrado. Verifique se o usuário tem um perfil criado na tabela profiles.');
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Perfil encontrado, redirecionando...');
      
      // Redireciona baseado na role
      if (profile.role === UserRole.ADMIN) {
        navigate('/admin/clientes');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      
      // Mensagens de erro mais específicas
      if (err.message?.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else {
        setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" padding="lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-dark">DecolaWeb</h1>
          <p className="text-gray-600 mt-2">Área do Cliente</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Input
            type="password"
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Entrar
          </Button>
        </form>

        {/* Links adicionais */}
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-600 hover:text-primary transition-colors">
            Esqueci minha senha
          </button>
        </div>
      </Card>
    </div>
  );
}

