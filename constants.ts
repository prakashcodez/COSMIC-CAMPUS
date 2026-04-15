
import { Task, Category, ClassSession, Milestone, ActivityPoint, UpcomingEvent } from './types';

export const INITIAL_TASKS: Task[] = [];

export const UPCOMING_EVENTS: UpcomingEvent[] = [];

// Default Profile Picture
export const PROFILE_IMG = "src/Picsart_25-12-24_21-06-04-303.png"; // Placeholder for the pizza slice image you uploaded. Please upload your image to the project files and update this URL.

export const INITIAL_CLASSES: ClassSession[] = [];

export const MILESTONES: Milestone[] = [
  { id: 'm1', name: 'Elite Achiever', requirement: '100 Tasks Done', icon: 'emoji_events', achieved: true, type: 'gold' },
  { id: 'm2', name: 'Dawn Patrol', requirement: '5 Tasks before 8 AM', icon: 'wb_sunny', achieved: true, type: 'silver' },
  { id: 'm3', name: 'Iron Will', requirement: '30 Day Streak', icon: 'rocket_launch', achieved: false, type: 'none' },
  { id: 'm4', name: 'Grand Architect', requirement: '7 Days Scheduled', icon: 'hotel_class', achieved: true, type: 'gold' },
];

export const WEEKLY_ACTIVITY: ActivityPoint[] = [
  { day: 'Mon', value: 60 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 45 },
  { day: 'Thu', value: 100, isToday: true },
  { day: 'Fri', value: 75 },
  { day: 'Sat', value: 20 },
  { day: 'Sun', value: 35 },
];

// 100 Unique Titles (0-99 mapping to phases)
export const LEVEL_TITLES = [
  // PHASE 1 — Student Awakening (0–19)
  "Fresh Arrival", "Orientation Survivor", "Schedule Starter", "Task Tracker", "Routine Builder",
  "Focus Seeker", "Habit Former", "Deadline Aware", "Early Initiator", "Consistency Cadet",
  "Study Starter", "Planner Apprentice", "Time Organizer", "Class Attendee", "Assignment Finisher",
  "Note Keeper", "Revision Runner", "Productivity Rookie", "Discipline Builder", "Academic Explorer",

  // PHASE 2 — Structured Scholar (20–39)
  "Time Strategist", "Focus Fighter", "Task Commander", "Routine Master", "Study Architect",
  "Deadline Dominator", "Consistency Keeper", "Exam Preparer", "Performance Tracker", "Organized Mind",
  "Study Specialist", "Progress Builder", "Efficiency Learner", "Momentum Creator", "Discipline Keeper",
  "Academic Warrior", "Focus Specialist", "Strategy Planner", "Study Commander", "Productivity Knight",

  // PHASE 3 — Elite Performer (40–59)
  "System Optimizer", "Task Elite", "Focus Veteran", "Consistency Elite", "Time Guardian",
  "Performance Master", "Routine Architect", "Deep Work Specialist", "Momentum Master", "Academic Champion",
  "Precision Planner", "Efficiency Master", "Deadline Slayer", "Focus Overlord", "Productivity Expert",
  "Discipline Titan", "Time Architect", "Study General", "Task Virtuoso", "Academic Conqueror",

  // PHASE 4 — Cosmic Ascension (60–79)
  "Orbit Organizer", "Stellar Strategist", "Gravity Defier", "Focus Voyager", "Habit Navigator",
  "Time Voyager", "Momentum Surfer", "Discipline Voyager", "Stellar Achiever", "Cosmic Performer",
  "Nebula Navigator", "Orbit Commander", "Stellar Guardian", "Galaxy Strategist", "Supernova Achiever",
  "Comet Commander", "Meteor Master", "Celestial Performer", "Quantum Planner", "Cosmic Architect",

  // PHASE 5 — Mythic Productivity Entity (80–99)
  "Dimension Organizer", "Reality Planner", "Timeline Keeper", "Energy Controller", "Time Bender",
  "Light Speed Achiever", "Warp Strategist", "Wormhole Commander", "Multiverse Planner", "Cosmic Entity",
  "Astral Guardian", "Galactic Sovereign", "Stellar Emperor", "Universal Strategist", "Time Sovereign",
  "Reality Architect", "Star Creator", "Galaxy Forger", "Universe Shaper","Infinity Sovereign", "ONE ABOVE ALL"
];

export const getLevelTitle = (level: number) => {
    if (level >= 100) return "ONE ABOVE ALL";
    return LEVEL_TITLES[level] || "Student";
};
