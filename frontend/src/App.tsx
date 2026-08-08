import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QuizFlow } from './components/quiz/quiz-flow';
import { useQuizStore } from './stores/quiz-store';
import type { Quiz } from './types/quiz';

const mockQuiz: Quiz = {
  id: 'active-quiz',
  questions: [
    {
      id: 'q1',
      order: 1,
      text: 'Qual é a capital do Brasil?',
      alternatives: [
        { id: 'q1a1', text: 'São Paulo' },
        { id: 'q1a2', text: 'Rio de Janeiro' },
        { id: 'q1a3', text: 'Brasília' },
        { id: 'q1a4', text: 'Salvador' },
      ],
    },
    {
      id: 'q2',
      order: 2,
      text: 'Quanto é 2 + 2?',
      alternatives: [
        { id: 'q2a1', text: '3' },
        { id: 'q2a2', text: '4' },
        { id: 'q2a3', text: '5' },
        { id: 'q2a4', text: '6' },
      ],
    },
    {
      id: 'q3',
      order: 3,
      text: 'Qual bioma brasileiro é conhecido como a maior floresta tropical do mundo?',
      alternatives: [
        { id: 'q3a1', text: 'Amazônia' },
        { id: 'q3a2', text: 'Cerrado' },
        { id: 'q3a3', text: 'Caatinga' },
        { id: 'q3a4', text: 'Pampa' },
      ],
    },
    {
      id: 'q4',
      order: 4,
      text: 'Quem escreveu o romance "Dom Casmurro"?',
      alternatives: [
        { id: 'q4a1', text: 'Machado de Assis' },
        { id: 'q4a2', text: 'José de Alencar' },
        { id: 'q4a3', text: 'Clarice Lispector' },
        { id: 'q4a4', text: 'Jorge Amado' },
      ],
    },
    {
      id: 'q5',
      order: 5,
      text: 'A fotossíntese ocorre principalmente em qual organela celular?',
      alternatives: [
        { id: 'q5a1', text: 'Cloroplasto' },
        { id: 'q5a2', text: 'Mitocôndria' },
        { id: 'q5a3', text: 'Núcleo' },
        { id: 'q5a4', text: 'Ribossomo' },
      ],
    },
    {
      id: 'q6',
      order: 6,
      text: 'Qual é o símbolo químico do oxigênio?',
      alternatives: [
        { id: 'q6a1', text: 'O' },
        { id: 'q6a2', text: 'Ox' },
        { id: 'q6a3', text: 'O₂' },
        { id: 'q6a4', text: 'Og' },
      ],
    },
    {
      id: 'q7',
      order: 7,
      text: 'Em que ano os portugueses chegaram ao território que hoje é o Brasil?',
      alternatives: [
        { id: 'q7a1', text: '1500' },
        { id: 'q7a2', text: '1492' },
        { id: 'q7a3', text: '1822' },
        { id: 'q7a4', text: '1889' },
      ],
    },
    {
      id: 'q8',
      order: 8,
      text: 'Qual é a unidade de medida de força no Sistema Internacional?',
      alternatives: [
        { id: 'q8a1', text: 'Newton' },
        { id: 'q8a2', text: 'Joule' },
        { id: 'q8a3', text: 'Pascal' },
        { id: 'q8a4', text: 'Watt' },
      ],
    },
    {
      id: 'q9',
      order: 9,
      text: 'Qual movimento literário é marcado pela publicação de "O Cortiço" e "Memórias Póstumas de Brás Cubas"?',
      alternatives: [
        { id: 'q9a1', text: 'Realismo' },
        { id: 'q9a2', text: 'Romantismo' },
        { id: 'q9a3', text: 'Modernismo' },
        { id: 'q9a4', text: 'Barroco' },
      ],
    },
    {
      id: 'q10',
      order: 10,
      text: 'Qual é o maior país da América do Sul em extensão territorial?',
      alternatives: [
        { id: 'q10a1', text: 'Brasil' },
        { id: 'q10a2', text: 'Argentina' },
        { id: 'q10a3', text: 'Peru' },
        { id: 'q10a4', text: 'Colômbia' },
      ],
    },
  ],
};

function QuizPage() {
  const setQuiz = useQuizStore((state) => state.setQuiz);

  useEffect(() => {
    setQuiz(mockQuiz);
  }, [setQuiz]);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">ENEM Lead Quiz</h1>
      </header>
      <QuizFlow />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizPage />} />
        <Route path="*" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
