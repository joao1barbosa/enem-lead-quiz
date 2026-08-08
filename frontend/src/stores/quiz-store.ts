import { create } from 'zustand';
import type { QuizState, QuizStore } from '../types/quiz';

const initialQuizState: QuizState = {
  quiz: null,
  currentQuestionIndex: 0,
  selectedAnswers: {},
  stage: 'quiz',
};

export const useQuizStore = create<QuizStore>((set) => ({
  ...initialQuizState,

  setQuiz: (quiz) => set({ quiz }),

  selectAnswer: (questionId, alternativeId) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: alternativeId,
      },
    })),

  nextQuestion: () =>
    set((state) => {
      if (!state.quiz) return state;
      const maxIndex = state.quiz.questions.length - 1;
      return {
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, maxIndex),
      };
    }),

  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

  setStage: (stage) => set({ stage }),

  reset: () => set({ ...initialQuizState }),
}));
