import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAdminTickets } from '@/lib/api';
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
  Select,
} from '@/components/ui';
import { TicketStatus } from '@decolaweb/shared';

export function Tickets() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: () => getAdminTickets({ 
      status: statusFilter || undefined,
    }),
  });

  if (isLoading) return <Loading />;

  const tickets = data?.data || [];

  // Contadores
  const openCount = tickets.filter((t: any) => t.status === 'aberto').length;
  const inProgressCount = tickets.filter((t: any) => t.status === 'em_andamento').length;

  return (
    <div>
      <PageHeader
        title="Tickets de Suporte"
        subtitle={`${tickets.length} ticket(s) no total`}
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total de Tickets</p>
          <p className="text-3xl font-black text-dark">{tickets.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Abertos</p>
          <p className="text-3xl font-black text-red-600">{openCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Em Andamento</p>
          <p className="text-3xl font-black text-yellow-600">{inProgressCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Respondidos</p>
          <p className="text-3xl font-black text-green-600">
            {tickets.filter((t: any) => t.status === 'respondido').length}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="max-w-xs">
          <Select
            label="Filtrar por Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: TicketStatus.OPEN, label: 'Aberto' },
              { value: TicketStatus.IN_PROGRESS, label: 'Em Andamento' },
              { value: TicketStatus.ANSWERED, label: 'Respondido' },
              { value: TicketStatus.CLOSED, label: 'Fechado' },
            ]}
          />
        </div>
      </Card>

      {/* Lista de Tickets */}
      <Card className="overflow-hidden">
        {tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[25%]">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[40%]">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[20%]">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket: any) => (
                  <tr
                    key={ticket.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                  >
                    <td className="px-4 py-4 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate" title={ticket.user?.company_name || ticket.user?.name || 'N/A'}>
                          {ticket.user?.company_name || ticket.user?.name || 'N/A'}
                        </p>
                        {ticket.user?.company_name && ticket.user?.name && (
                          <p className="text-xs text-gray-500 truncate mt-0.5" title={ticket.user.name}>
                            {ticket.user.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate" title={ticket.subject}>
                          {ticket.subject}
                        </p>
                        <p 
                          className="text-xs text-gray-500 truncate mt-0.5" 
                          title={ticket.description}
                        >
                          {ticket.description && ticket.description.length > 70 
                            ? `${ticket.description.substring(0, 70)}...` 
                            : ticket.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} type="ticket" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Nenhum ticket encontrado</p>
        )}
      </Card>
    </div>
  );
}

