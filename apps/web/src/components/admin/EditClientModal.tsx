import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClient, UpdateClientRequest } from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    name: string;
    company_name: string;
    email: string;
    whatsapp?: string;
  };
}

export function EditClientModal({ isOpen, onClose, client }: EditClientModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateClientRequest>({
    name: client.name,
    company_name: client.company_name,
    email: client.email,
    whatsapp: client.whatsapp || '',
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateClientRequest) => updateClient(client.id, data),
    onSuccess: () => {
      toast.success('✅ Cliente atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-client', client.id] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar cliente');
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
            <Save className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-dark">Editar Cliente</h2>
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Atenção:</strong> Ao atualizar os dados do cliente, as informações serão atualizadas
              em todas as áreas do sistema (Dashboard, Financeiro, Pipeline, etc.).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
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

            {/* Nome da Empresa */}
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

            {/* E-mail */}
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
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Alterar o e-mail também atualiza o login do cliente
              </p>
            </div>

            {/* Telefone (WhatsApp) */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Telefone (WhatsApp)
              </label>
              <Input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
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
              className="min-w-[140px]"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

