import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '../../stores/quiz-store';
import { QuestionCard } from './question-card';
import { ProgressBar } from './progress-bar';
import { LeadForm } from './lead-form';
import { ResultPage } from './result-page';
import { slideTransition, slideVariants } from './animation-variants';
import { useQuiz } from '../../hooks/use-quiz';
import { useSubmitLead } from '../../hooks/use-submit-lead';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function QuizFlow() {
  const {
    quiz,
    stage,
    currentQuestionIndex,
    selectedAnswers,
    result,
    nextQuestion,
    previousQuestion,
    selectAnswer,
    setQuiz,
    setStage,
    setLeadData,
    setResult,
  } = useQuizStore();

  const [direction, setDirection] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: fetchedQuiz, isLoading, error } = useQuiz();
  const submitLead = useSubmitLead();

  useEffect(() => {
    if (fetchedQuiz) {
      setQuiz(fetchedQuiz);
    }
  }, [fetchedQuiz, setQuiz]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="text-2xl font-semibold text-destructive">Erro</div>
          <div className="text-muted-foreground">
            Não foi possível carregar o quiz. Tente novamente.
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return <div>Carregando...</div>;
  }

  if (stage === 'result' && result) {
    return <ResultPage result={result} />;
  }

  if (stage === 'form') {
    const handleFormSubmit = async (data: {
      name: string;
      email: string;
      phone: string;
    }) => {
      setLeadData(data);
      setSubmitError(null);

      const answers = Object.entries(selectedAnswers).map(
        ([questionId, alternativeId]) => ({
          questionId,
          alternativeId,
        })
      );

      try {
        const submittedResult = await submitLead.mutateAsync({
          ...data,
          answers,
        });
        setResult(submittedResult);
        setStage('result');
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 409) {
          setSubmitError('Este e-mail já realizou o quiz. Use um e-mail diferente.');
        } else {
          setSubmitError('Erro ao enviar respostas. Tente novamente.');
        }
      }
    };

    return (
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
        <div className="space-y-2">
          <h2 className="text-center text-2xl font-semibold">Quase lá!</h2>
          <p className="text-center text-muted-foreground">
            Preencha seus dados para ver o resultado.
          </p>
        </div>
        <LeadForm onSubmit={handleFormSubmit} isSubmitting={submitLead.isPending} />
        {submitError && (
          <p className="text-center text-sm text-destructive text-red-700">{submitError}</p>
        )}
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestion.id] || null;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      setStage('form');
      return;
    }
    setDirection(1);
    nextQuestion();
  };

  const handlePrevious = () => {
    setDirection(-1);
    previousQuestion();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={quiz.questions.length}
      />

      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={selectAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <Button
          data-testid="previous-button"
          variant="secondary"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
        >
          Anterior
        </Button>

        <Button
          data-testid="next-button"
          onClick={handleNext}
          disabled={!selectedAnswer}
        >
          {isLastQuestion ? 'Ver Resultado' : 'Próxima'}
        </Button>
      </div>
    </div>
  );
}
