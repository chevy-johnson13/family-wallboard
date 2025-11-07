import express from 'express';
import { fetchCalendarEvents, getCalendarConfigs } from '../services/calendarService.js';

const router = express.Router();

// Get all calendar events from all configured calendars
router.get('/events', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    
    // Default to 30 days before and after today if not specified
    const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const allEvents = await fetchCalendarEvents(startDate, endDate);
    
    // Filter events to only those within the requested date range
    // This ensures we return the correct events even if using cached data
    const filteredEvents = allEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Include event if it overlaps with the requested range
      return eventStart < endDate && eventEnd > startDate;
    });
    
    res.json({
      events: filteredEvents,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      count: filteredEvents.length
    });
  } catch (error) {
    next(error);
  }
});

// Get calendar configurations (without ICS URLs for security)
router.get('/config', (req, res) => {
  const configs = getCalendarConfigs();
  res.json({ calendars: configs });
});

export default router;

