import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '../../stores/quiz-store';
import { QuestionCard } from './question-card';
import { ProgressBar } from './progress-bar';
import { slideVariants } from './animation-variants';

export function QuizFlow() {
  const {
    quiz,
    currentQuestionIndex,
    selectedAnswers,
    nextQuestion,
    previousQuestion,
    selectAnswer,
  } = useQuizStore();

  if (!quiz) {
    return <div>Carregando...</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestion.id] || null;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={quiz.questions.length}
      />

      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
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
          onClick={previousQuestion}
          disabled={isFirstQuestion}
          className="rounded-lg bg-secondary px-6 py-2 text-secondary-foreground disabled:opacity-50"
        >
          Anterior
        </button>

        <button
          onClick={nextQuestion}
          disabled={isLastQuestion || !selectedAnswer}
          className="rounded-lg bg-primary px-6 py-2 text-primary-foreground disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
