import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient, CreateClientRequest } from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateClientRequest>({
    email: '',
    password: '',
    name: '',
    company_name: '',
    whatsapp: '',
  });

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: (data) => {
      toast.success('✅ Cliente criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      onClose();
      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        company_name: '',
        whatsapp: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar cliente');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-dark">Criar Novo Cliente</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>✨ Automático:</strong> Ao criar o cliente, todos os registros necessários serão criados automaticamente:
                assinatura, status do site, pipeline, contrato e briefing.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>💳 Integração Stripe:</strong> Campos idênticos ao checkout da Stripe para futura automação
                de criação de clientes após pagamento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Nome Completo <span className="text-primary">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="João Silva"
                required
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Nome da Empresa <span className="text-primary">*</span>
              </label>
              <Input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Empresa Exemplo Ltda"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                E-mail <span className="text-primary">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cliente@exemplo.com"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Senha <span className="text-primary">*</span>
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            {/* Telefone (WhatsApp) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark mb-2">
                Telefone (WhatsApp)
              </label>
              <Input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
              <p className="text-xs text-gray-500 mt-1">
                📱 Mesmo formato usado no checkout da Stripe
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
              className="min-w-[120px]"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

