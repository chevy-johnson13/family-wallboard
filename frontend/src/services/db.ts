import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { CalendarEvent, Task } from '../types';

interface WallboardDB extends DBSchema {
  events: {
    key: string;
    value: CalendarEvent;
    indexes: { 'by-date': string };
  };
  tasks: {
    key: string;
    value: Task;
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<WallboardDB>;

export async function initDB() {
  db = await openDB<WallboardDB>('family-wallboard', 1, {
    upgrade(db) {
      // Events store
      const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
      eventsStore.createIndex('by-date', 'start');
      
      // Tasks store
      db.createObjectStore('tasks', { keyPath: 'id' });
      
      // Metadata store for sync timestamps
      db.createObjectStore('metadata', { keyPath: 'key' });
    },
  });
  
  return db;
}

// Cache events
export async function cacheEvents(events: CalendarEvent[]) {
  const tx = db.transaction('events', 'readwrite');
  await Promise.all([
    ...events.map(event => tx.store.put(event)),
    tx.done,
  ]);
  
  // Update last sync timestamp
  await db.put('metadata', {
    key: 'events-last-sync',
    value: Date.now(),
    timestamp: Date.now(),
  });
}

// Get cached events
export async function getCachedEvents(startDate?: Date, endDate?: Date) {
  const allEvents = await db.getAll('events');
  
  if (!startDate && !endDate) {
    return allEvents;
  }
  
  return allEvents.filter(event => {
    const eventStart = new Date(event.start);
    if (startDate && eventStart < startDate) return false;
    if (endDate && eventStart > endDate) return false;
    return true;
  });
}

// Cache tasks
export async function cacheTasks(tasks: Task[]) {
  const tx = db.transaction('tasks', 'readwrite');
  await Promise.all([
    ...tasks.map(task => tx.store.put(task)),
    tx.done,
  ]);
  
  await db.put('metadata', {
    key: 'tasks-last-sync',
    value: Date.now(),
    timestamp: Date.now(),
  });
}

// Get cached tasks
export async function getCachedTasks() {
  return await db.getAll('tasks');
}

// Get last sync time
export async function getLastSync(key: string) {
  const metadata = await db.get('metadata', key);
  return metadata?.value || null;
}

// Clear old cache (older than 30 days)
export async function clearOldCache() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const events = await db.getAll('events');
  const oldEvents = events.filter(e => new Date(e.start).getTime() < thirtyDaysAgo);
  
  const tx = db.transaction('events', 'readwrite');
  await Promise.all([
    ...oldEvents.map(e => tx.store.delete(e.id)),
    tx.done,
  ]);
}

