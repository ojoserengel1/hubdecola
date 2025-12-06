import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPipelineStages,
  createPipelineStage,
  updatePipelineStage,
  reorderPipelineStages,
  deletePipelineStage,
} from '@/lib/api';
import {
  Modal,
  Button,
  Input,
  Loading,
} from '@/components/ui';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Edit2, X } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  color?: string;
}

interface EditPipelineStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SortableStageItem({
  stage,
  onEdit,
  onDelete,
}: {
  stage: PipelineStage;
  onEdit: (stage: PipelineStage) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      <div
        className="w-4 h-4 rounded"
        style={{ backgroundColor: stage.color || '#FF002E' }}
      />
      <div className="flex-1">
        <p className="font-semibold">{stage.name}</p>
        <p className="text-xs text-gray-500">{stage.slug}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(stage)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(stage.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function EditPipelineStagesModal({ isOpen, onClose }: EditPipelineStagesModalProps) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageSlug, setNewStageSlug] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: getPipelineStages,
    enabled: isOpen,
    retry: 1,
    retryDelay: 1000,
  });

  // Fallback para stages padrão se a tabela não existir ou houver erro
  const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Aguardando Briefing', slug: 'aguardando_briefing', display_order: 1, is_active: true, color: '#FF002E' },
    { id: '2', name: 'Copy', slug: 'copy', display_order: 2, is_active: true, color: '#FF002E' },
    { id: '3', name: 'Design', slug: 'design', display_order: 3, is_active: true, color: '#FF002E' },
    { id: '4', name: 'Web', slug: 'web', display_order: 4, is_active: true, color: '#FF002E' },
    { id: '5', name: 'Infraestrutura', slug: 'infraestrutura', display_order: 5, is_active: true, color: '#FF002E' },
    { id: '6', name: 'Domínio', slug: 'dominio', display_order: 6, is_active: true, color: '#FF002E' },
  ];

  const stages: PipelineStage[] = error || !data?.data || data.data.length === 0 
    ? defaultStages 
    : data.data;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const createMutation = useMutation({
    mutationFn: createPipelineStage,
    onSuccess: () => {
      toast.success('✅ Estágio criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pipeline'] });
      setIsCreating(false);
      setNewStageName('');
      setNewStageSlug('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar estágio');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePipelineStage(id, data),
    onSuccess: () => {
      toast.success('✅ Estágio atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pipeline'] });
      setEditingStage(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar estágio');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePipelineStage,
    onSuccess: () => {
      toast.success('✅ Estágio excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pipeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir estágio');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderPipelineStages,
    onSuccess: () => {
      toast.success('✅ Ordem atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pipeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao reordenar estágios');
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = stages.findIndex((s) => s.id === active.id);
    const newIndex = stages.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newStages = [...stages];
    const [removed] = newStages.splice(oldIndex, 1);
    newStages.splice(newIndex, 0, removed);

    const reorderedStages = newStages.map((stage, index) => ({
      id: stage.id,
      display_order: index + 1,
    }));

    reorderMutation.mutate(reorderedStages);
  };

  const handleCreate = () => {
    if (!newStageName.trim() || !newStageSlug.trim()) {
      toast.error('Nome e slug são obrigatórios');
      return;
    }

    createMutation.mutate({
      name: newStageName.trim(),
      slug: newStageSlug.trim().toLowerCase().replace(/\s+/g, '_'),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este estágio?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (stage: PipelineStage) => {
    setEditingStage(stage);
    setNewStageName(stage.name);
    setNewStageSlug(stage.slug);
    setIsCreating(true);
  };

  const handleSaveEdit = () => {
    if (!editingStage || !newStageName.trim() || !newStageSlug.trim()) return;

    updateMutation.mutate({
      id: editingStage.id,
      data: {
        name: newStageName.trim(),
        slug: newStageSlug.trim().toLowerCase().replace(/\s+/g, '_'),
      },
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingStage(null);
    setNewStageName('');
    setNewStageSlug('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Estágios do Pipeline"
      size="lg"
    >
      <div className="space-y-4">
        {/* Botão Criar Novo */}
        {!isCreating && (
          <Button
            variant="primary"
            onClick={() => {
              setIsCreating(true);
              setEditingStage(null);
              setNewStageName('');
              setNewStageSlug('');
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Novo Estágio
          </Button>
        )}

        {/* Formulário Criar/Editar */}
        {isCreating && (
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {editingStage ? 'Editar Estágio' : 'Novo Estágio'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Input
                label="Nome do Estágio"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Ex: Revisão Final"
              />
              <Input
                label="Slug (identificador)"
                value={newStageSlug}
                onChange={(e) => setNewStageSlug(e.target.value)}
                placeholder="Ex: revisao_final"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={editingStage ? handleSaveEdit : handleCreate}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {editingStage ? 'Salvar' : 'Criar'}
                </Button>
                <Button variant="secondary" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Estágios */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loading />
            <p className="text-sm text-gray-500 mt-4">Carregando estágios...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">
              ⚠️ Erro ao carregar estágios. Usando estágios padrão.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Certifique-se de que a migration foi aplicada no banco de dados.
            </p>
            <p className="text-xs text-gray-500">
              Você pode usar os estágios padrão ou aplicar a migration para habilitar a edição completa.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-3">Estágios ({stages.length})</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stages.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {stages.map((stage) => (
                    <SortableStageItem
                      key={stage.id}
                      stage={stage}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {stages.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhum estágio cadastrado
              </p>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            💡 <strong>Dica:</strong> Arraste os estágios para reordená-los. A ordem aqui será
            refletida no Pipeline de Produção.
          </p>
        </div>
      </div>
    </Modal>
  );
}

