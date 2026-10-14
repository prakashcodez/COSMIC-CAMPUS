# Cosmic Campus

A gamified student productivity and campus lifestyle application that helps students organize their academic life, build routines, and earn XP as they make progress.

## Features

### 1. Task and Quest Hub
**Screen:** `TasksScreen`

- Manage assignments, study tasks, and daily to-dos.
- Set priorities and deadlines.
- Earn XP for completing tasks.
- Maintain daily completion streaks.
- Unlock cosmic ranks and titles.
- Celebrate level-ups with animations.

### 2. Timetable and Daily Routines
**Screen:** `TimetableScreen`

- View an interactive weekly class schedule.
- Track class times, room locations, and professors.
- Organize morning habits, meal reminders, and sleep schedules.
- Track campus events with countdowns.

### 3. Exam Planner and Subject Management

- Group exams by semester or term.
- Track exam dates for individual subjects.
- Create preparation checklists.
- Monitor revision progress and upcoming deadlines.

### 4. Focus Mode
**Component:** `FocusModal`

- Use a built-in Pomodoro-style study timer.
- Customize focus and break durations.
- Play audio cues for session transitions.

### 5. Progress and Academic Analytics
**Screen:** `ProgressScreen`

- View weekly productivity charts.
- Track XP earned and its breakdown.
- Monitor streaks, milestones, and achievements.
- Visualize progress over time.

### 6. Campus Utilities and Budgeting

- Track allowances and expenses.
- Monitor spending and available budget.
- Bookmark syllabus documents and campus portal links.
- Quickly access frequently used academic resources.

## Data and Offline Support

Cosmic Campus uses `localStorage` for client-side persistence. Data can remain available between sessions in the same browser on the same device.

`localStorage` does not automatically provide cloud backups, cross-device synchronization, or shared accounts. These capabilities would require a backend or synchronization service.

## Mobile Support

The project is configured with Capacitor for an Android deployment path. Before release, test responsive layouts, touch interactions, audio behavior, and data persistence on Android devices.

## Getting Started

### Prerequisites

- Node.js
- npm or another supported package manager
- Git
- Android Studio and the Android SDK, if building for Android

### Installation

Replace `<repository-url>` with your Git repository URL.

```bash
git clone <repository-url>
cd cosmic-campus
npm install
npm run dev
```

### Common Scripts

The available scripts depend on the project's `package.json`. A typical Vite-based project may provide:

```bash
npm run dev       # Start the development server
npm run build     # Build for production
npm run preview   # Preview the production build
```

### Android Build

If Capacitor is configured and the Android platform has been added:

```bash
npm run build
npx cap sync android
npx cap open android
```


## License

No license has been specified. Add a `LICENSE` file and update this section before distributing the project.

---

*Cosmic Campus — Organize your semester. Make progress. Level up.*
