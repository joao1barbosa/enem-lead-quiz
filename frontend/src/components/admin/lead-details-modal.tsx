import { X } from 'lucide-react';
import { useLeadDetails } from '../../hooks/use-lead-details';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPhone } from '@/lib/format-phone';

interface LeadDetailsModalProps {
  leadId: string | null;
  onClose: () => void;
}

/**
 * Modal de detalhes do lead (RF-06, US-07). Exibe informações de contato,
 * resultado do diagnóstico e resumo das respostas do quiz.
 *
 * Baseado no Dialog do shadcn/ui (Radix), que fornece focus-trap,
 * fechamento por ESC e role="dialog" nativos.
 */
export function LeadDetailsModal({ leadId, onClose }: LeadDetailsModalProps) {
  const { data, isLoading, isError } = useLeadDetails(leadId);

  return (
    <Dialog
      open={leadId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        data-testid="lead-details-modal"
        hideCloseButton
        overlayClassName="bg-black/50"
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <DialogClose
          aria-label="Fechar"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="w-5 h-5" />
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Detalhes do Lead
          </DialogTitle>
          <DialogDescription className="sr-only">
            Informações de contato, resultado do diagnóstico e respostas do quiz.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div data-testid="lead-details-skeleton" className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && (
          <div className="py-8 text-center space-y-4">
            <p className="text-destructive">Erro ao carregar detalhes do lead</p>
            <Button data-testid="details-error-close" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">
                Informações de Contato
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Nome:</strong> {data.contactInfo.name}
                </p>
                <p>
                  <strong>Email:</strong> {data.contactInfo.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {formatPhone(data.contactInfo.phone)}
                </p>
                <p>
                  <strong>Data de cadastro:</strong>{' '}
                  {new Date(data.contactInfo.createdAt).toLocaleDateString(
                    'pt-BR'
                  )}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Resultado</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Pontuação:</strong> {data.result.score}
                </p>
                <p>
                  <strong>Faixa:</strong> {data.result.diagnosticTitle}
                </p>
                <p>
                  <strong>Mensagem:</strong> {data.result.diagnosticMessage}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Respostas</h3>
              <ul className="space-y-3">
                {data.answersSummary.map((answer, index) => (
                  <li key={index} className="text-sm border rounded-lg p-3">
                    <p className="font-medium">{answer.questionText}</p>
                    <p className="text-gray-600 mt-1">
                      Resposta: {answer.selectedOptionText}
                    </p>
                    <p className="text-gray-500">Score: {answer.score}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
