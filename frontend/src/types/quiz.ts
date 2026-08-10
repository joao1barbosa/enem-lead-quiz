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

export type QuizStage = 'intro' | 'quiz' | 'form' | 'result';

export interface LeadData {
  name: string;
  email: string;
  phone: string;
}

export interface LeadResult {
  score: number;
  diagnosticSlug: string;
  diagnosticTitle: string;
  diagnosticMessage: string;
  answersSummary: Array<{
    questionText: string;
    selectedOptionText: string;
  }>;
}

export interface QuizState {
  quiz: Quiz | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>; // questionId -> alternativeId
  stage: QuizStage;
  leadData: LeadData | null;
  result: LeadResult | null;
}

export interface QuizActions {
  setQuiz: (quiz: Quiz) => void;
  selectAnswer: (questionId: string, alternativeId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setStage: (stage: QuizStage) => void;
  setLeadData: (data: LeadData) => void;
  setResult: (result: LeadResult) => void;
  reset: () => void;
  /** Limpa o estado de uma tentativa anterior e inicia o quiz da primeira pergunta. */
  startQuiz: () => void;
}

export type QuizStore = QuizState & QuizActions;
