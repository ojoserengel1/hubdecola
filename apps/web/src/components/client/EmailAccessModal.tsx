import { Modal, Button } from '@/components/ui';
import { Mail } from 'lucide-react';
import type { EmailProfessional } from '@decolaweb/shared';

interface EmailAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: EmailProfessional | null;
}

export function EmailAccessModal({ isOpen, onClose, email }: EmailAccessModalProps) {
  if (!email) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acessar E-mail Profissional" size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 mb-1">E-mail:</p>
            <p className="text-sm font-mono text-blue-800">{email.email}</p>
          </div>
        </div>

        {email.password_plain ? (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Mail className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 mb-1">Senha:</p>
              <p className="text-sm font-mono text-green-800">{email.password_plain}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              A senha ainda não foi configurada. Entre em contato com o suporte.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          {email.access_url && (
            <p className="text-sm text-gray-600">
              Clique em <strong>Acessar</strong> para abrir a página de login do seu e-mail.
            </p>
          )}
          <div className="flex gap-3">
            {email.access_url && (
              <Button
                variant="primary"
                onClick={() => {
                  window.open(email.access_url, '_blank', 'noopener,noreferrer');
                }}
              >
                Acessar
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

