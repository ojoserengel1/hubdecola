import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPipelineStages } from '@/lib/api';
import { Modal, Button, Loading } from '@/components/ui';
import { Filter, X } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  color?: string;
}

interface FilterPipelineStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStages: Set<string>;
  onApplyFilter: (selected: Set<string>) => void;
}

export function FilterPipelineStagesModal({
  isOpen,
  onClose,
  selectedStages,
  onApplyFilter,
}: FilterPipelineStagesModalProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(selectedStages);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: getPipelineStages,
    enabled: isOpen,
    retry: 1,
    retryDelay: 1000,
  });

  // Fallback para stages padrão se a tabela não existir ou houver erro
  const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Aguardando Briefing', slug: 'aguardando_briefing', display_order: 1, is_active: true },
    { id: '2', name: 'Copy', slug: 'copy', display_order: 2, is_active: true },
    { id: '3', name: 'Design', slug: 'design', display_order: 3, is_active: true },
    { id: '4', name: 'Web', slug: 'web', display_order: 4, is_active: true },
    { id: '5', name: 'Infraestrutura', slug: 'infraestrutura', display_order: 5, is_active: true },
    { id: '6', name: 'Domínio', slug: 'dominio', display_order: 6, is_active: true },
  ];

  const stages: PipelineStage[] = error || !data?.data || data.data.length === 0 
    ? defaultStages 
    : data.data;

  // Sincroniza o estado local quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setLocalSelected(new Set(selectedStages));
    }
  }, [isOpen, selectedStages]);

  const toggleStage = (stageSlug: string) => {
    const newSelected = new Set(localSelected);
    if (newSelected.has(stageSlug)) {
      newSelected.delete(stageSlug);
    } else {
      newSelected.add(stageSlug);
    }
    setLocalSelected(newSelected);
  };

  const selectAll = () => {
    setLocalSelected(new Set(stages.map((s) => s.slug)));
  };

  const clearAll = () => {
    setLocalSelected(new Set());
  };

  const handleApply = () => {
    onApplyFilter(localSelected);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelected(new Set(selectedStages));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Filtrar por Status"
      size="sm"
    >
      <div className="space-y-4">
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
            <p className="text-xs text-gray-400">
              Certifique-se de que a migration foi aplicada no banco de dados.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Selecione os status que deseja visualizar
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-primary hover:underline"
                >
                  Selecionar todos
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-600 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum estágio cadastrado
                </p>
              ) : (
                stages.map((stage) => {
                  const isSelected = localSelected.has(stage.slug);
                  return (
                    <button
                      key={stage.slug}
                      onClick={() => toggleStage(stage.slug)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <div
                          className="w-4 h-4 rounded flex-shrink-0"
                          style={{ backgroundColor: stage.color || '#FF002E' }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{stage.name}</p>
                          <p className="text-xs text-gray-500">{stage.slug}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">
                  {localSelected.size === 0
                    ? 'Nenhum status selecionado (mostrará todos)'
                    : `${localSelected.size} de ${stages.length} status selecionados`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleApply}
                  className="flex-1"
                >
                  Aplicar Filtro
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

