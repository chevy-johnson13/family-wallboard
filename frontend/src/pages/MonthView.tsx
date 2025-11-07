import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarAPI } from '../services/api';
import { cacheEvents, getCachedEvents } from '../services/db';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { CalendarEvent } from '../types';

export default function MonthView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<any>(null);

  const fetchEvents = async () => {
    try {
      const today = new Date();
      const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const end = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

      try {
        const fetchedEvents = await calendarAPI.getEvents(start, end);
        setEvents(fetchedEvents);
        await cacheEvents(fetchedEvents);
      } catch (error) {
        console.log('Using cached events');
        const cachedEvents = await getCachedEvents(start, end);
        setEvents(cachedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchEvents, 300000);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🗓️</div>
          <p className="text-xl text-gray-600">Loading month view...</p>
        </div>
      </div>
    );
  }

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: event.color,
    borderColor: event.color,
    extendedProps: {
      description: event.description,
      location: event.location,
      calendarName: event.calendarName,
    },
  }));

  return (
    <div className="h-full overflow-hidden bg-white p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        events={calendarEvents}
        height="100%"
        eventClick={(info) => {
          const event = info.event;
          const details = `
${event.title}
${event.extendedProps.description || ''}
${event.extendedProps.location ? '📍 ' + event.extendedProps.location : ''}
Calendar: ${event.extendedProps.calendarName}
          `.trim();
          alert(details);
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week'
        }}
      />
    </div>
  );
}

