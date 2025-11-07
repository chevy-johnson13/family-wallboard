import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEALS_FILE = path.join(__dirname, '../../data/meals.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, '../../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize meals file with sample data if it doesn't exist
async function initializeMealsFile() {
  try {
    await fs.access(MEALS_FILE);
  } catch {
    const sampleMeals = [
      { day: 'Monday', meal: 'Spaghetti Bolognese', notes: '' },
      { day: 'Tuesday', meal: 'Chicken Tacos', notes: 'Use leftover chicken' },
      { day: 'Wednesday', meal: 'Salmon with Veggies', notes: '' },
      { day: 'Thursday', meal: 'Homemade Pizza', notes: 'Kids love this!' },
      { day: 'Friday', meal: 'Takeout Night', notes: 'Thai or Chinese' },
      { day: 'Saturday', meal: 'BBQ Burgers', notes: '' },
      { day: 'Sunday', meal: 'Roast Chicken Dinner', notes: 'Prep for week ahead' }
    ];
    
    await ensureDataDir();
    await fs.writeFile(MEALS_FILE, JSON.stringify(sampleMeals, null, 2));
    console.log('🍽️  Initialized meals.json with sample data');
  }
}

// Get all meals
export async function getMeals() {
  await initializeMealsFile();
  
  try {
    const data = await fs.readFile(MEALS_FILE, 'utf-8');
    const meals = JSON.parse(data);
    return meals;
  } catch (error) {
    console.error('Error reading meals:', error);
    throw error;
  }
}

// Get today's meal
export async function getTodaysMeal() {
  const meals = await getMeals();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  
  const todaysMeal = meals.find(m => m.day === today);
  return todaysMeal || { day: today, meal: 'Not planned yet', notes: '' };
}

// Update meals
export async function updateMeals(meals) {
  await ensureDataDir();
  
  try {
    await fs.writeFile(MEALS_FILE, JSON.stringify(meals, null, 2));
    console.log('🍽️  Updated meals');
    return meals;
  } catch (error) {
    console.error('Error updating meals:', error);
    throw error;
  }
}

