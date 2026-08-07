import { BrowserRouter, Route, Routes } from 'react-router-dom';

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">ENEM Lead Quiz</h1>
      <p className="mt-4 max-w-xl text-center text-muted-foreground">
        Sistema de quiz para captura de leads com diagnóstico personalizado de preparo para o ENEM.
      </p>
      <span className="mt-8 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
        Infraestrutura pronta — módulos em construção
      </span>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
