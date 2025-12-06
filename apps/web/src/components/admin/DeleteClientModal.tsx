import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClient } from '@/lib/api';
import { Button } from '@/components/ui';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    name: string;
    company_name?: string;
    email?: string;
  };
}

export function DeleteClientModal({ isOpen, onClose, client }: DeleteClientModalProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteClient(client.id),
    onSuccess: () => {
      toast.success('✅ Cliente excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir cliente');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-dark">Confirmar Exclusão</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={mutation.isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Tem certeza que deseja <strong>excluir</strong> este cliente?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-semibold text-gray-600">Cliente:</span>
                  <p className="text-base font-semibold text-dark">{client.name}</p>
                </div>
                {client.company_name && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Empresa:</span>
                    <p className="text-base text-dark">{client.company_name}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">E-mail:</span>
                    <p className="text-base text-dark">{client.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Atenção:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>O cliente será <strong>removido</strong> do painel administrativo</li>
                  <li>O <strong>acesso será bloqueado</strong> (não poderá mais fazer login)</li>
                  <li>Os dados <strong>NÃO serão excluídos</strong> do banco de dados</li>
                  <li>Esta ação pode ser revertida manualmente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="min-w-[120px]"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Cliente
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

