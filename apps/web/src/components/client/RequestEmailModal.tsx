import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '@/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestEmail } from '@/lib/api';
import { toast } from 'sonner';

const requestEmailSchema = z.object({
  emailName: z
    .string()
    .min(1, 'Nome do e-mail é obrigatório')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Nome do e-mail inválido. Use apenas letras, números, pontos, hífens e underscores'),
});

type RequestEmailFormData = z.infer<typeof requestEmailSchema>;

interface RequestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Domínio fixo para todos os clientes (será customizável no futuro)
const FIXED_DOMAIN = 'seudominio.com.br';

export function RequestEmailModal({ isOpen, onClose }: RequestEmailModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestEmailFormData>({
    resolver: zodResolver(requestEmailSchema),
  });

  const requestMutation = useMutation({
    mutationFn: (data: RequestEmailFormData) => {
      // Concatena o nome do e-mail com o domínio fixo
      const fullEmail = `${data.emailName}@${FIXED_DOMAIN}`;
      return requestEmail(fullEmail);
    },
    onSuccess: () => {
      toast.success('Solicitação de e-mail enviada com sucesso!');
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao solicitar e-mail. Tente novamente.');
    },
  });

  const onSubmit = (data: RequestEmailFormData) => {
    requestMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar E-mail Profissional" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">E-mail</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="e-mail"
                {...register('emailName')}
                className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.emailName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center">
              <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-mono text-sm">
                @{FIXED_DOMAIN}
              </span>
            </div>
          </div>
          {errors.emailName && (
            <p className="mt-1 text-sm text-red-600">{errors.emailName.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Exemplo: contato, financeiro, adm, nomedoseufuncionario...
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={requestMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={requestMutation.isPending}>
            {requestMutation.isPending ? 'Enviando...' : 'Solicitar E-mail'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

