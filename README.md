# Family Wallboard

A Raspberry Pi-powered smart home dashboard displaying family calendars, tasks, meals, and Ring doorbell integration.

## Features

- 📅 **Unified Calendar View**: Display Google/Outlook/iCloud calendars with color-coding per family member
- ✅ **To-Do List**: Todoist integration for family tasks and chores
- 🍽️ **Meal Planner**: Weekly meal planning with "Dinner Tonight" highlights
- 🔔 **Ring Integration**: Live doorbell camera feed via Home Assistant
- 🌙 **Night Mode**: Auto-dim display 9 PM - 6 AM
- 📱 **Touch-Friendly**: Large buttons optimized for touchscreen
- 🔄 **Offline Ready**: Caches 30 days of events/tasks locally
- 🎙️ **Voice Control**: Alexa integration for hands-free task creation

## Tech Stack

**Frontend:**
- React + TypeScript (Vite)
- FullCalendar
- Tailwind CSS
- IndexedDB for offline storage

**Backend:**
- Node.js + Express
- ical.js for calendar parsing
- Todoist REST API
- Home Assistant webhook integration

**Hardware:**
- Raspberry Pi 4/5
- Touchscreen display (7" or 10" recommended)
- 16GB+ microSD card

## Project Structure

```
Family Wallboard/
├── frontend/           # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
├── backend/            # Node.js Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── pi-setup/           # Raspberry Pi deployment scripts
```

## Quick Start (Development)

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys and calendar URLs
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and backend on `http://localhost:3000`.

## Raspberry Pi Deployment

See [pi-setup/README.md](pi-setup/README.md) for detailed Raspberry Pi installation and kiosk mode configuration.

## Configuration

### Calendar Setup
1. Get your Google/Outlook/iCloud calendar's secret ICS URL
2. Add to backend `.env` file

### Todoist Setup
1. Get your Todoist API token from https://todoist.com/prefs/integrations
2. Add to backend `.env` file

### Ring/Home Assistant Setup

**See detailed guide:** [HOME_ASSISTANT_SETUP.md](HOME_ASSISTANT_SETUP.md)

Quick steps:
1. Install Ring integration in Home Assistant
2. Get your Home Assistant long-lived access token
3. Add to backend `.env`:
   ```
   HOME_ASSISTANT_URL=http://homeassistant.local:8123
   HOME_ASSISTANT_TOKEN=your_token_here
   RING_CAMERA_ENTITY_ID=camera.ring_front_door
   ```
4. Add REST command to Home Assistant (see `home-assistant-examples/`)
5. Create automation to trigger overlay on doorbell press
6. Test by ringing your doorbell!

**Copy-paste configurations available in:** `home-assistant-examples/`

## Development Roadmap

- [x] M1 - Core Calendar: ICS parsing + FullCalendar UI
- [x] M2 - To-Dos: Todoist integration + Alexa voice
- [x] M3 - Meals: Local meal planner
- [x] M4 - Overlay API endpoint
- [x] M5 - Ring Integration
- [x] M6 - Polish: Night mode + offline cache

## License

MIT - Feel free to use and modify for your family!

