import { create } from 'zustand';
import { supabase } from '@/config/supabase';
import { Profile, UserRole } from '@decolaweb/shared';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('🔍 Session:', session);

      if (!session) {
        console.log('❌ Sem sessão');
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      console.log('✅ Sessão encontrada, buscando perfil...');

      // Busca o perfil do usuário
      console.log('🔎 Buscando perfil para user ID:', session.user.id);
      
      // Primeiro tenta buscar via API (que usa service_role e não tem problema de RLS)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      console.log('🌐 Tentando buscar perfil via API:', `${apiUrl}/auth/me`);
      
      try {
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('📡 Resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Perfil encontrado via API:', data);
          
          if (data.success && data.data) {
            set({
              user: {
                ...data.data,
                email: session.user.email,
              } as Profile,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          } else {
            console.log('⚠️ API retornou success=false:', data);
            // Se a API retornou mas sem dados, tenta fallback
            throw new Error('API retornou sem dados');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ API retornou erro:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          // Se a API retornou erro, tenta fallback
          throw new Error(`API retornou ${response.status}: ${errorData.error || response.statusText}`);
        }
      } catch (apiError: any) {
        console.error('❌ Erro ao buscar via API:', {
          message: apiError.message,
          stack: apiError.stack,
          name: apiError.name
        });
        console.log('💡 Tentando buscar direto do Supabase como fallback...');
      }
      
      // Fallback: tenta buscar direto (pode falhar por RLS)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('📊 Perfil (direto):', profile);
      console.log('❌ Erro (direto):', error);
      
      if (error || !profile) {
        console.log('❌ Perfil não encontrado após todas as tentativas');
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      console.log('✅ Perfil encontrado, setando usuário');

      set({
        user: {
          ...profile,
          email: session.user.email,
        } as Profile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('🔥 Erro ao verificar autenticação:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));

