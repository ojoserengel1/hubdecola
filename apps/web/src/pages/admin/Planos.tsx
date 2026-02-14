import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlans, createPlan, updatePlan, deletePlan } from '@/lib/api';
import { Card, PageHeader, Loading, Button, Input, Textarea, Modal } from '@/components/ui';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from '@decolaweb/shared';

// Modal para criar/editar plano
function PlanModal({
  isOpen,
  onClose,
  plan,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan | null;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreatePlanRequest | UpdatePlanRequest>({
    name: plan?.name || '',
    price_monthly: plan?.price_monthly || 0,
    description: plan?.description || '',
    is_active: plan?.is_active !== undefined ? plan.is_active : true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlanRequest) => createPlan(data),
    onSuccess: () => {
      toast.success('Plano criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar plano');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) => updatePlan(id, data),
    onSuccess: () => {
      toast.success('Plano atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar plano');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (plan) {
      updateMutation.mutate({ id: plan.id, data: formData });
    } else {
      createMutation.mutate(formData as CreatePlanRequest);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? 'Editar Plano' : 'Criar Novo Plano'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Plano *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Site Profissional DecolaWeb"
          required
        />

        <div className="relative">
          <label className="block text-sm font-semibold text-dark mb-2">
            Preço Mensal (R$) *
          </label>
          <div className="flex items-center">
            <span className="absolute left-4 text-gray-500">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price_monthly}
              onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="99.90"
              required
            />
          </div>
        </div>

        <Textarea
          label="Descrição"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Site completo + hospedagem + domínio + e-mails + suporte"
          rows={3}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="is_active" className="text-sm font-semibold text-dark">
            Plano Ativo
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function Planos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      toast.success('Plano deletado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao deletar plano');
    },
  });

  const plans = data?.data || [];

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    if (confirm(`Tem certeza que deseja ${plan.is_active ? 'desativar' : 'deletar'} o plano "${plan.name}"?`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Planos"
        subtitle="Gerencie os planos de assinatura disponíveis"
        action={
          <Button onClick={handleCreate} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Criar Plano
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <Card className="col-span-full">
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum plano cadastrado ainda</p>
              <Button onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            </div>
          </Card>
        ) : (
          plans.map((plan: Plan) => (
            <Card key={plan.id} className={plan.is_active ? '' : 'opacity-60'}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark mb-1">{plan.name}</h3>
                  {!plan.is_active && (
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">Inativo</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(plan)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preço Mensal</p>
                  <p className="text-2xl font-black text-primary">
                    R$ {plan.price_monthly.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                {plan.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Descrição</p>
                    <p className="text-sm text-gray-800">{plan.description}</p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
      />
    </div>
  );
}


