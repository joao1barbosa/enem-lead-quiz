import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Quiz } from '../types/quiz';

interface QuizResponse {
  quiz: Quiz;
}

/**
 * Busca o quiz ativo no backend (GET /api/quizzes/active) e expõe
 * apenas o objeto `quiz` (RF-01).
 */
export function useQuiz() {
  const query = useQuery<QuizResponse>({
    queryKey: ['quiz', 'active'],
    queryFn: async () => {
      const { data } = await api.get<QuizResponse>('/api/quizzes/active');
      return data;
    },
  });

  return {
    ...query,
    data: query.data?.quiz,
  };
}
