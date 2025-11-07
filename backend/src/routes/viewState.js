import express from 'express';

const router = express.Router();

// In-memory store for current view state
// In production, you might want to use Redis or a database
let currentViewState = {
  path: '/today',
  timestamp: new Date().toISOString()
};

// Get current view state
router.get('/', (req, res) => {
  console.log('📥 GET /api/view-state - Current state:', currentViewState.path);
  res.json(currentViewState);
});

// Update view state
router.post('/', (req, res) => {
  const { path } = req.body;
  
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }

  // Validate path is one of our routes
  const validPaths = ['/today', '/week', '/month', '/tasks', '/meals'];
  if (!validPaths.includes(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  currentViewState = {
    path,
    timestamp: new Date().toISOString()
  };

  console.log('📤 POST /api/view-state - Updated to:', path);
  res.json({ success: true, viewState: currentViewState });
});

export default router;

