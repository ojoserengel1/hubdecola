import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEmailStatus } from '@/lib/api';
import { toast } from 'sonner';
import { EmailStatus } from '@decolaweb/shared';

interface UpdateEmailStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: {
    id: string;
    email: string;
    status: EmailStatus;
    notes?: string;
    access_url?: string;
    password_plain?: string;
  };
  clientId: string;
}

export function UpdateEmailStatusModal({
  isOpen,
  onClose,
  email,
  clientId,
}: UpdateEmailStatusModalProps) {
  const queryClient = useQueryClient();
  // Converte o status string para o enum EmailStatus
  const getStatusFromString = (statusStr: string | EmailStatus): EmailStatus => {
    if (statusStr === 'ativo') return EmailStatus.ACTIVE;
    if (statusStr === 'pendente') return EmailStatus.PENDING;
    if (statusStr === 'cancelado') return EmailStatus.CANCELED;
    return statusStr as EmailStatus;
  };
  
  const [status, setStatus] = useState<EmailStatus>(getStatusFromString(email.status));
  const [notes, setNotes] = useState(email.notes || '');
  const [accessUrl, setAccessUrl] = useState(email.access_url || '');
  const [passwordPlain, setPasswordPlain] = useState(email.password_plain || '');

  const updateMutation = useMutation({
    mutationFn: (data: { status: EmailStatus; notes?: string; access_url?: string; password_plain?: string }) =>
      updateEmailStatus(email.id, data.status, data.notes, data.access_url, data.password_plain),
    onSuccess: () => {
      toast.success('Status do e-mail atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['admin-emails'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar status do e-mail');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      status,
      notes: notes.trim() || undefined,
      access_url: accessUrl.trim() || undefined,
      password_plain: passwordPlain.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Status do E-mail" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-dark mb-2">E-mail:</p>
          <p className="text-sm text-gray-600 font-mono">{email.email}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-2">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EmailStatus)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={EmailStatus.PENDING}>Pendente</option>
            <option value={EmailStatus.ACTIVE}>Ativo</option>
            <option value={EmailStatus.CANCELED}>Cancelado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Senha do E-mail:
          </label>
          <Input
            type="text"
            placeholder="Digite a senha do e-mail"
            value={passwordPlain}
            onChange={(e) => setPasswordPlain(e.target.value)}
            helperText="Senha que será exibida ao cliente para acesso ao e-mail"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            URL de Acesso (opcional):
          </label>
          <Input
            type="url"
            placeholder="https://webmail.seudominio.com.br"
            value={accessUrl}
            onChange={(e) => setAccessUrl(e.target.value)}
            helperText="Link para acessar a caixa de entrada do e-mail (webmail)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Observações (opcional):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Adicione observações sobre o e-mail..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

