import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAdminClients } from '@/lib/api';
import {
  Card,
  PageHeader,
  Loading,
  StatusBadge,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Input,
  EmptyState,
  Button,
} from '@/components/ui';
import { Search, Users, UserPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CreateClientModal } from '@/components/admin/CreateClientModal';
import { DeleteClientModal } from '@/components/admin/DeleteClientModal';

export function Clientes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
    id: string;
    name: string;
    company_name?: string;
    email?: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: getAdminClients,
  });

  if (isLoading) return <Loading />;

  const clients = data?.data || [];

  // Filtra clientes baseado no termo de busca
  const filteredClients = clients.filter((client: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.company_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
      <PageHeader
        title="Clientes"
        subtitle={`${clients.length} cliente(s) cadastrado(s)`}
      />
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Novo Cliente
        </Button>
      </div>

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {clientToDelete && (
        <DeleteClientModal
          isOpen={!!clientToDelete}
          onClose={() => setClientToDelete(null)}
          client={clientToDelete}
        />
      )}

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por nome, empresa ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus:ring-0"
          />
        </div>
      </Card>

      <Card>
        {filteredClients.length > 0 ? (
          <Table>
            <TableHeader>
              <TableHead>Cliente</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead>Status do Site</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client: any) => (
                <TableRow
                  key={client.id}
                  onClick={() => navigate(`/admin/clientes/${client.id}`)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.company_name || '-'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Normaliza subscriptions (pode vir como array)
                      let subscription = null;
                      if (Array.isArray(client.subscriptions)) {
                        // Pega a subscription ativa ou a mais recente
                        subscription = client.subscriptions.find((s: any) => s.status === 'ativa') || client.subscriptions[0] || null;
                      } else if (client.subscriptions) {
                        subscription = client.subscriptions;
                      } else if (Array.isArray(client.subscription)) {
                        subscription = client.subscription[0] || null;
                      } else if (client.subscription) {
                        subscription = client.subscription;
                      }
                      
                      // Tenta pegar o plano da subscription primeiro, depois do profile
                      const plan = subscription?.plan || 
                                   client.plan ||
                                   (Array.isArray(client.plan) && client.plan[0]);
                      
                      if (plan?.name) {
                        return (
                          <div>
                            <p className="font-semibold">
                              {plan.name}
                            </p>
                            {plan.price_monthly && (
                              <p className="text-xs text-gray-500">
                                R$ {typeof plan.price_monthly === 'number' 
                                  ? plan.price_monthly.toFixed(2).replace('.', ',')
                                  : parseFloat(String(plan.price_monthly)).toFixed(2).replace('.', ',')}/mês
                              </p>
                            )}
                          </div>
                        );
                      }
                      return '-';
                    })()}
                  </TableCell>
                  <TableCell>
                    {client.subscription ? (
                      <StatusBadge
                        status={client.subscription.status}
                        type="subscription"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {client.site_status ? (
                      <StatusBadge
                        status={client.site_status[0]?.status}
                        type="site"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() =>
                        setClientToDelete({
                          id: client.id,
                          name: client.name,
                          company_name: client.company_name,
                          email: client.email,
                        })
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={<Users className="w-16 h-16 text-gray-400" />}
            title={searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            description={
              searchTerm
                ? 'Tente buscar com outros termos'
                : 'Os clientes aparecerão aqui quando forem cadastrados'
            }
          />
        )}
      </Card>
    </div>
  );
}

