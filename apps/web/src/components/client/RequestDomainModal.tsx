import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestDomain } from '@/lib/api';
import { toast } from 'sonner';
import { Info } from 'lucide-react';

// Schema para quando o cliente JÁ TEM domínio
const existingDomainSchema = z.object({
  has_domain: z.literal('sim'),
  domain: z.string().min(1, 'Domínio é obrigatório'),
  platform: z.string().min(1, 'Plataforma é obrigatória'),
  login: z.string().min(1, 'Login é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para quando o cliente NÃO TEM domínio
const newDomainSchema = z.object({
  has_domain: z.literal('nao'),
  domain_options: z.string().min(1, 'Informe pelo menos uma opção de domínio'),
});

// Schema unificado
const requestDomainSchema = z.discriminatedUnion('has_domain', [
  existingDomainSchema,
  newDomainSchema,
]);

type RequestDomainFormData = z.infer<typeof requestDomainSchema>;

interface RequestDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDomainModal({ isOpen, onClose }: RequestDomainModalProps) {
  const queryClient = useQueryClient();
  const [hasDomain, setHasDomain] = useState<'sim' | 'nao' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<any>({
    resolver: zodResolver(requestDomainSchema),
  });

  const requestMutation = useMutation({
    mutationFn: (data: RequestDomainFormData) => requestDomain(data),
    onSuccess: () => {
      toast.success('Solicitação de domínio enviada com sucesso!');
      reset();
      setHasDomain(null);
      onClose();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao solicitar domínio. Tente novamente.');
    },
  });

  const onSubmit = (data: any) => {
    // Garante que has_domain está definido
    const submitData = {
      ...data,
      has_domain: hasDomain!,
    };
    requestMutation.mutate(submitData);
  };

  const handleClose = () => {
    reset();
    setHasDomain(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Solicitar Domínio" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Explicação sobre Domínio */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">O que é um domínio?</p>
              <p className="text-sm text-blue-800">
                O domínio é o endereço do seu site na internet (exemplo: <span className="font-mono font-semibold">seusite.com.br</span>). 
                É através dele que seus clientes encontrarão seu site. Você pode usar um domínio que já possui ou solicitar um novo.
              </p>
            </div>
          </div>
        </div>

        {/* Pergunta Principal */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-3">
            Você já possui um domínio registrado?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setHasDomain('sim')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                hasDomain === 'sim'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/5'
              }`}
            >
              Sim, já tenho
            </button>
            <button
              type="button"
              onClick={() => setHasDomain('nao')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                hasDomain === 'nao'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/5'
              }`}
            >
              Não, quero um novo
            </button>
          </div>
        </div>

        {/* Formulário para quem JÁ TEM domínio */}
        {hasDomain === 'sim' && (
          <div className="space-y-4 border-t pt-4">
            <input type="hidden" {...register('has_domain')} value="sim" />
            
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Qual é o domínio? <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="exemplo.com.br"
                {...register('domain')}
                error={errors.domain?.message}
                helperText="Digite o domínio completo (exemplo: seusite.com.br)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Plataforma/Registrador <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ex: Registro.br, GoDaddy, Hostinger..."
                {...register('platform')}
                error={errors.platform?.message}
                helperText="Onde o domínio está registrado"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Login/Acesso <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Seu login na plataforma"
                {...register('login')}
                error={errors.login?.message}
                helperText="Login ou e-mail usado para acessar a plataforma do domínio"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Senha <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Senha de acesso"
                {...register('password')}
                error={errors.password?.message}
                helperText="Senha para acessar a plataforma do domínio"
              />
            </div>
          </div>
        )}

        {/* Formulário para quem NÃO TEM domínio */}
        {hasDomain === 'nao' && (
          <div className="space-y-4 border-t pt-4">
            <input type="hidden" {...register('has_domain')} value="nao" />
            
            <div>
              <h4 className="text-base font-semibold text-dark mb-3">
                Informe 3 opções de domínio que você gostaria para sua empresa, em ordem de preferência. Nossa equipe verificará a disponibilidade e registrará o primeiro disponível.
              </h4>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Exemplo de domínios:</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700 font-mono">decolaweb.com.br</p>
                  <p className="text-sm text-gray-700 font-mono">meusite.com.br</p>
                  <p className="text-sm text-gray-700 font-mono">suaempresa.com.br</p>
                </div>
              </div>
              
              <label className="block text-sm font-semibold text-dark mb-2">
                Opções de Domínio Desejadas <span className="text-red-500">*</span>
              </label>
              <Textarea
                rows={4}
                placeholder="Digite aqui no mínimo 3 opções."
                {...register('domain_options')}
                error={errors.domain_options?.message}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Dica:</strong> Escolha domínios curtos, fáceis de lembrar e relacionados ao nome da sua empresa. 
                Evite hífens e números quando possível.
              </p>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={requestMutation.isPending}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={requestMutation.isPending || !hasDomain}
            className="bg-green-600 hover:bg-green-700"
          >
            {requestMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

