import { useState } from 'react';
import { mealsAPI } from '../services/api';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { Meal } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealsView() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedMeals, setEditedMeals] = useState<Meal[]>([]);

  const fetchMeals = async () => {
    try {
      const fetchedMeals = await mealsAPI.getMeals();
      setMeals(fetchedMeals);
      setEditedMeals(fetchedMeals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchMeals, 300000);

  const handleSave = async () => {
    try {
      await mealsAPI.updateMeals(editedMeals);
      setMeals(editedMeals);
      setEditing(false);
    } catch (error) {
      console.error('Error updating meals:', error);
      alert('Failed to update meals. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedMeals(meals);
    setEditing(false);
  };

  const updateMeal = (day: string, field: 'meal' | 'notes', value: string) => {
    setEditedMeals(editedMeals.map(m =>
      m.day === day ? { ...m, [field]: value } : m
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-xl text-gray-600">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Weekly Meal Plan</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg font-medium shadow-lg transition-colors flex items-center space-x-2"
            >
              <span>✏️</span>
              <span>Edit Plan</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-medium shadow-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl text-lg font-medium shadow-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Meals Grid */}
        <div className="grid gap-4">
          {(editing ? editedMeals : meals).map((meal) => {
            const isToday = meal.day === today;
            return (
              <div
                key={meal.day}
                className={`rounded-2xl p-6 shadow-lg transition-all ${
                  isToday
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`text-4xl mb-2`}>
                      {isToday ? '⭐' : '🍽️'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold mb-3 ${isToday ? 'text-white' : 'text-gray-800'}`}>
                      {meal.day}
                      {isToday && <span className="ml-3 text-lg font-normal">(Today)</span>}
                    </h2>
                    {editing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={meal.meal}
                          onChange={(e) => updateMeal(meal.day, 'meal', e.target.value)}
                          placeholder="Meal name"
                          className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                        <input
                          type="text"
                          value={meal.notes}
                          onChange={(e) => updateMeal(meal.day, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className={`text-xl font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>
                          {meal.meal}
                        </p>
                        {meal.notes && (
                          <p className={`mt-2 ${isToday ? 'text-white opacity-90' : 'text-gray-600'}`}>
                            {meal.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

