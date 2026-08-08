export interface Alternative {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  order: number;
  text: string;
  alternatives: Alternative[];
}

export interface Quiz {
  id: string;
  questions: Question[];
}

export type QuizStage = 'quiz' | 'form' | 'result';

export interface QuizState {
  quiz: Quiz | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>; // questionId -> alternativeId
  stage: QuizStage;
}

export interface QuizActions {
  setQuiz: (quiz: Quiz) => void;
  selectAnswer: (questionId: string, alternativeId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setStage: (stage: QuizStage) => void;
  reset: () => void;
}

export type QuizStore = QuizState & QuizActions;
