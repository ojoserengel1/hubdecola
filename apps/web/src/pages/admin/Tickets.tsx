import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Badge,
  Select,
} from '@/components/ui';
import { TicketPriority, TicketStatus } from '@decolaweb/shared';

export function Tickets() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter, priorityFilter],
    queryFn: () => getAdminTickets({ 
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Select
            label="Filtrar por Prioridade"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: '', label: 'Todas' },
              { value: TicketPriority.LOW, label: 'Baixa' },
              { value: TicketPriority.MEDIUM, label: 'Média' },
              { value: TicketPriority.HIGH, label: 'Alta' },
            ]}
          />
        </div>
      </Card>

      {/* Lista de Tickets */}
      <Card>
        {tickets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableHead>Cliente</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket: any) => (
                <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-semibold">{ticket.user?.name}</p>
                      <p className="text-xs text-gray-500">{ticket.user?.company_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {ticket.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticket.priority === 'alta'
                          ? 'error'
                          : ticket.priority === 'media'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} type="ticket" />
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500 py-8">Nenhum ticket encontrado</p>
        )}
      </Card>
    </div>
  );
}

