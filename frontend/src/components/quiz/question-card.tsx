import { motion } from 'framer-motion';
import type { Question } from '../../types/quiz';
import { fadeVariants } from './animation-variants';

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
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeVariants}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold">{question.text}</h2>
      <div className="space-y-3">
        {question.alternatives.map((alternative, index) => {
          const isSelected = selectedAnswer === alternative.id;
          return (
            <motion.button
              key={alternative.id}
              onClick={() => onSelectAnswer(question.id, alternative.id)}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
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
    </motion.div>
  );
}
