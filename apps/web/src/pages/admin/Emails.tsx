import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAdminEmails } from '@/lib/api';
import {
  Card,
  PageHeader,
  Loading,
  StatusBadge,
  Button,
} from '@/components/ui';
import { AtSign } from 'lucide-react';
import { UpdateEmailStatusModal } from '@/components/admin/UpdateEmailStatusModal';
import type { EmailProfessional } from '@decolaweb/shared';
import { EmailStatus } from '@decolaweb/shared';

interface EmailWithClient extends EmailProfessional {
  profile?: {
    id: string;
    name: string;
    company_name?: string;
    email?: string;
  };
}

export function Emails() {
  const navigate = useNavigate();
  const [isEmailStatusModalOpen, setIsEmailStatusModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailWithClient | null>(null);
  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-emails'],
    queryFn: getAdminEmails,
  });

  if (isLoading) return <Loading />;

  const allEmails: EmailWithClient[] = data?.data || [];
  
  // Filtra e-mails baseado no status selecionado
  const emails = statusFilter === 'all' 
    ? allEmails 
    : allEmails.filter(email => email.status === statusFilter);

  return (
    <div>
      <PageHeader
        title="E-mails Profissionais"
        subtitle="Gerencie todos os e-mails solicitados pelos clientes"
      />

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AtSign className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Todos os E-mails</h3>
          </div>
          
          {/* Filtros de Status */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter('all')}
            >
              Todos ({allEmails.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === EmailStatus.PENDING ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter(EmailStatus.PENDING)}
            >
              Pendente ({allEmails.filter(e => e.status === EmailStatus.PENDING).length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === EmailStatus.ACTIVE ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter(EmailStatus.ACTIVE)}
            >
              Ativo ({allEmails.filter(e => e.status === EmailStatus.ACTIVE).length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === EmailStatus.CANCELED ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter(EmailStatus.CANCELED)}
            >
              Cancelado ({allEmails.filter(e => e.status === EmailStatus.CANCELED).length})
            </Button>
          </div>
        </div>

        {emails.length > 0 ? (
          <div className="space-y-3">
            {emails.map((email: EmailWithClient) => (
              <div key={email.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-mono font-semibold text-primary">{email.email}</p>
                    {email.profile && (
                      <button
                        onClick={() => navigate(`/admin/clientes/${email.profile!.id}`)}
                        className="text-sm text-gray-600 hover:text-primary hover:underline mt-1"
                      >
                        Cliente: {email.profile.name}
                        {email.profile.company_name && ` - ${email.profile.company_name}`}
                        {email.profile.email && ` (${email.profile.email})`}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={email.status} type="email" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedEmail(email);
                        setIsEmailStatusModalOpen(true);
                      }}
                    >
                      Editar Status
                    </Button>
                  </div>
                </div>
                {email.access_url && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>URL de Acesso:</strong>{' '}
                    <a
                      href={email.access_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-xs"
                    >
                      {email.access_url}
                    </a>
                  </p>
                )}
                {email.password_plain && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Senha:</strong> <span className="font-mono">{email.password_plain}</span>
                  </p>
                )}
                {email.notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Observações:</strong> {email.notes}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Criado em: {new Date(email.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AtSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? 'Nenhum e-mail solicitado'
                : `Nenhum e-mail com status "${statusFilter === EmailStatus.PENDING ? 'Pendente' : statusFilter === EmailStatus.ACTIVE ? 'Ativo' : 'Cancelado'}"`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter === 'all' 
                ? 'Os e-mails solicitados pelos clientes aparecerão aqui'
                : 'Tente selecionar outro filtro ou aguarde novas solicitações'}
            </p>
          </div>
        )}
      </Card>

      {/* Modal de Atualização de Status do E-mail */}
      {selectedEmail && (
        <UpdateEmailStatusModal
          isOpen={isEmailStatusModalOpen}
          onClose={() => {
            setIsEmailStatusModalOpen(false);
            setSelectedEmail(null);
          }}
          email={selectedEmail}
          clientId={selectedEmail.user_id}
        />
      )}
    </div>
  );
}

