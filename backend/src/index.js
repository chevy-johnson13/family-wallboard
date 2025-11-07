import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import calendarRoutes from './routes/calendar.js';
import tasksRoutes from './routes/tasks.js';
import mealsRoutes from './routes/meals.js';
import overlayRoutes from './routes/overlay.js';
import viewStateRoutes from './routes/viewState.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/calendar', calendarRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/overlay', overlayRoutes);
app.use('/api/view-state', viewStateRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler (only for API routes in production, frontend handles others)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Family Wallboard Backend running on port ${PORT}`);
  console.log(`📅 Calendar API: http://localhost:${PORT}/api/calendar`);
  console.log(`✅ Tasks API: http://localhost:${PORT}/api/tasks`);
  console.log(`🍽️  Meals API: http://localhost:${PORT}/api/meals`);
  console.log(`🔔 Overlay API: http://localhost:${PORT}/api/overlay`);
  console.log(`🔄 View State API: http://localhost:${PORT}/api/view-state`);
  console.log(`🌐 Accessible on your network at: http://<your-ip>:${PORT}`);
});

