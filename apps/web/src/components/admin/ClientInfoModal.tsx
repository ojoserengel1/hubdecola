import { Modal } from '@/components/ui';
import { X, Mail, Phone, Building2, Calendar } from 'lucide-react';
import type { Profile } from '@decolaweb/shared';

interface ClientInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Profile | null;
}

export function ClientInfoModal({ isOpen, onClose, client }: ClientInfoModalProps) {
  if (!client) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-dark">Informações do Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Building2 className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Nome Completo</p>
              <p className="text-dark">{client.name}</p>
            </div>
          </div>

          {client.company_name && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Empresa</p>
                <p className="text-dark">{client.company_name}</p>
              </div>
            </div>
          )}

          {client.email && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">E-mail</p>
                <p className="text-dark">{client.email}</p>
              </div>
            </div>
          )}

          {client.whatsapp && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">WhatsApp</p>
                <p className="text-dark">{client.whatsapp}</p>
              </div>
            </div>
          )}

          {client.created_at && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Cliente desde</p>
                <p className="text-dark">
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}

