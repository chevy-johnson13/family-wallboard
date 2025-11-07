import express from 'express';
import { getMeals, updateMeals, getTodaysMeal } from '../services/mealsService.js';

const router = express.Router();

// Get all meals for the week
router.get('/', async (req, res, next) => {
  try {
    const meals = await getMeals();
    res.json({ meals });
  } catch (error) {
    next(error);
  }
});

// Get today's meal
router.get('/today', async (req, res, next) => {
  try {
    const meal = await getTodaysMeal();
    res.json({ meal });
  } catch (error) {
    next(error);
  }
});

// Update meals
router.put('/', async (req, res, next) => {
  try {
    const { meals } = req.body;
    
    if (!meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: 'Meals array is required' });
    }
    
    await updateMeals(meals);
    res.json({ success: true, message: 'Meals updated' });
  } catch (error) {
    next(error);
  }
});

export default router;

