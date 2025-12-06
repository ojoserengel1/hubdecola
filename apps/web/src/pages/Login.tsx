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
      
      // Aguarda um pouco para garantir que a sessão foi salva
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualiza o estado de autenticação
      console.log('🔄 Verificando autenticação...');
      await checkAuth();

      // Aguarda um pouco mais para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 300));

      // Busca o perfil do estado após checkAuth
      const profile = useAuthStore.getState().user;
      console.log('👤 Perfil encontrado no estado:', profile);
      
      if (!profile) {
        console.error('❌ Perfil não encontrado no estado após checkAuth');
        setError('Perfil não encontrado. Entre em contato com o suporte.');
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
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
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

