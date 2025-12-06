import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getAdminPipeline, updatePipeline, getPipelineStages } from '@/lib/api';
import { Card, PageHeader, Loading, Badge, Button } from '@/components/ui';
import { PipelineStage } from '@decolaweb/shared';
import { toast } from 'sonner';
import { GripVertical, ExternalLink, Settings, Filter } from 'lucide-react';
import { EditPipelineStagesModal } from '@/components/admin/EditPipelineStagesModal';
import { FilterPipelineStagesModal } from '@/components/admin/FilterPipelineStagesModal';

interface PipelineItem {
  id: string;
  user_id: string;
  stage: PipelineStage;
  notes?: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    company_name?: string;
  };
}

interface SortableItemProps {
  item: PipelineItem;
  isDraggingAny: boolean;
}

function SortableItem({ item, isDraggingAny }: SortableItemProps) {
  const navigate = useNavigate();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'pipeline-item',
      item,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = () => {
    // Se não estiver arrastando, navega
    if (!isDragging && !isDraggingAny) {
      console.log('🔍 Navegando para:', `/admin/clientes/${item.user_id}`);
      navigate(`/admin/clientes/${item.user_id}`);
    }
  };

  const handleGripClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-3 hover:shadow-md transition-shadow relative group ${
        isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}>
        <div className="flex items-start gap-2">
          {/* Área de drag (grip) - APENAS para arrastar */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing flex-shrink-0"
            onClick={handleGripClick}
            onPointerDown={handleGripClick}
          >
            <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </div>

          {/* Área clicável (resto do card) */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handleCardClick}
          >
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">
                {item.user?.company_name || item.user?.name || 'Cliente sem nome'}
              </h4>
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-gray-500 mb-2">{item.user?.name}</p>
            {item.notes && (
              <p className="text-xs text-gray-600 line-clamp-2">{item.notes}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Atualizado: {new Date(item.updated_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  id: PipelineStage;
  label: string;
  clients: PipelineItem[];
  isOver?: boolean;
  isDraggingAny: boolean;
}

function DroppableColumn({ id, label, clients, isOver, isDraggingAny }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'stage',
      stageId: id,
    },
  });

  return (
    <div className="flex flex-col w-80 flex-shrink-0" ref={setNodeRef}>
      {/* Coluna do Kanban */}
      <div className={`bg-gray-100 p-3 rounded-t-lg ${isOver ? 'bg-primary/20' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-dark text-sm">{label}</h3>
          <Badge variant="default">{clients.length}</Badge>
        </div>
      </div>

      {/* Cards dos clientes */}
      <div
        className={`bg-gray-50 p-2 rounded-b-lg min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto space-y-2 transition-colors ${
          isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''
        }`}
      >
        {clients.map((item) => (
          <SortableItem key={item.id} item={item} isDraggingAny={isDraggingAny} />
        ))}

        {clients.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            {isOver ? 'Solte aqui' : 'Nenhum cliente neste estágio'}
          </p>
        )}
      </div>
    </div>
  );
}

export function Pipeline() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pipeline'],
    queryFn: getAdminPipeline,
  });

  const { data: stagesData, isLoading: isLoadingStages } = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: getPipelineStages,
  });

  const updatePipelineMutation = useMutation({
    mutationFn: ({ userId, stage, notes }: { userId: string; stage: PipelineStage; notes?: string }) =>
      updatePipeline(userId, { stage, notes }),
    onSuccess: () => {
      toast.success('✅ Estágio do cliente atualizado!');
      queryClient.invalidateQueries({ queryKey: ['admin-pipeline'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar estágio');
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Usa stages do banco ou fallback para os padrões
  const stagesFromDB = stagesData?.data || [];
  const stages = stagesFromDB.length > 0
    ? stagesFromDB.map((s: any) => ({ id: s.slug, label: s.name, slug: s.slug }))
    : [
        { id: PipelineStage.WAITING_BRIEFING, label: 'Aguardando Briefing', slug: 'aguardando_briefing' },
        { id: PipelineStage.COPY, label: 'Copy', slug: 'copy' },
        { id: PipelineStage.DESIGN, label: 'Design', slug: 'design' },
        { id: PipelineStage.WEB, label: 'Web', slug: 'web' },
        { id: PipelineStage.INFRASTRUCTURE, label: 'Infraestrutura', slug: 'infraestrutura' },
        { id: PipelineStage.DOMAIN, label: 'Domínio', slug: 'dominio' },
      ];

  // Filtra stages baseado na seleção
  const filteredStages = selectedStages.size > 0
    ? stages.filter((s) => selectedStages.has(s.slug || s.id))
    : stages;

  if (isLoading || isLoadingStages) return <Loading />;

  const pipelineData: PipelineItem[] = data?.data || [];

  // Agrupa clientes por estágio
  const groupedByStage = filteredStages.map((stage) => {
    const clients = pipelineData.filter((item) => {
      const itemStage = item.stage as string;
      return itemStage === stage.slug || itemStage === stage.id || String(itemStage) === stage.slug || String(itemStage) === stage.id;
    });

    return {
      ...stage,
      clients,
    };
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDraggingAny(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overData = over.data.current;
      if (overData?.type === 'stage') {
        setOverId(over.id as string);
      } else {
        setOverId(null);
      }
    } else {
      setOverId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);
    setIsDraggingAny(false);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const activeItem = activeData.item as PipelineItem;
    let targetStageId: PipelineStage | null = null;

    // Se soltou em uma coluna (stage)
    if (overData.type === 'stage') {
      targetStageId = over.id as PipelineStage;
    }
    // Se soltou em outro item, pega o stage do item
    else if (overData.type === 'pipeline-item') {
      targetStageId = (overData.item as PipelineItem).stage;
    }

    if (!targetStageId) return;

    // Se o item foi solto no mesmo estágio, não faz nada
    if (activeItem.stage === targetStageId) return;

    // Atualiza o estágio do cliente
    const fromStage = stages.find((s) => s.id === activeItem.stage || s.slug === activeItem.stage)?.label || 'estágio anterior';
    const toStage = stages.find((s) => s.id === targetStageId || s.slug === targetStageId)?.label || 'novo estágio';

    updatePipelineMutation.mutate({
      userId: activeItem.user_id,
      stage: targetStageId,
      notes: activeItem.notes || `Movido de ${fromStage} para ${toStage}`,
    });
  };

  const activeItem = activeId
    ? pipelineData.find((item) => item.id === activeId)
    : null;

  const handleApplyFilter = (selected: Set<string>) => {
    setSelectedStages(selected);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Pipeline de Produção"
          subtitle="Arraste os clientes entre os estágios para atualizar o progresso"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtrar por Status
            {selectedStages.size > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                {selectedStages.size}
              </span>
            )}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Editar Status
          </Button>
        </div>
      </div>

      <EditPipelineStagesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <FilterPipelineStagesModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedStages={selectedStages}
        onApplyFilter={handleApplyFilter}
      />

      {/* Container do Kanban com scroll horizontal - APENAS ESTE CARD TEM SCROLL */}
      <Card className="p-0 overflow-hidden w-full max-w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Área de scroll horizontal - APENAS AQUI */}
          <div 
            className="overflow-x-auto overflow-y-hidden" 
            style={{ 
              maxHeight: 'calc(100vh - 350px)',
              scrollbarWidth: 'thin',
            }}
          >
            <div className="flex gap-4 min-w-max p-4">
              {groupedByStage.map((stage) => (
                <DroppableColumn
                  key={stage.id}
                  id={stage.id}
                  label={stage.label}
                  clients={stage.clients}
                  isOver={overId === stage.id}
                  isDraggingAny={isDraggingAny}
                />
              ))}
            </div>
          </div>

        <DragOverlay>
          {activeItem ? (
            <Card className="p-3 w-64 shadow-xl">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">
                    {activeItem.user?.company_name || activeItem.user?.name || 'Cliente sem nome'}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">{activeItem.user?.name}</p>
                  {activeItem.notes && (
                    <p className="text-xs text-gray-600 line-clamp-2">{activeItem.notes}</p>
                  )}
                </div>
              </div>
            </Card>
          ) : null}
          </DragOverlay>
        </DndContext>
      </Card>

      {/* Dica sobre drag & drop */}
      <Card className="mt-6 bg-green-50 border border-green-200">
        <p className="text-sm text-green-800">
          <strong>✨ Funcionalidade Ativa:</strong> Arraste os cards dos clientes entre as colunas
          para atualizar o estágio do projeto automaticamente.
        </p>
      </Card>
    </div>
  );
}
