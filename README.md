# Weekly Calendar App

A clean, minimal weekly calendar app with task scheduling, event tracking, and reflection tracking (inspired by Linear Pulse).

## Features

- 📅 **Weekly Calendar View** - 7-day view with 30-minute time slots
- ✅ **Task Scheduling** - Add and manage recurring tasks
- 🎯 **Events & Deadlines** - Track meetings, deadlines, and one-time events
- 💭 **Reflections** - Rate your productivity, energy, focus, and satisfaction (1-7 scale)
- 📋 **Templates** - Create weekly templates and apply them to new weeks
- 🎨 **Custom Colors** - Color-code your tasks and events
- 💾 **Local Storage** - Everything stored locally in SQLite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

**Option 1: Run both servers separately (recommended for development)**
```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend dev server
npm run dev
```

**Option 2: Run both at once**
```bash
npm run dev:all
```

Then open your browser to: **http://localhost:5173**

## How to Use

### 1. Create Your Weekly Schedule

- Click on any time slot to add a task
- Fill in the task details (title, description, time, color)
- Tasks appear on your calendar

### 2. Add Deadlines & Events

- Click "Add Event" in the top bar
- Choose type: Deadline, Meeting, or Event
- Events appear at the top of each day

### 3. Add Reflections

- Click on any task to add a reflection
- Rate how it went (1-7 scale)
- Add notes about your experience

### 4. Use Templates for Recurring Weeks

- Click "Templates" in the top bar
- Create a new template
- Add tasks for your typical week
- Every Sunday, apply the template to populate the new week

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript
- **Database**: SQLite (better-sqlite3)
- **Font**: Cormorant Garamond (for titles)

## Database

The SQLite database (`calendar.db`) is stored in the project root. All your data is stored locally on your computer.

## Building for Production

```bash
npm run build
```

The frontend will be built to the `dist` directory.

For the backend in production, you can use:
```bash
tsx server/index.ts
```

Or compile TypeScript and run with Node.

## Deployment (Optional)

If you want to host this online:

1. Deploy backend to Railway, Fly.io, or similar
2. Update `API_BASE` in `src/lib/api.ts` to your backend URL
3. Deploy frontend to Vercel, Netlify, or similar

## License

MIT
