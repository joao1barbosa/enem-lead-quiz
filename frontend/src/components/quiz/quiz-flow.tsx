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
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="text-2xl font-semibold">Carregando quiz...</div>
          <div className="text-muted-foreground">Aguarde um momento</div>
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
      <div className="mx-auto max-w-2xl space-y-8 p-6">
        <div className="space-y-2">
          <h2 className="text-center text-2xl font-semibold">Quase lá!</h2>
          <p className="text-center text-muted-foreground">
            Preencha seus dados para ver o resultado.
          </p>
        </div>
        <LeadForm onSubmit={handleFormSubmit} isSubmitting={submitLead.isPending} />
        {submitError && (
          <p className="text-center text-sm text-destructive">{submitError}</p>
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
    <div className="mx-auto max-w-2xl space-y-8 p-6">
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
        <button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="rounded-lg bg-secondary px-6 py-2 text-secondary-foreground disabled:opacity-50"
        >
          Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="rounded-lg bg-primary px-6 py-2 text-primary-foreground disabled:opacity-50"
        >
          {isLastQuestion ? 'Ver Resultado' : 'Próxima'}
        </button>
      </div>
    </div>
  );
}
