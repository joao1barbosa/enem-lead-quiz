import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryProvider } from './providers/query-provider';
import { QuizFlow } from './components/quiz/quiz-flow';

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QuizFlow />} />
          <Route path="*" element={<QuizFlow />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
