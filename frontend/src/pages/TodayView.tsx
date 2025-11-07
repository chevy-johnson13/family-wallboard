import { useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { calendarAPI, mealsAPI } from '../services/api';
import { getCachedEvents } from '../services/db';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { CalendarEvent, Meal } from '../types';

export default function TodayView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todaysMeal, setTodaysMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);

      // Try fetching from API
      try {
        const [fetchedEvents, meal] = await Promise.all([
          calendarAPI.getEvents(start, end),
          mealsAPI.getTodaysMeal()
        ]);
        setEvents(fetchedEvents);
        setTodaysMeal(meal);
      } catch (error) {
        // Fallback to cached data if offline
        console.log('Using cached data');
        const cachedEvents = await getCachedEvents(start, end);
        setEvents(cachedEvents);
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchData, 300000); // Refresh every 5 minutes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-xl text-gray-600">Loading today's schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Today's Schedule</h1>
          <p className="text-xl text-gray-600">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>

        {/* Today's Meal Highlight */}
        {todaysMeal && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <span className="text-5xl">🍽️</span>
              <div>
                <h2 className="text-2xl font-bold mb-1">Dinner Tonight</h2>
                <p className="text-xl opacity-90">{todaysMeal.meal}</p>
                {todaysMeal.notes && (
                  <p className="text-sm opacity-80 mt-1">{todaysMeal.notes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow text-center">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-2xl text-gray-600">No events scheduled for today!</p>
              <p className="text-lg text-gray-500 mt-2">Enjoy your free day</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
                style={{ borderLeft: `6px solid ${event.color}` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-lg">
                          {event.allDay
                            ? 'All Day'
                            : `${format(new Date(event.start), 'h:mm a')} - ${format(new Date(event.end), 'h:mm a')}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-lg">{event.calendarName}</span>
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-2 mt-2 text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-lg">{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="mt-2 text-gray-600 text-base">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

