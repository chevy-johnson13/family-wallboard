import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import TodayView from './pages/TodayView';
import WeekView from './pages/WeekView';
import MonthView from './pages/MonthView';
import TasksView from './pages/TasksView';
import MealsView from './pages/MealsView';
import { initDB } from './services/db';
import { useNightMode } from './hooks/useNightMode';
import RingOverlay from './components/RingOverlay';
import ViewStateSync from './components/ViewStateSync';

function App() {
  const [initialized, setInitialized] = useState(false);
  const isNightMode = useNightMode();

  useEffect(() => {
    // Initialize IndexedDB for offline caching
    initDB().then(() => {
      setInitialized(true);
      console.log('✅ App initialized');
    });

    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service worker registration failed:', error);
      });
    }
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <div className="text-xl">Loading Family Wallboard...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ViewStateSync />
      <div className={isNightMode ? 'night-mode' : ''}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<TodayView />} />
            <Route path="/week" element={<WeekView />} />
            <Route path="/month" element={<MonthView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/meals" element={<MealsView />} />
          </Routes>
        </Layout>
        <RingOverlay />
      </div>
    </Router>
  );
}

export default App;

