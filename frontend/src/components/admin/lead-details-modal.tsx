import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
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
import { ScoreCircle } from '@/components/ui/score-circle';
import { formatPhone } from '@/lib/format-phone';

interface LeadDetailsModalProps {
  leadId: string | null;
  onClose: () => void;
}

/**
 * Modal de detalhes do lead (RF-06, US-07). Exibe informações de contato,
 * resultado do diagnóstico (com ScoreCircle) e resumo das respostas do quiz
 * (oculto por padrão, acessível via toggle).
 */
export function LeadDetailsModal({ leadId, onClose }: LeadDetailsModalProps) {
  const { data, isLoading, isError } = useLeadDetails(leadId);
  const [showAnswers, setShowAnswers] = useState(false);

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
            {/* Score e Faixa */}
            <section className="flex flex-col items-center space-y-4 py-4">
              <ScoreCircle score={data.result.score} />
              <div className="text-center">
                <h3 className="text-2xl font-semibold">
                  {data.result.diagnosticTitle}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {data.result.diagnosticMessage}
                </p>
              </div>
            </section>

            {/* Informações de Contato */}
            <section>
              <h3 className="text-lg font-semibold mb-3">
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground text-xs mb-1">Nome</p>
                  <p className="font-medium">{data.contactInfo.name}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground text-xs mb-1">Email</p>
                  <p className="font-medium break-all">{data.contactInfo.email}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground text-xs mb-1">Telefone</p>
                  <p className="font-medium">{formatPhone(data.contactInfo.phone)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground text-xs mb-1">Data de cadastro</p>
                  <p className="font-medium">
                    {new Date(data.contactInfo.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </section>

            {/* Respostas (toggle) */}
            <section>
              <Button
                variant="outline"
                onClick={() => setShowAnswers(!showAnswers)}
                className="w-full"
              >
                {showAnswers ? 'Ocultar respostas' : 'Ver respostas'}
              </Button>

              {showAnswers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 mt-4"
                >
                  {data.answersSummary.map((answer, index) => (
                    <div key={index} className="rounded-lg border border-border p-4">
                      <p className="font-medium text-sm">{answer.questionText}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Resposta:{' '}
                        <span className="font-medium">{answer.selectedOptionText}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score: {answer.score}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
