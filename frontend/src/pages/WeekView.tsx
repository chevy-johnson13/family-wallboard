import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarAPI } from '../services/api';
import { cacheEvents, getCachedEvents } from '../services/db';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { CalendarEvent } from '../types';

export default function WeekView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<any>(null);

  const fetchEvents = async () => {
    try {
      const today = new Date();
      const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const end = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

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
          <div className="text-4xl mb-4">📆</div>
          <p className="text-xl text-gray-600">Loading week view...</p>
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
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        height="100%"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={true}
        nowIndicator={true}
        eventClick={(info) => {
          const event = info.event;
          alert(`${event.title}\n${event.extendedProps.description || ''}`);
        }}
        buttonText={{
          today: 'Today',
          week: 'Week',
          day: 'Day'
        }}
      />
    </div>
  );
}

