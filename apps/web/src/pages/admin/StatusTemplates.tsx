import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSiteStatusTemplates, createSiteStatusTemplate, updateSiteStatusTemplate, deleteSiteStatusTemplate, reorderSiteStatusTemplates } from '@/lib/api';
import { Card, PageHeader, Loading, Button, Input, Textarea, Modal } from '@/components/ui';
import { Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteStatusTemplate, StatusButton, CreateSiteStatusTemplateRequest } from '@decolaweb/shared';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente para item sortable
function SortableTemplateItem({ 
  template, 
  onEdit, 
  onDelete 
}: { 
  template: SiteStatusTemplate; 
  onEdit: (template: SiteStatusTemplate) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colorSchemes = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div ref={setNodeRef} style={style} className={`${colorSchemes[template.color_scheme]} border rounded-lg p-4 mb-3`}>
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-dark">{template.name}</h3>
              <p className="text-xs text-gray-500">Slug: {template.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              {!template.is_active && (
                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">Inativo</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(template)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(template.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Headline:</span> {template.headline}</p>
            {template.subheadline && (
              <p><span className="font-semibold">Subheadline:</span> {template.subheadline}</p>
            )}
            <p><span className="font-semibold">Botões:</span> {template.buttons?.length || 0}</p>
            <p><span className="font-semibold">Ordem:</span> {template.display_order}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para criar/editar template
function TemplateModal({
  isOpen,
  onClose,
  template,
}: {
  isOpen: boolean;
  onClose: () => void;
  template?: SiteStatusTemplate | null;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateSiteStatusTemplateRequest>({
    slug: template?.slug || '',
    name: template?.name || '',
    headline: template?.headline || '',
    subheadline: template?.subheadline || '',
    color_scheme: template?.color_scheme || 'gray',
    display_order: template?.display_order || 0,
    is_active: template?.is_active !== undefined ? template.is_active : true,
    buttons: template?.buttons || [],
  });

  const [buttons, setButtons] = useState<StatusButton[]>(formData.buttons || []);
  const [editingButtonIndex, setEditingButtonIndex] = useState<number | null>(null);
  const [newButton, setNewButton] = useState<Partial<StatusButton>>({
    label: '',
    action: 'navigate',
    variant: 'primary',
    icon: '',
    url: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSiteStatusTemplateRequest) => createSiteStatusTemplate(data),
    onSuccess: () => {
      toast.success('Template criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['site-status-templates'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSiteStatusTemplate(id, data),
    onSuccess: () => {
      toast.success('Template atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['site-status-templates'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar template');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      buttons,
    };

    if (template) {
      updateMutation.mutate({ id: template.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addButton = () => {
    if (newButton.label) {
      setButtons([...buttons, newButton as StatusButton]);
      setNewButton({ label: '', action: 'navigate', variant: 'primary', icon: '', url: '' });
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, updates: Partial<StatusButton>) => {
    setButtons(buttons.map((btn, i) => i === index ? { ...btn, ...updates } : btn));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Editar Template de Status' : 'Criar Template de Status'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Slug *"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="aguardando_preenchimento"
            disabled={!!template}
            helperText="Identificador único (não pode ser alterado)"
            required
          />
          <Input
            label="Nome *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Aguardando Preenchimento do Briefing"
            required
          />
        </div>

        <Input
          label="Headline *"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          placeholder="Status do Seu Site"
          required
        />

        <Textarea
          label="Subheadline"
          value={formData.subheadline || ''}
          onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
          placeholder="Descrição do status..."
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Esquema de Cores
            </label>
            <select
              value={formData.color_scheme}
              onChange={(e) => setFormData({ ...formData, color_scheme: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="gray">Cinza</option>
              <option value="blue">Azul</option>
              <option value="yellow">Amarelo</option>
              <option value="green">Verde</option>
              <option value="red">Vermelho</option>
              <option value="purple">Roxo</option>
            </select>
          </div>

          <Input
            label="Ordem de Exibição"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="is_active" className="text-sm font-semibold text-dark">
            Status Ativo
          </label>
        </div>

        {/* Botões */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-dark mb-3">Botões do Banner</h4>
          
          {buttons.map((button, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  label="Label"
                  value={button.label}
                  onChange={(e) => updateButton(index, { label: e.target.value })}
                  size="sm"
                />
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Ação</label>
                  <select
                    value={button.action}
                    onChange={(e) => updateButton(index, { action: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="navigate">Navegar</option>
                    <option value="approve">Aprovar</option>
                    <option value="custom">Customizado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Variante</label>
                  <select
                    value={button.variant || 'primary'}
                    onChange={(e) => updateButton(index, { variant: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
                <Input
                  label="Ícone (lucide-react)"
                  value={button.icon || ''}
                  onChange={(e) => updateButton(index, { icon: e.target.value })}
                  placeholder="FileText"
                  size="sm"
                />
              </div>
              {button.action === 'navigate' && (
                <Input
                  label="URL"
                  value={button.url || ''}
                  onChange={(e) => updateButton(index, { url: e.target.value })}
                  placeholder="/app/briefing"
                  size="sm"
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeButton(index)}
                className="mt-2 text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </div>
          ))}

          {/* Adicionar novo botão */}
          <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Input
                label="Label"
                value={newButton.label || ''}
                onChange={(e) => setNewButton({ ...newButton, label: e.target.value })}
                placeholder="Preencher Briefing"
                size="sm"
              />
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Ação</label>
                <select
                  value={newButton.action || 'navigate'}
                  onChange={(e) => setNewButton({ ...newButton, action: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="navigate">Navegar</option>
                  <option value="approve">Aprovar</option>
                  <option value="custom">Customizado</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Variante</label>
                <select
                  value={newButton.variant || 'primary'}
                  onChange={(e) => setNewButton({ ...newButton, variant: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                </select>
              </div>
              <Input
                label="Ícone"
                value={newButton.icon || ''}
                onChange={(e) => setNewButton({ ...newButton, icon: e.target.value })}
                placeholder="FileText"
                size="sm"
              />
            </div>
            {newButton.action === 'navigate' && (
              <Input
                label="URL"
                value={newButton.url || ''}
                onChange={(e) => setNewButton({ ...newButton, url: e.target.value })}
                placeholder="/app/briefing"
                size="sm"
              />
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addButton}
              className="mt-2 w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Botão
            </Button>
          </div>
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

export function StatusTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SiteStatusTemplate | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data, isLoading } = useQuery({
    queryKey: ['site-status-templates'],
    queryFn: getSiteStatusTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSiteStatusTemplate,
    onSuccess: () => {
      toast.success('Template deletado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['site-status-templates'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao deletar template');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderSiteStatusTemplates,
    onSuccess: () => {
      toast.success('Ordem atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['site-status-templates'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao reordenar templates');
    },
  });

  const templates = data?.data || [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = templates.findIndex((t: SiteStatusTemplate) => t.id === active.id);
      const newIndex = templates.findIndex((t: SiteStatusTemplate) => t.id === over.id);

      const newTemplates = arrayMove(templates, oldIndex, newIndex);
      const reorderedTemplates = newTemplates.map((template, index) => ({
        id: template.id,
        display_order: index + 1,
      }));

      reorderMutation.mutate(reorderedTemplates);
    }
  };

  const handleEdit = (template: SiteStatusTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Templates de Status do Site"
        subtitle="Gerencie os status exibidos no Dashboard dos clientes"
        action={
          <Button onClick={handleCreate} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Criar Template
          </Button>
        }
      />

      <Card>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Arraste os templates para reordená-los. Os templates são exibidos no Dashboard dos clientes conforme o status definido em cada cliente.
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={templates.map((t: SiteStatusTemplate) => t.id)} strategy={verticalListSortingStrategy}>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhum template criado ainda</p>
                <Button onClick={handleCreate} variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              </div>
            ) : (
              templates.map((template: SiteStatusTemplate) => (
                <SortableTemplateItem
                  key={template.id}
                  template={template}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </Card>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
      />
    </div>
  );
}


