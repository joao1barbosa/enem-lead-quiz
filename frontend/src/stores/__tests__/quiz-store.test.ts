import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '../quiz-store';

describe('QuizStore', () => {
  beforeEach(() => {
    useQuizStore.getState().reset();
  });

  describe('setQuiz', () => {
    it('should set quiz data', () => {
      const mockQuiz = {
        id: 'test-quiz',
        questions: [
          {
            id: 'q1',
            order: 1,
            text: 'Pergunta 1',
            alternatives: [{ id: 'a1', text: 'Alternativa 1' }],
          },
        ],
      };

      useQuizStore.getState().setQuiz(mockQuiz);

      expect(useQuizStore.getState().quiz).toEqual(mockQuiz);
    });
  });

  describe('selectAnswer', () => {
    it('should store selected answer for question', () => {
      useQuizStore.getState().selectAnswer('q1', 'a1');

      expect(useQuizStore.getState().selectedAnswers.q1).toBe('a1');
    });

    it('should update existing answer', () => {
      useQuizStore.getState().selectAnswer('q1', 'a1');
      useQuizStore.getState().selectAnswer('q1', 'a2');

      expect(useQuizStore.getState().selectedAnswers.q1).toBe('a2');
    });
  });

  describe('nextQuestion', () => {
    it('should increment currentQuestionIndex', () => {
      const mockQuiz = {
        id: 'test-quiz',
        questions: [
          { id: 'q1', order: 1, text: 'Q1', alternatives: [] },
          { id: 'q2', order: 2, text: 'Q2', alternatives: [] },
        ],
      };
      useQuizStore.getState().setQuiz(mockQuiz);

      useQuizStore.getState().nextQuestion();

      expect(useQuizStore.getState().currentQuestionIndex).toBe(1);
    });

    it('should not exceed questions length', () => {
      const mockQuiz = {
        id: 'test-quiz',
        questions: [{ id: 'q1', order: 1, text: 'Q1', alternatives: [] }],
      };
      useQuizStore.getState().setQuiz(mockQuiz);

      useQuizStore.getState().nextQuestion();
      useQuizStore.getState().nextQuestion();

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });
  });

  describe('previousQuestion', () => {
    it('should decrement currentQuestionIndex', () => {
      const mockQuiz = {
        id: 'test-quiz',
        questions: [
          { id: 'q1', order: 1, text: 'Q1', alternatives: [] },
          { id: 'q2', order: 2, text: 'Q2', alternatives: [] },
        ],
      };
      useQuizStore.getState().setQuiz(mockQuiz);
      useQuizStore.getState().nextQuestion();

      useQuizStore.getState().previousQuestion();

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });

    it('should not go below 0', () => {
      useQuizStore.getState().previousQuestion();

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });
  });

  describe('setStage', () => {
    it('should update stage', () => {
      useQuizStore.getState().setStage('form');

      expect(useQuizStore.getState().stage).toBe('form');
    });
  });

  describe('setLeadData', () => {
    it('should store lead data', () => {
      useQuizStore.getState().setLeadData({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
      });

      expect(useQuizStore.getState().leadData).toEqual({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
      });
    });
  });

  describe('setResult', () => {
    it('should store result data', () => {
      const mockResult = {
        score: 75,
        diagnosticSlug: 'ON_RIGHT_TRACK',
        diagnosticTitle: 'Na Trilha Certa',
        diagnosticMessage: 'Você está indo muito bem!',
        answersSummary: [
          { questionText: 'Pergunta 1', selectedOptionText: 'Alternativa 1' },
        ],
      };

      useQuizStore.getState().setResult(mockResult);

      expect(useQuizStore.getState().result).toEqual(mockResult);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useQuizStore.getState().setStage('form');
      useQuizStore.getState().selectAnswer('q1', 'a1');
      useQuizStore.getState().setLeadData({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
      });
      useQuizStore.getState().setResult({
        score: 75,
        diagnosticSlug: 'ON_RIGHT_TRACK',
        diagnosticTitle: 'Na Trilha Certa',
        diagnosticMessage: 'Você está indo muito bem!',
        answersSummary: [],
      });

      useQuizStore.getState().reset();

      expect(useQuizStore.getState().stage).toBe('quiz');
      expect(useQuizStore.getState().selectedAnswers).toEqual({});
      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
      expect(useQuizStore.getState().leadData).toBeNull();
      expect(useQuizStore.getState().result).toBeNull();
    });
  });
});
