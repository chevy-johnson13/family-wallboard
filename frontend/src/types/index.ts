// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  calendar: string;
  calendarName: string;
  color: string;
}

export interface CalendarConfig {
  id: string;
  name: string;
  color: string;
}

// Task types
export interface Task {
  id: string;
  content: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  priority: number;
  labels: string[];
  projectId: string;
  createdAt: string;
}

// Meal types
export interface Meal {
  day: string;
  meal: string;
  notes: string;
}

// Overlay types
export interface OverlayStatus {
  active: boolean;
  cameraEntityId?: string;
  entityId?: string;
  streamUrl?: string;
  snapshotUrl?: string;
  haUrl?: string;
  token?: string;
  triggeredAt?: string;
  duration?: number;
  expiresAt?: string;
}

