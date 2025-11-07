import ICAL from 'ical.js';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: parseInt(process.env.CALENDAR_CACHE_TTL) || 300 });

// Parse calendar configs from environment
export function getCalendarConfigs() {
  const configs = [];
  
  // Person 1's work calendar
  if (process.env.CALENDAR_PERSON1_ICS_URL) {
    configs.push({
      id: 'person1',
      name: process.env.CALENDAR_PERSON1_NAME || 'Person 1',
      color: process.env.CALENDAR_PERSON1_COLOR || '#3B82F6',
      url: process.env.CALENDAR_PERSON1_ICS_URL
    });
  }
  
  // Person 1's personal calendar
  if (process.env.CALENDAR_PERSON1_PERSONAL_ICS_URL) {
    configs.push({
      id: 'person1-personal',
      name: process.env.CALENDAR_PERSON1_PERSONAL_NAME || 'Person 1 (Personal)',
      color: process.env.CALENDAR_PERSON1_PERSONAL_COLOR || '#60A5FA',
      url: process.env.CALENDAR_PERSON1_PERSONAL_ICS_URL
    });
  }
  
  // Person 2's work calendar
  if (process.env.CALENDAR_PERSON2_ICS_URL) {
    configs.push({
      id: 'person2',
      name: process.env.CALENDAR_PERSON2_NAME || 'Person 2',
      color: process.env.CALENDAR_PERSON2_COLOR || '#EC4899',
      url: process.env.CALENDAR_PERSON2_ICS_URL
    });
  }
  
  // Person 2's personal calendar
  if (process.env.CALENDAR_PERSON2_PERSONAL_ICS_URL) {
    configs.push({
      id: 'person2-personal',
      name: process.env.CALENDAR_PERSON2_PERSONAL_NAME || 'Person 2 (Personal)',
      color: process.env.CALENDAR_PERSON2_PERSONAL_COLOR || '#F472B6',
      url: process.env.CALENDAR_PERSON2_PERSONAL_ICS_URL
    });
  }
  
  // Child's calendar
  if (process.env.CALENDAR_CHILD_ICS_URL) {
    configs.push({
      id: 'child',
      name: process.env.CALENDAR_CHILD_NAME || 'Child',
      color: process.env.CALENDAR_CHILD_COLOR || '#10B981',
      url: process.env.CALENDAR_CHILD_ICS_URL
    });
  }
  
  return configs.map(({ url, ...config }) => config); // Don't expose URLs
}

// Fetch and parse ICS feed
async function fetchICSFeed(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Family-Wallboard/1.0'
      }
    });
    
    if (!response.ok) {
      // Handle rate limiting and service errors gracefully
      if (response.status === 429) {
        console.warn(`⚠️  Rate limited for calendar. Will retry on next refresh.`);
        throw new Error(`Rate limited - too many requests`);
      }
      if (response.status >= 500) {
        console.warn(`⚠️  Calendar service unavailable. Will retry on next refresh.`);
        throw new Error(`Service unavailable`);
      }
      throw new Error(`Failed to fetch calendar: ${response.statusText}`);
    }
    
    const icsData = await response.text();
    return icsData;
  } catch (error) {
    // Re-throw with more context
    if (error.message.includes('Rate limited') || error.message.includes('Service unavailable')) {
      throw error;
    }
    throw new Error(`Failed to fetch calendar: ${error.message}`);
  }
}

// Parse ICS data into events
function parseICSData(icsData, calendar, startDate, endDate) {
  try {
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    const events = [];
    
    vevents.forEach(vevent => {
      const event = new ICAL.Event(vevent);
      
      // Check if this is a recurring event
      if (event.isRecurring()) {
        // Expand recurring events within the date range
        const expand = event.iterator();
        let next;
        
        // Limit to 500 occurrences to prevent infinite loops
        let count = 0;
        while ((next = expand.next()) && count < 500) {
          const occurrence = next.toJSDate();
          
          // Only include occurrences within our date range
          if (occurrence >= startDate && occurrence <= endDate) {
            events.push({
              id: `${event.uid}_${occurrence.getTime()}`,
              title: event.summary,
              description: event.description || '',
              start: occurrence.toISOString(),
              end: new Date(occurrence.getTime() + (event.duration.toSeconds() * 1000)).toISOString(),
              allDay: event.startDate.isDate,
              location: event.location || '',
              calendar: calendar.id,
              calendarName: calendar.name,
              color: calendar.color
            });
          }
          
          // Stop if we're past the end date
          if (occurrence > endDate) {
            break;
          }
          
          count++;
        }
      } else {
        // Single event (non-recurring)
        events.push({
          id: event.uid,
          title: event.summary,
          description: event.description || '',
          start: event.startDate.toJSDate().toISOString(),
          end: event.endDate.toJSDate().toISOString(),
          allDay: event.startDate.isDate,
          location: event.location || '',
          calendar: calendar.id,
          calendarName: calendar.name,
          color: calendar.color
        });
      }
    });
    
    return events;
  } catch (error) {
    console.error(`Error parsing ICS data for ${calendar.name}:`, error);
    return [];
  }
}

// Fetch all calendar events
export async function fetchCalendarEvents(startDate, endDate) {
  const cacheKey = `events_${startDate.getTime()}_${endDate.getTime()}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('📅 Returning cached calendar events');
    return cached;
  }
  
  const configs = getCalendarConfigs();
  const calendarsWithUrls = [];
  
  // Rebuild with URLs for fetching (only include calendars with valid URLs)
  if (process.env.CALENDAR_PERSON1_ICS_URL && process.env.CALENDAR_PERSON1_ICS_URL.trim()) {
    calendarsWithUrls.push({
      id: 'person1',
      name: process.env.CALENDAR_PERSON1_NAME || 'Person 1',
      color: process.env.CALENDAR_PERSON1_COLOR || '#3B82F6',
      url: process.env.CALENDAR_PERSON1_ICS_URL
    });
  }
  
  if (process.env.CALENDAR_PERSON1_PERSONAL_ICS_URL && process.env.CALENDAR_PERSON1_PERSONAL_ICS_URL.trim()) {
    calendarsWithUrls.push({
      id: 'person1-personal',
      name: process.env.CALENDAR_PERSON1_PERSONAL_NAME || 'Person 1 (Personal)',
      color: process.env.CALENDAR_PERSON1_PERSONAL_COLOR || '#60A5FA',
      url: process.env.CALENDAR_PERSON1_PERSONAL_ICS_URL
    });
  }
  
  if (process.env.CALENDAR_PERSON2_ICS_URL && process.env.CALENDAR_PERSON2_ICS_URL.trim()) {
    calendarsWithUrls.push({
      id: 'person2',
      name: process.env.CALENDAR_PERSON2_NAME || 'Person 2',
      color: process.env.CALENDAR_PERSON2_COLOR || '#EC4899',
      url: process.env.CALENDAR_PERSON2_ICS_URL
    });
  }
  
  if (process.env.CALENDAR_PERSON2_PERSONAL_ICS_URL && process.env.CALENDAR_PERSON2_PERSONAL_ICS_URL.trim()) {
    calendarsWithUrls.push({
      id: 'person2-personal',
      name: process.env.CALENDAR_PERSON2_PERSONAL_NAME || 'Person 2 (Personal)',
      color: process.env.CALENDAR_PERSON2_PERSONAL_COLOR || '#F472B6',
      url: process.env.CALENDAR_PERSON2_PERSONAL_ICS_URL
    });
  }
  
  if (process.env.CALENDAR_CHILD_ICS_URL && process.env.CALENDAR_CHILD_ICS_URL.trim()) {
    calendarsWithUrls.push({
      id: 'child',
      name: process.env.CALENDAR_CHILD_NAME || 'Child',
      color: process.env.CALENDAR_CHILD_COLOR || '#10B981',
      url: process.env.CALENDAR_CHILD_ICS_URL
    });
  }
  
  console.log(`📅 Fetching events from ${calendarsWithUrls.length} calendars`);
  
  // Fetch all calendars in parallel
  const eventPromises = calendarsWithUrls.map(async (calendar) => {
    try {
      const icsData = await fetchICSFeed(calendar.url);
      const events = parseICSData(icsData, calendar, startDate, endDate);
      
      // Events are already filtered by date range in parseICSData
      return events;
    } catch (error) {
      console.error(`Error fetching calendar ${calendar.name}:`, error);
      return [];
    }
  });
  
  const eventsArrays = await Promise.all(eventPromises);
  const allEvents = eventsArrays.flat();
  
  // Sort by start date
  allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
  
  // Cache the results
  cache.set(cacheKey, allEvents);
  
  console.log(`📅 Fetched ${allEvents.length} total events`);
  return allEvents;
}

