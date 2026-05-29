
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Task, UserProfile, ClassSession, UpcomingEvent, CampusChecklistItem, DailyRoutineItem, BudgetState, FocusState, ExamSchedule, Category, ProgressMilestone } from '../types';
import { getLevelTitle } from '../constants';
import { playSound } from '../utils/sound';

// Helper to check for class conflicts (simple version)
const hasClassConflicts = (classes: ClassSession[]) => {
    if (!classes || classes.length === 0) return false;
    // Group by day
    const byDay: Record<string, ClassSession[]> = {};
    for (const c of classes) {
        if (!byDay[c.day]) byDay[c.day] = [];
        byDay[c.day].push(c);
    }
    
    for (const day in byDay) {
        const dayClasses = byDay[day].sort((a,b) => a.startTime.localeCompare(b.startTime));
        for (let i = 0; i < dayClasses.length - 1; i++) {
            const currentEnd = dayClasses[i].endTime;
            const nextStart = dayClasses[i+1].startTime;
            if (currentEnd > nextStart) return true;
        }
    }
    return false;
};

// Helper for Level Titles
// (Moved to constants.ts)

const MILESTONE_PALETTE = [
  { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
  { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
  { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
  { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]' },
  { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]' },
  { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]' },
  { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.2)]' },
  { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.2)]' },
  { text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30', glow: 'shadow-[0_0_15px_rgba(132,204,22,0.2)]' },
  { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
  { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.2)]' },
];

// Updated Legendary Styles - Vibrant, Random, No Gray
const LEGENDARY_STYLES = [
    { name: 'Cosmic', bg: 'bg-gradient-to-br from-violet-900/60 to-fuchsia-900/60', border: 'border-fuchsia-500/50', text: 'text-fuchsia-200', icon: 'text-fuchsia-400', glow: 'shadow-[0_0_30px_rgba(217,70,239,0.4)]' },
    { name: 'Gold', bg: 'bg-gradient-to-br from-amber-900/60 to-yellow-900/60', border: 'border-amber-500/50', text: 'text-amber-200', icon: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]' },
    { name: 'Fire', bg: 'bg-gradient-to-br from-red-900/60 to-orange-900/60', border: 'border-red-500/50', text: 'text-red-200', icon: 'text-red-400', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]' },
    { name: 'Ice', bg: 'bg-gradient-to-br from-cyan-900/60 to-sky-900/60', border: 'border-cyan-500/50', text: 'text-cyan-200', icon: 'text-cyan-400', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]' },
    { name: 'Nature', bg: 'bg-gradient-to-br from-emerald-900/60 to-lime-900/60', border: 'border-emerald-500/50', text: 'text-emerald-200', icon: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]' },
    { name: 'Nebula', bg: 'bg-gradient-to-br from-indigo-900/60 to-purple-900/60', border: 'border-indigo-500/50', text: 'text-indigo-200', icon: 'text-indigo-400', glow: 'shadow-[0_0_30px_rgba(99,102,241,0.4)]' },
    { name: 'Plasma', bg: 'bg-gradient-to-br from-pink-900/60 to-rose-900/60', border: 'border-pink-500/50', text: 'text-pink-200', icon: 'text-pink-400', glow: 'shadow-[0_0_30px_rgba(236,72,153,0.4)]' },
    { name: 'Quantum', bg: 'bg-gradient-to-br from-teal-900/60 to-cyan-900/60', border: 'border-teal-500/50', text: 'text-teal-200', icon: 'text-teal-400', glow: 'shadow-[0_0_30px_rgba(20,184,166,0.4)]' },
];

interface ProgressScreenProps {
  tasks: Task[];
  userProfile: UserProfile | null;
  classes?: ClassSession[];
  events?: UpcomingEvent[];
  checklist?: CampusChecklistItem[];
  routine?: DailyRoutineItem[];
  budget?: BudgetState;
  focusState?: FocusState;
  examSchedules?: ExamSchedule[];
  claimedMilestones?: string[];
  onClaimMilestone?: (id: string) => void;
  viewingMilestone: ProgressMilestone | null;
  setViewingMilestone: (m: ProgressMilestone | null) => void;
  claimingMilestone: ProgressMilestone | null;
  setClaimingMilestone: (m: ProgressMilestone | null) => void;
  showClaimSuccess: ProgressMilestone | null;
  setShowClaimSuccess: (m: ProgressMilestone | null) => void;
  showLevelTable: boolean;
  setShowLevelTable: (show: boolean) => void;
  lifeBalanceStats?: Record<string, number>;
  onResetLifeBalance?: () => void;
}

// Helper for Level Titles
// (Imported from constants.ts)

const ProgressScreen: React.FC<ProgressScreenProps> = ({ 
    tasks, userProfile, classes = [], events = [], checklist = [], routine = [], 
    budget, focusState, examSchedules = [], claimedMilestones = [], onClaimMilestone,
    viewingMilestone, setViewingMilestone, claimingMilestone, setClaimingMilestone,
    showClaimSuccess, setShowClaimSuccess, showLevelTable, setShowLevelTable,
    lifeBalanceStats, onResetLifeBalance
}) => {
  const [showAllLocked, setShowAllLocked] = useState(false);
  const [showAllLegendary, setShowAllLegendary] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Navigation Menu State
  const [showNavMenu, setShowNavMenu] = useState(false);
  const sectionRefs = {
      level: useRef<HTMLDivElement>(null),
      streak: useRef<HTMLDivElement>(null),
      activity: useRef<HTMLDivElement>(null),
      milestones: useRef<HTMLDivElement>(null),
      balance: useRef<HTMLDivElement>(null),
  };

  const handleScrollTo = (section: keyof typeof sectionRefs) => {
      sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowNavMenu(false);
  };

  const menuItems = [
    { id: 'level', label: 'Current Level', icon: 'stars', color: 'text-indigo-400', bg: 'hover:bg-indigo-500/10', border: 'hover:border-indigo-500/20' },
    { id: 'streak', label: 'Weekly Streak', icon: 'local_fire_department', color: 'text-orange-400', bg: 'hover:bg-orange-500/10', border: 'hover:border-orange-500/20' },
    { id: 'balance', label: 'Life Balance', icon: 'balance', color: 'text-blue-400', bg: 'hover:bg-blue-500/10', border: 'hover:border-blue-500/20' },
    { id: 'activity', label: 'Weekly Activity', icon: 'bar_chart', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10', border: 'hover:border-emerald-500/20' },
    { id: 'milestones', label: 'Milestones', icon: 'emoji_events', color: 'text-yellow-400', bg: 'hover:bg-yellow-500/10', border: 'hover:border-yellow-500/20' },
  ];

  const now = new Date();
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  const handleLevelStart = () => {
    longPressTimer.current = window.setTimeout(() => {
        setShowLevelTable(true);
    }, 600);
  };

  const handleLevelEnd = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
    }
  };

  const handleMilestonePressStart = (milestone: ProgressMilestone) => {
      longPressTimer.current = window.setTimeout(() => {
          setViewingMilestone(milestone);
      }, 500);
  };

  const handleMilestonePressEnd = () => {
      if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
      }
  };

  const handleClaim = (milestone: ProgressMilestone) => {
    playSound('milestone');
    setClaimingMilestone(milestone);
    setTimeout(() => {
        onClaimMilestone?.(milestone.name);
        setClaimingMilestone(null);
        setShowClaimSuccess(milestone);
    }, 1200);
  };

  // --- 1. REAL STREAK CALCULATION ---
  const currentStreak = useMemo(() => {
    const completedWithDates = tasks
        .filter(t => t.completed && t.completedAt)
        .map(t => new Date(t.completedAt!).setHours(0,0,0,0))
        .sort((a, b) => b - a);

    if (completedWithDates.length === 0) return 0;

    const uniqueDates = Array.from(new Set(completedWithDates));
    const today = new Date().setHours(0,0,0,0);
    const yesterday = today - 86400000;

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 0;
    let checkDate = uniqueDates[0] === today ? today : yesterday;

    for (const date of uniqueDates) {
        if (date === checkDate) {
            streak++;
            checkDate -= 86400000;
        } else {
            break; 
        }
    }
    return streak;
  }, [tasks]);

  // --- 1.5 TOTAL ACTIVE DAYS ---
  const totalActiveDays = useMemo(() => {
    const dates = new Set<string>();
    
    const addDate = (dateStr?: string) => {
        if (!dateStr) return;
        const d = new Date(dateStr);
        dates.add(d.toDateString());
    };

    tasks.forEach(t => { if (t.completed) addDate(t.completedAt); });
    checklist.forEach(c => { if (c.completed) addDate(c.completedAt); });
    routine.forEach(r => { if (r.completed) addDate(r.completedAt); });
    
    if (userProfile?.joinedDate) {
        addDate(userProfile.joinedDate);
    }

    return dates.size;
  }, [tasks, checklist, routine, userProfile]);

  const getStreakMotivation = (days: number) => {
      if (days === 0) return "Your journey begins today. Take the first step!";
      if (days < 3) return "Great start! Consistency is the key to success.";
      if (days < 7) return "You're building momentum. Keep pushing forward!";
      if (days < 14) return "A full week of dedication! You're unstoppable.";
      if (days < 21) return "Two weeks of focus. Habits are forming now.";
      if (days < 30) return "Almost a month! Your dedication is inspiring.";
      if (days < 60) return "A whole month of growth. You're transforming!";
      if (days < 100) return "Two months of power. You're a productivity machine.";
      return "100+ days! You are a true legend of consistency.";
  };

  // --- 2. STATS CALCULATION ---
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = new Date().getDay();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - todayIndex);
    currentWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const currentWeekCounts = new Array(7).fill(0);
    const lastWeekCounts = new Array(7).fill(0);

    let morningCount = 0;
    let afternoonCount = 0;
    let eveningCount = 0;

    const processItem = (completedAt?: string) => {
        if (!completedAt) return;
        const date = new Date(completedAt);
        const time = date.getTime();
        
        if (time >= currentWeekStart.getTime() && time < currentWeekStart.getTime() + 7 * 86400000) {
            currentWeekCounts[date.getDay()]++;
        }
        if (time >= lastWeekStart.getTime() && time < lastWeekStart.getTime() + 7 * 86400000) {
            lastWeekCounts[date.getDay()]++;
        }

        const hour = date.getHours();
        if (hour >= 5 && hour < 12) morningCount++;
        else if (hour >= 12 && hour < 18) afternoonCount++;
        else eveningCount++;
    };

    tasks.forEach(task => { if (task.completed) processItem(task.completedAt); });
    checklist.forEach(item => { if (item.completed) processItem(item.completedAt); });
    routine.forEach(item => { if (item.completed) processItem(item.completedAt); });

    const rotatedDays = [...days.slice(1), days[0]]; 
    const rotatedCounts = [...currentWeekCounts.slice(1), currentWeekCounts[0]];
    const maxVal = Math.max(...rotatedCounts, 1);

    const graphData = rotatedDays.map((day, idx) => ({
        day,
        value: (rotatedCounts[idx] / maxVal) * 100,
        rawCount: rotatedCounts[idx],
        isToday: day === days[now.getDay()]
    }));

    const totalCurrent = currentWeekCounts.reduce((a,b) => a+b, 0);
    const totalLast = lastWeekCounts.reduce((a,b) => a+b, 0);
    
    let percentageChange = 0;
    if (totalLast === 0) {
        percentageChange = totalCurrent > 0 ? 100 : 0;
    } else {
        percentageChange = Math.round(((totalCurrent - totalLast) / totalLast) * 100);
    }

    let peakTime = 'Balanced';
    const maxPulse = Math.max(morningCount, afternoonCount, eveningCount);
    if (maxPulse > 0) {
        if (morningCount === maxPulse) peakTime = 'Early Bird';
        else if (afternoonCount === maxPulse) peakTime = 'Afternoon Grinder';
        else peakTime = 'Night Owl';
    }

    return { graphData, totalCurrent, percentageChange, peakTime, morningCount, afternoonCount, eveningCount };
  }, [tasks, checklist, routine]);

  const xp: number = userProfile?.xp || 0;
  const level: number = userProfile?.level ?? 0;
  const currentLevelXp = xp % 1000; 
  const xpProgress = (currentLevelXp / 1000) * 100;

  // --- 4. MILESTONES ENGINE ---
  const totalCompleted = tasks.filter(t => t.completed).length;
  const highPriorityCompleted = tasks.filter(t => t.completed && t.priority === 'high').length;
  
  const uniqueFutureDates = new Set(tasks.filter(t => new Date(t.date) > now).map(t => t.date)).size;
  const dailyTaskCounts = tasks.filter(t => t.completed).reduce((acc: Record<string, number>, t) => {
      const d = t.date;
      acc[d] = (acc[d] || 0) + 1;
      return acc;
  }, {});
  const maxTasksInOneDay = (Object.values(dailyTaskCounts) as number[]).reduce((a, b) => Math.max(a, b), 0);
  
  const hasEarlyTask = tasks.some(t => t.completed && parseInt(t.time) < 7);
  const hasLateTask = tasks.some(t => t.completed && parseInt(t.time) >= 23);
  const hasConflict = hasClassConflicts(classes);
  const allWeekdaysClasses = ['Monday','Tuesday','Wednesday','Thursday','Friday'].every(d => classes.some(c => c.day === d));
  const notesCount = classes.filter(c => c.notes).length;
  const joinedDays = userProfile?.joinedDate ? Math.floor((now.getTime() - new Date(userProfile.joinedDate).getTime()) / (1000 * 3600 * 24)) : 0;

  const allRoutineDone = routine.length > 0 && routine.every(r => r.completed);
  const customHabitCount = routine.filter(r => r.type === 'custom').length;
  const checklistActive = checklist.length > 0;
  const checklistDone = checklist.length > 0 && checklist.every(c => c.completed);
  const budgetTxCount = budget ? budget.transactions.length : 0;
  const totalFocusSessions = focusState?.totalSessions || 0;
  const examCount = examSchedules.length;
  const confirmedExamCount = examSchedules.filter(e => e.isConfirmed).length;

  const normalMilestones = [
      { name: 'First Orbit', req: 'Complete 1 Task', icon: 'check_circle', unlocked: totalCompleted >= 1 },
      { name: 'Hobbyist', req: 'Complete a Hobbies task', icon: 'palette', unlocked: tasks.some(t => t.completed && t.category === Category.HOBBIES) },
      { name: 'Double Check', req: 'Complete 2 tasks in a single day', icon: 'done_all', unlocked: maxTasksInOneDay >= 2 },
      { name: 'Daily Commander', req: 'Complete all tasks for a day', icon: 'fact_check', unlocked: tasks.length > 0 && tasks.every(t => t.completed) },
      { name: 'Early Bird', req: 'Complete a task before 7 AM', icon: 'wb_twilight', unlocked: hasEarlyTask },
      { name: 'Night Owl', req: 'Complete a task after 11 PM', icon: 'dark_mode', unlocked: hasLateTask },
      { name: 'Priority Hunter', req: 'Complete 10 High-priority tasks', icon: 'priority_high', unlocked: highPriorityCompleted >= 10 },
      { name: 'Perfect Planner', req: 'Plan 5 future days', icon: 'calendar_month', unlocked: uniqueFutureDates >= 5 },
      { name: 'Clean Slate', req: 'Have zero pending tasks', icon: 'cleaning_services', unlocked: tasks.length > 0 && tasks.every(t => t.completed) },
      { name: 'Spark Ignited', req: 'Start a 2-day streak', icon: 'local_fire_department', unlocked: currentStreak >= 2 },
      { name: 'On Fire', req: '5-day streak', icon: 'whatshot', unlocked: currentStreak >= 5 },
      { name: 'Habit Builder', req: '7-day streak', icon: 'repeat', unlocked: currentStreak >= 7 },
      { name: 'Unbroken Week', req: 'Complete tasks all week', icon: 'date_range', unlocked: currentStreak >= 7 },
      { name: 'First Lecture', req: 'Add your first class', icon: 'school', unlocked: classes.length >= 1 },
      { name: 'Timetable Architect', req: 'Fill all weekdays', icon: 'architecture', unlocked: allWeekdaysClasses },
      { name: 'Conflict Free', req: 'No conflicts in timetable', icon: 'thumb_up', unlocked: classes.length > 3 && !hasConflict },
      { name: 'Quiet Day', req: 'Day with no classes', icon: 'volume_off', unlocked: classes.some(c => c.day !== new Date().toLocaleDateString('en-US', {weekday:'long'})) },
      { name: 'Note Taker', req: 'Add first class note', icon: 'edit_note', unlocked: notesCount >= 1 },
      { name: 'Bullet Brain', req: 'Use bullet notes', icon: 'format_list_bulleted', unlocked: classes.some(c => c.noteFormat === 'bullets') },
      { name: 'Checklist User', req: 'Add items to checklist', icon: 'checklist', unlocked: checklistActive },
      { name: 'Routine Master', req: 'Complete daily routine', icon: 'task_alt', unlocked: allRoutineDone },
      { name: 'Weekly Warrior', req: 'Complete a weekly habit', icon: 'date_range', unlocked: routine.some(r => r.frequency === 'weekly' && r.completed) },
      { name: 'Monthly Master', req: 'Complete a monthly habit', icon: 'calendar_month', unlocked: routine.some(r => r.frequency === 'monthly' && r.completed) },
      { name: 'Habit Starter', req: 'Add a custom habit', icon: 'add_circle', unlocked: customHabitCount > 0 },
      { name: 'Focus Initiate', req: 'Complete 1 focus session', icon: 'self_improvement', unlocked: totalFocusSessions >= 1 },
      { name: 'Deep Worker', req: 'Complete 5 focus sessions', icon: 'psychology', unlocked: totalFocusSessions >= 5 },
      { name: 'Zen Master', req: 'Complete 20 focus sessions', icon: 'spa', unlocked: totalFocusSessions >= 20 },
      { name: 'XP Collector', req: 'Earn 1000 XP', icon: 'stars', unlocked: xp >= 1000 },
      { name: 'Level Up!', req: 'Reach Level 1', icon: 'upgrade', unlocked: level >= 1 },
      { name: 'Rising Star', req: 'Reach Level 5', icon: 'hotel_class', unlocked: level >= 5 },
      { name: 'Penny Pincher', req: 'Track first expense', icon: 'payments', unlocked: budgetTxCount >= 1 },
      { name: 'Finance Guru', req: 'Track 10 expenses', icon: 'account_balance_wallet', unlocked: budgetTxCount >= 10 },
      { name: 'Event Horizon', req: 'Add first event', icon: 'event', unlocked: events.length >= 1 },
      { name: 'Time Keeper', req: 'Attend an event', icon: 'schedule', unlocked: events.length >= 1 }, 
      { name: 'Exam Strategist', req: 'Create an Exam Schedule', icon: 'assignment', unlocked: examCount >= 1 },
      { name: 'Finalized Plan', req: 'Confirm an Exam Schedule', icon: 'assignment_turned_in', unlocked: confirmedExamCount >= 1 },
      { name: 'Fully Booked', req: 'Task+Class+Event in one day', icon: 'layers', unlocked: tasks.length>0 && classes.length>0 && events.length>0 },
      { name: 'Planner Pro', req: '7 day streak', icon: 'verified', unlocked: currentStreak >= 7 }
  ].map((m, i) => ({ 
      ...m, 
      type: 'normal' as const, 
      style: MILESTONE_PALETTE[i % MILESTONE_PALETTE.length],
      claimed: claimedMilestones.includes(m.name)
  }));

  // Distribute random good-looking styles for legendary milestones
  const legendaryMilestones = [
      { name: 'Cosmic Genesis', req: 'Reach Level 8', icon: 'public', unlocked: level >= 8 },
      { name: 'Disciplined Mind', req: '14-day streak', icon: 'self_improvement', unlocked: currentStreak >= 14 },
      { name: 'Architect of Time', req: '20+ Classes Added', icon: 'history_edu', unlocked: classes.length >= 20 },
      { name: 'Streak Immortal', req: '30-day streak', icon: 'local_fire_department', unlocked: currentStreak >= 30 },
      { name: 'Unbreakable Flame', req: '21-day streak', icon: 'whatshot', unlocked: currentStreak >= 21 },
      { name: 'Comeback Legend', req: 'Reach Level 10', icon: 'replay', unlocked: level >= 10 },
      { name: 'Zero Chaos', req: 'No conflicts (Active)', icon: 'balance', unlocked: !hasConflict && classes.length > 5 },
      { name: 'Chrono Master', req: '100 Tasks Done', icon: 'hourglass_full', unlocked: totalCompleted >= 100 },
      { name: 'Future Seer', req: '30 tasks planned ahead', icon: 'visibility', unlocked: uniqueFutureDates >= 30 },
      { name: 'Mind Over Matter', req: '50 Focus Sessions', icon: 'filter_center_focus', unlocked: totalFocusSessions >= 50 },
      { name: 'Task Overlord', req: '500 Tasks Done', icon: 'military_tech', unlocked: totalCompleted >= 500 },
      { name: 'XP Titan', req: '10,000 XP Earned', icon: 'workspace_premium', unlocked: xp >= 10000 },
      { name: 'Level Ascendant', req: 'Reach Level 20', icon: 'rocket_launch', unlocked: level >= 20 },
      { name: 'Relentless', req: '50 High Priority Done', icon: 'bolt', unlocked: highPriorityCompleted >= 50 },
      { name: 'Class Perfected', req: '14-day streak', icon: 'school', unlocked: currentStreak >= 14 },
      { name: 'Lecture Marathon', req: '5 classes in a day', icon: 'menu_book', unlocked: classes.filter(c => c.day === new Date().toLocaleDateString('en-US', {weekday:'long'})).length >= 5 },
      { name: 'Checklist Champion', req: 'Clear list with 5+ items', icon: 'checklist_rtl', unlocked: checklistDone && checklist.length >= 5 },
      { name: 'Frozen Will', req: 'Unlock 10 Legends', icon: 'ac_unit', unlocked: false },
      { name: 'Icebound Focus', req: 'Reach Level 15', icon: 'psychology', unlocked: level >= 15 },
      { name: 'Silent Efficiency', req: '7-day streak', icon: 'notifications_off', unlocked: currentStreak >= 7 },
      { name: 'Cosmic Veteran', req: 'Member for 90 days', icon: 'stars', unlocked: joinedDays >= 90 },
      { name: 'System Breaker', req: 'Level 15 + 7 Day Streak', icon: 'terminal', unlocked: level >= 15 && currentStreak >= 7 },
      { name: 'Time Itself Obeys', req: '30 Day Streak', icon: 'schedule', unlocked: currentStreak >= 30 },
      { name: 'Legend of Campus', req: 'Unlock All Legends', icon: 'diamond', unlocked: false }
  ].map((m, i) => {
      // Cycle through random vibrant styles
      const style = LEGENDARY_STYLES[i % LEGENDARY_STYLES.length];
      return { ...m, type: 'legendary' as const, style, claimed: claimedMilestones.includes(m.name) };
  });

  const unlockedLegendCount = legendaryMilestones.filter(m => m.unlocked).length;
  legendaryMilestones.find(m => m.name === 'Frozen Will')!.unlocked = unlockedLegendCount >= 10;
  legendaryMilestones.find(m => m.name === 'Legend of Campus')!.unlocked = unlockedLegendCount >= 22;

  const allCompleted = [
      ...normalMilestones.filter(m => m.claimed),
      ...legendaryMilestones.filter(m => m.claimed)
  ];
  
  const pendingClaims = [
      ...normalMilestones.filter(m => m.unlocked && !m.claimed),
      ...legendaryMilestones.filter(m => m.unlocked && !m.claimed)
  ];
  
  const lockedNormal = normalMilestones.filter(m => !m.unlocked);
  const lockedLegendary = legendaryMilestones.filter(m => !m.unlocked);
  
  const displayedLocked = showAllLocked ? lockedNormal : lockedNormal.slice(0, 4);
  const displayedLockedLegendary = showAllLegendary ? lockedLegendary : lockedLegendary.slice(0, 4);

  return (
    <div className="p-4 space-y-6" onClick={() => setShowNavMenu(false)}>
      {/* Header */}
      <div className="pt-4 pb-2 px-2 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(13,127,242,0.4)]">Your Progress</h2>
            <p className="text-slate-400 font-bold text-xs mt-1">Track your academic journey.</p>
        </div>
        <div className="relative">
            <button 
                onClick={(e) => { e.stopPropagation(); playSound('click'); setShowNavMenu(!showNavMenu); }} 
                className="size-11 flex items-center justify-center rounded-2xl relative group active:scale-95 transition-transform apple-glass-icon"
            >
                <span className="material-symbols-outlined text-2xl text-slate-300 drop-shadow-md">toc</span>
            </button>
            {showNavMenu && (
                <div className="absolute top-14 right-0 w-56 bg-[#1a2530]/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl z-[60] overflow-hidden animate-zoom-in p-2">
                    {menuItems.map((item, index) => (
                        <button 
                            key={item.id}
                            onClick={() => { playSound('click'); handleScrollTo(item.id as keyof typeof sectionRefs); }} 
                            className={`w-full px-4 py-3 rounded-xl text-left text-xs font-bold text-slate-300 transition-all duration-300 flex items-center gap-3 group border border-transparent ${item.bg} ${item.border} active:scale-95 mb-1 last:mb-0`}
                            style={{ animation: `slideInItem 0.2s forwards ${index * 0.03}s`, opacity: 0, transform: 'translateX(-10px)' }}
                        >
                            <div className={`size-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ${item.color.replace('text-', 'bg-').replace('400', '500/20')}`}>
                                <span className={`material-symbols-outlined text-sm ${item.color} drop-shadow-md`}>{item.icon}</span>
                            </div>
                            <span className="group-hover:text-white transition-colors">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Level / XP Card */}
      <div 
        ref={sectionRefs.level}
        className="relative rounded-[32px] p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-white/10 overflow-hidden active:scale-[0.98] transition-all cursor-pointer select-none"
        onDoubleClick={() => setShowLevelTable(true)}
        onMouseDown={handleLevelStart}
        onMouseUp={handleLevelEnd}
        onMouseLeave={handleLevelEnd}
        onTouchStart={handleLevelStart}
        onTouchEnd={handleLevelEnd}
      >
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Level</p>
                <div className="flex items-center gap-3">
                    <p className="text-4xl font-black text-white">{level}</p>
                    <span className="text-sm font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        {getLevelTitle(level)}
                    </span>
                </div>
            </div>
            <div className="size-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-3xl text-indigo-400">award_star</span>
            </div>
        </div>
        <div className="relative z-10">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                <span>{xp.toLocaleString()} XP</span>
                <span>{((level + 1) * 1000).toLocaleString()} XP</span>
            </div>
            <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${xpProgress}%` }}></div>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                {(1000 - currentLevelXp).toLocaleString()} XP to Level {level + 1}
            </p>
        </div>
        <div className="absolute -right-10 -bottom-10 size-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
      </div>

      {/* Streak Card - Real Data */}
      <div ref={sectionRefs.streak} className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-streak-orange/10 to-transparent border border-streak-orange/20 shadow-lg shadow-streak-orange/5">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-streak-orange">Weekly Streak</p>
              <p className="text-4xl font-black tracking-tight text-white">{currentStreak} Days</p>
              <p className="text-xs font-bold text-slate-400">
                {currentStreak === 0 ? "Complete a task to start!" : "Keep the flame alive!"}
              </p>
            </div>
            <div className="fire-glow bg-streak-orange/20 rounded-full p-4 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-4xl text-streak-orange">local_fire_department</span>
            </div>
          </div>
          <div className="flex gap-1.5 h-2">
             {[...Array(7)].map((_, i) => (
                 <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all ${i < currentStreak ? 'bg-streak-orange shadow-[0_0_8px_rgba(255,107,0,0.6)]' : 'bg-white/5'}`}
                 ></div>
             ))}
          </div>
        </div>
      </div>

      {/* Total Active Days / Best Streak Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-transparent border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-10 -top-10 size-40 bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-fuchsia-500/30 transition-colors duration-500"></div>
        <div className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Total Active Days</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">{totalActiveDays}</p>
                        <p className="text-sm font-bold text-fuchsia-300">Days</p>
                    </div>
                </div>
                <div className="size-14 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                    <span className="material-symbols-outlined text-3xl text-fuchsia-400">workspace_premium</span>
                </div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                <p className="text-xs font-bold text-slate-300 italic leading-relaxed">
                    "{getStreakMotivation(totalActiveDays)}"
                </p>
            </div>
        </div>
      </div>

      {(() => {
        const getStatsScore = (catName: string) => {
           if (!lifeBalanceStats) return 0;
           return lifeBalanceStats[catName] || 0;
        };

        const maxCompleted = Math.max(
          10,
          getStatsScore('Study'),
          getStatsScore('Work'),
          getStatsScore('Health'),
          getStatsScore('Personal'),
          getStatsScore('Hobbies'),
          getStatsScore('Habits')
        );

        const calculateRadarScore = (catName: string) => {
          return Math.round((getStatsScore(catName) / maxCompleted) * 100);
        };

        const radarData = [
          { subject: 'Study', A: calculateRadarScore('Study'), fullMark: 100, color: '#3b82f6', icon: 'menu_book' },
          { subject: 'Work', A: calculateRadarScore('Work'), fullMark: 100, color: '#f59e0b', icon: 'work' },
          { subject: 'Health', A: calculateRadarScore('Health'), fullMark: 100, color: '#10b981', icon: 'favorite' },
          { subject: 'Personal', A: calculateRadarScore('Personal'), fullMark: 100, color: '#06b6d4', icon: 'person' },
          { subject: 'Hobbies', A: calculateRadarScore('Hobbies'), fullMark: 100, color: '#d946ef', icon: 'palette' },
          { subject: 'Habits', A: calculateRadarScore('Habits'), fullMark: 100, color: '#f43f5e', icon: 'task_alt' },
        ];

        const overallBalance = Math.round(radarData.reduce((acc, curr) => acc + curr.A, 0) / radarData.length);

        const CustomTick = (props: any) => {
          const { payload, x, y, textAnchor } = props;
          const dataPoint = radarData.find(d => d.subject === payload.value);
          if (!dataPoint) return null;
          
          const value = Math.round(dataPoint.A);
          const color = dataPoint.color;
          const icon = dataPoint.icon;
          
          let yOffset = 0;
          let xOffset = 0;
          
          if (textAnchor === 'middle') {
            yOffset = y < 200 ? -40 : 45;
          } else if (textAnchor === 'start') {
            xOffset = 45;
            yOffset = y < 200 ? -15 : 15;
          } else if (textAnchor === 'end') {
            xOffset = -45;
            yOffset = y < 200 ? -15 : 15;
          }
          
          return (
            <g transform={`translate(${x + xOffset},${y + yOffset})`}>
              <text x={0} y={-15} dy={0} textAnchor="middle" fill={color} className="material-symbols-outlined" fontSize={20} style={{ textShadow: `0 0 10px ${color}` }}>
                {icon}
              </text>
              <text x={0} y={5} dy={0} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="bold" letterSpacing={1}>
                {payload.value.toUpperCase()}
              </text>
              <text x={0} y={20} dy={0} textAnchor="middle" fill={color} fontSize={12} fontWeight="bold" style={{ textShadow: `0 0 10px ${color}` }}>
                {value}%
              </text>
            </g>
          );
        };

        const CustomDot = (props: any) => {
          const { cx, cy, payload } = props;
          const dataPoint = radarData.find(d => d.subject === payload.subject);
          if (!dataPoint) return null;
          const color = dataPoint.color;

          return (
            <g>
              <circle cx={cx} cy={cy} r={4} fill={color} />
              <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.5} className="animate-pulse" />
              <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.2} className="animate-pulse" />
            </g>
          );
        };

        return (
          <div ref={sectionRefs.balance} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">Life Balance</h2>
                <p className="text-slate-400 font-bold text-xs mt-1">Track your real life stats.</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="text-[10px] font-black px-3 py-1.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {onResetLifeBalance && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[10px] flex items-center gap-1 font-black px-3 py-1.5 rounded-full border bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[10px]">refresh</span>
                    RESET
                  </button>
                )}
              </div>
            </div>
            
            <div className="rounded-[32px] p-6 bg-[#0a0f16] border border-white/10 relative overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0f16] to-[#0a0f16]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 h-[400px] w-full mt-4">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RadarChart cx="50%" cy="50%" outerRadius="50%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={<CustomTick />} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} tick={false} axisLine={false} />
                      <Radar name="Balance" dataKey="A" stroke="url(#colorUv)" strokeWidth={3} fill="url(#colorUv)" fillOpacity={0.3} dot={<CustomDot />} activeDot={{ r: 6, fill: '#fff' }} isAnimationActive={false} />
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="20%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="40%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="60%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="80%" stopColor="#d946ef" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10, 15, 22, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        formatter={(value: number) => [`${Math.round(value)}%`, 'Score']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Overall Balance Metric */}
              <div className="mt-4 flex justify-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-md">
                  <div className="size-12 rounded-full border-2 border-blue-500 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
                    <span className="material-symbols-outlined text-blue-400">balance</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overall Balance</p>
                    <p className="text-2xl font-black text-white">
                      {overallBalance}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      
      {/* Activity Chart & Pulse */}
      <div ref={sectionRefs.activity} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-black tracking-tight">Weekly Activity</h2>
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${
              weeklyData.percentageChange >= 0 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
            {weeklyData.percentageChange > 0 ? '+' : ''}{weeklyData.percentageChange}% vs Last Week
          </span>
        </div>
        <div className="rounded-[32px] p-6 bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="mb-8">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tasks Completed</p>
            <p className="text-3xl font-black text-white mt-1">{weeklyData.totalCurrent}</p>
          </div>
          <div className="grid grid-cols-7 gap-3 h-40 items-end border-b border-white/5 pb-2">
            {weeklyData.graphData.map((point) => (
              <div key={point.day} className="flex flex-col items-center justify-end h-full group relative">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    point.isToday 
                      ? 'chart-bar-gradient bar-glow' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  style={{ height: `${point.value}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3 mt-3 mb-6">
            {weeklyData.graphData.map(p => (
              <p key={p.day} className={`text-[9px] text-center font-black uppercase tracking-wider ${p.isToday ? 'text-primary' : 'text-slate-500'}`}>
                {p.day}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div ref={sectionRefs.milestones} className="space-y-8 pb-6">
        <h2 className="text-2xl font-black tracking-tight px-2">Milestones</h2>

        {/* Pending Claims */}
        {pendingClaims.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary px-2 flex items-center gap-2">
                    Available to Claim <span className="size-1.5 rounded-full bg-primary animate-ping"></span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {pendingClaims.map((m) => (
                        <div key={m.name} className={`p-5 rounded-[32px] bg-[#1a2530] border border-white/10 flex items-center justify-between group animate-pulse-subtle`}>
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center ${m.style.bg} ${m.style.border} border`}>
                                    <span className={`material-symbols-outlined text-xl ${m.style.text}`}>{m.icon}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white">{m.name}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Requirement Met!</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleClaim(m)}
                                className={`px-5 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg ${
                                    m.type === 'legendary' 
                                    ? m.style.bg.replace('/60', '') 
                                    : m.style.bg.replace('/10', '/80')
                                }`}
                                style={{ boxShadow: `0 0 15px ${m.type === 'legendary' ? 'rgba(217,70,239,0.3)' : 'rgba(255,255,255,0.1)'}` }}
                            >
                                Claim Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Unlocked */}
        {allCompleted.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 flex items-center gap-2">
                Completed <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {allCompleted.map((m) => {
                  // Vibrant gradient for claimed milestones
                  const baseColor = m.style.text.replace('text-', '').replace('-400', '');
                  const isLegendary = m.type === 'legendary';
                  
                  let containerClasses = '';
                  let iconClasses = 'text-white drop-shadow-md';
                  
                  if (isLegendary) {
                      containerClasses = `${m.style.bg} ${m.style.border.replace('/50', '/80')} ${m.style.glow.replace('0.4', '0.8')}`;
                  } else {
                      containerClasses = `bg-gradient-to-br from-${baseColor}-600 to-${baseColor}-400 ${m.style.border.replace('/30', '/60')} ${m.style.glow.replace('0.2', '0.7')}`;
                  }

                  return (
                    <div 
                        key={m.name} 
                        onMouseDown={() => handleMilestonePressStart(m)}
                        onMouseUp={handleMilestonePressEnd}
                        onMouseLeave={handleMilestonePressEnd}
                        onTouchStart={() => handleMilestonePressStart(m)}
                        onTouchEnd={handleMilestonePressEnd}
                        className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 relative overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer hover:scale-[1.02] hover:brightness-110 group ${containerClasses}`}
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute -top-4 -right-4 size-12 bg-white/20 blur-xl rounded-full"></div>
                        <span className={`material-symbols-outlined text-3xl relative z-10 ${iconClasses}`}>{m.icon}</span>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black leading-tight text-white uppercase tracking-tight drop-shadow-sm">{m.name}</p>
                            <div className="mt-1 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[10px] text-white/90">verified</span>
                                <p className="text-[7px] font-black uppercase tracking-widest text-white/90">Obtained</p>
                            </div>
                        </div>
                    </div>
                  );
              })}
            </div>
          </div>
        )}

        {/* Locked Normal */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Locked Milestones</h3>
                 <button onClick={() => { playSound('click'); setShowAllLocked(!showAllLocked); }} className="text-[10px] font-bold text-primary uppercase tracking-wider hover:text-white transition-colors">{showAllLocked ? 'Show Less' : 'View All'}</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {displayedLocked.map((m) => (
                    <div key={m.name} className={`p-5 rounded-3xl border flex items-center gap-5 relative group transition-all duration-500 ${m.style.bg.replace('/10','/[0.03]')} ${m.style.border.replace('/20','/10')}`}>
                         <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${m.style.bg} ${m.style.border}`}>
                            <span className={`material-symbols-outlined text-xl ${m.style.text}`}>{m.icon}</span>
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{m.name}</p>
                            <p className={`text-[10px] font-black uppercase tracking-wider mt-1 opacity-60 ${m.style.text}`}>{m.req}</p>
                         </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Locked Legendary */}
        <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                    Legendary Status <span className="material-symbols-outlined text-sm animate-spin-slow">stars</span>
                </h3>
                <button onClick={() => { playSound('click'); setShowAllLegendary(!showAllLegendary); }} className="text-[10px] font-bold text-purple-400 uppercase tracking-wider hover:text-white transition-colors">{showAllLegendary ? 'Show Less' : 'View All'}</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {displayedLockedLegendary.map((m) => (
                    <div key={m.name} className={`relative p-1 rounded-[26px] bg-gradient-to-r ${m.style.bg.includes('violet') ? 'from-violet-900/50 to-fuchsia-900/50' : 'from-slate-900 to-slate-800'} overflow-hidden group hover:scale-[1.01] transition-transform duration-300`}>
                        <div className="relative bg-[#0c1219] rounded-[24px] p-5 flex items-center gap-5 border border-white/5">
                            <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.style.bg} ${m.style.border} border`}>
                                <span className={`material-symbols-outlined text-2xl ${m.style.icon}`}>{m.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-black uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400`}>{m.name}</h4>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{m.req}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-700 group-hover:text-slate-500 transition-colors">lock</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
           
           {/* Modal Dialog */}
           <div className="relative z-10 w-full max-w-sm bg-[#1e2a36] border border-white/10 rounded-3xl p-6 shadow-2xl animate-zoom-in">
               <div className="size-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                   <span className="material-symbols-outlined text-3xl">warning</span>
               </div>
               
               <h2 className="text-xl font-black text-white text-center mb-2 tracking-tight">Reset Life Balance?</h2>
               <p className="text-slate-400 text-sm text-center mb-6 font-bold">Are you sure you want to reset your life balance stats? This action cannot be undone.</p>
               
               <div className="grid grid-cols-2 gap-3">
                   <button
                       onClick={() => setShowResetConfirm(false)}
                       className="py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                   >
                       Cancel
                   </button>
                   <button
                       onClick={() => {
                           if (onResetLifeBalance) onResetLifeBalance();
                           setShowResetConfirm(false);
                       }}
                       className="py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 hover:text-red-400 transition-colors"
                   >
                       Reset
                   </button>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ProgressScreen;
