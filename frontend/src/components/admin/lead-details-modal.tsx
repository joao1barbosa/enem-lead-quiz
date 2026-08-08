import { X } from 'lucide-react';
import { useLeadDetails } from '../../hooks/use-lead-details';

interface LeadDetailsModalProps {
  leadId: string | null;
  onClose: () => void;
}

/**
 * Modal de detalhes do lead (RF-06, US-07). Exibe informações de contato,
 * resultado do diagnóstico e resumo das respostas do quiz.
 */
export function LeadDetailsModal({ leadId, onClose }: LeadDetailsModalProps) {
  const { data, isLoading } = useLeadDetails(leadId);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Detalhes do Lead</h2>

        {isLoading && (
          <p className="text-center text-gray-500">Carregando detalhes...</p>
        )}

        {data && (
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Informações de Contato</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nome:</strong> {data.contactInfo.name}</p>
                <p><strong>Email:</strong> {data.contactInfo.email}</p>
                <p><strong>Telefone:</strong> {data.contactInfo.phone}</p>
                <p>
                  <strong>Data de cadastro:</strong>{' '}
                  {new Date(data.contactInfo.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Resultado</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Pontuação:</strong> {data.result.score}</p>
                <p><strong>Faixa:</strong> {data.result.diagnosticTitle}</p>
                <p><strong>Mensagem:</strong> {data.result.diagnosticMessage}</p>
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
      </div>
    </div>
  );
}
