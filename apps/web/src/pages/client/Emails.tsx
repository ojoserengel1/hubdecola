import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/api';
import {
  Card,
  PageHeader,
  Loading,
  StatusBadge,
  Button,
  EmptyState,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui';
import { Mail, Plus } from 'lucide-react';

export function Emails() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });

  if (isLoading) return <Loading />;

  const emails = data?.data?.emails || [];
  const profile = data?.data?.profile;

  return (
    <div>
      <PageHeader
        title="E-mails Profissionais"
        subtitle="Gerencie seus e-mails corporativos"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Solicitar E-mail
          </Button>
        }
      />

      {/* Card: Informações */}
      <Card className="mb-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              E-mails Profissionais inclusos no plano
            </h4>
            <p className="text-sm text-blue-800">
              Você pode ter até 5 contas de e-mail profissional com o domínio do seu site.
              Ex: contato@{profile?.company_name?.toLowerCase().replace(/\s+/g, '-') || 'seusite'}.com.br
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de E-mails */}
      <Card>
        <h3 className="text-lg font-semibold text-dark mb-6">Seus E-mails</h3>

        {emails.length > 0 ? (
          <Table>
            <TableHeader>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Ações</TableHead>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{email.email}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={email.status} type="email" />
                  </TableCell>
                  <TableCell>
                    {new Date(email.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {email.status === 'ativo' && (
                      <Button size="sm" variant="ghost">
                        Configurar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={<Mail className="w-16 h-16 text-gray-400" />}
            title="Nenhum e-mail configurado"
            description="Solicite a criação do seu primeiro e-mail profissional"
            action={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Solicitar E-mail
              </Button>
            }
          />
        )}
      </Card>

      {/* Card: Como Configurar */}
      <Card className="mt-6">
        <h4 className="font-semibold text-dark mb-3">📧 Como configurar meu e-mail?</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Após a aprovação do seu e-mail, você receberá as credenciais e instruções de configuração.
          </p>
          <p>
            Você poderá acessar seus e-mails através de:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Webmail (acesso pelo navegador)</li>
            <li>Cliente de e-mail (Outlook, Gmail, Apple Mail, etc.)</li>
            <li>Aplicativo de celular</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

