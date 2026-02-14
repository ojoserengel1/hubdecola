import { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClientSiteStatus } from '@/lib/api';
import { toast } from 'sonner';
import { SiteStatus } from '@decolaweb/shared';

interface UpdateSiteStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteStatus: {
    id?: string;
    status: string;
    notes?: string;
    preview_url?: string;
    live_url?: string;
  } | null;
  clientId: string;
}

export function UpdateSiteStatusModal({
  isOpen,
  onClose,
  siteStatus,
  clientId,
}: UpdateSiteStatusModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(siteStatus?.status || 'aguardando_preenchimento');
  const [notes, setNotes] = useState(siteStatus?.notes || '');
  const [previewUrl, setPreviewUrl] = useState(siteStatus?.preview_url || '');
  const [liveUrl, setLiveUrl] = useState(siteStatus?.live_url || '');

  // Atualiza os valores quando o siteStatus muda
  useEffect(() => {
    if (siteStatus) {
      setStatus(siteStatus.status || 'aguardando_preenchimento');
      setNotes(siteStatus.notes || '');
      setPreviewUrl(siteStatus.preview_url || '');
      setLiveUrl(siteStatus.live_url || '');
    }
  }, [siteStatus]);

  const updateMutation = useMutation({
    mutationFn: (data: { status: string; notes?: string; preview_url?: string; live_url?: string }) =>
      updateClientSiteStatus(clientId, data),
    onSuccess: () => {
      toast.success('Status do site atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar status do site');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      status,
      notes: notes || undefined,
      preview_url: previewUrl || undefined,
      live_url: liveUrl || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Status do Site" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="aguardando_preenchimento">Aguardando Preenchimento do Briefing</option>
            <option value="briefing_enviado">Briefing Enviado</option>
            <option value="em_producao">Site em Produção</option>
            <option value="em_aprovacao">Site em Aprovação</option>
            <option value="site_publicado">Site Publicado</option>
          </select>
        </div>

        {(status === 'em_aprovacao' || status === 'site_publicado') && (
          <>
            {status === 'em_aprovacao' && (
              <Input
                label="URL de Preview (Link para aprovação)"
                type="url"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://preview.seudominio.com.br"
                helperText="Link do site para o cliente revisar e aprovar"
              />
            )}

            {status === 'site_publicado' && (
              <Input
                label="URL do Site Publicado (Link ao vivo)"
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://seudominio.com.br"
                helperText="Link do site publicado e no ar"
              />
            )}
          </>
        )}

        <Textarea
          label="Notas (opcional)"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione observações sobre o status do site..."
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


