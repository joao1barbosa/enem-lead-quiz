import { create } from 'zustand';
import type { QuizStore } from '../types/quiz';

export const useQuizStore = create<QuizStore>((set, get) => ({
  // State
  quiz: null,
  currentQuestionIndex: 0,
  selectedAnswers: {},
  stage: 'quiz',

  // Actions
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
      const nextIndex = Math.min(state.currentQuestionIndex + 1, maxIndex);
      return { currentQuestionIndex: nextIndex };
    }),

  previousQuestion: () =>
    set((state) => {
      const prevIndex = Math.max(state.currentQuestionIndex - 1, 0);
      return { currentQuestionIndex: prevIndex };
    }),

  setStage: (stage) => set({ stage }),

  reset: () =>
    set({
      quiz: null,
      currentQuestionIndex: 0,
      selectedAnswers: {},
      stage: 'quiz',
    }),
}));
