import { motion } from 'framer-motion';
import type { Question } from '../../types/quiz';
import { fadeVariants } from './animation-variants';
import { Button } from '@/components/ui/button';

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
            <motion.div
              key={alternative.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                data-testid={`alternative-${index}`}
                onClick={() => onSelectAnswer(question.id, alternative.id)}
                variant={isSelected ? 'default' : 'outline'}
                className={`w-full justify-start text-base ${
                  isSelected ? 'bg-primary' : ''
                }`}
              >
                {alternative.text}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
