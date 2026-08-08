import { motion } from 'framer-motion';
import type { Question } from '../../types/quiz';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (questionId: string, alternativeId: string) => void;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{question.text}</h2>
      <div className="space-y-3">
        {question.alternatives.map((alternative) => {
          const isSelected = selectedAnswer === alternative.id;
          return (
            <motion.button
              key={alternative.id}
              onClick={() => onSelectAnswer(question.id, alternative.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary'
              }`}
            >
              {alternative.text}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
