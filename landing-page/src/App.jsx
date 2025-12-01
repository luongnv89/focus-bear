import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy load Privacy page for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Privacy = lazy(() => import('./pages/Privacy'));

// Loading fallback component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="animate-pulse text-accent text-lg">Loading...</div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-bg text-white flex flex-col">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
