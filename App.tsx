//COSMIC CAMPUS APP CODE
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_TASKS, INITIAL_CLASSES, UPCOMING_EVENTS, MALE_ICON, FEMALE_ICON, getLevelTitle } from './constants';
import { Task, Category, ClassSession, UpcomingEvent, UserProfile, CampusChecklistItem, DailyRoutineItem, ResourceLink, BudgetState, BudgetPeriod, FocusState, ExamSchedule, ExamSubject, ProgressMilestone } from './types';
import TasksScreen from './components/TasksScreen';
import TimetableScreen from './components/TimetableScreen';
import ProgressScreen from './components/ProgressScreen';
import AddTaskModal from './components/AddTaskModal';
import EditTaskModal from './components/EditTaskModal';
import AddClassModal from './components/AddClassModal';
import EditClassModal from './components/EditClassModal';
import AddEventModal from './components/AddEventModal';
import AddResourceModal from './components/AddResourceModal';
import FocusModal from './components/FocusModal';
import ExamModal from './components/ExamModal'; // Now used for adding subjects
import AddExamGroupModal from './components/AddExamGroupModal';
import LevelUpCelebration from './components/LevelUpCelebration';
import { playSound } from './utils/sound';

type Screen = 'tasks' | 'planner' | 'stats' | 'settings';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('tasks');
  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cosmic_campus_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showOnboarding, setShowOnboarding] = useState(!userProfile);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [classes, setClasses] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });
  const [events, setEvents] = useState<UpcomingEvent[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_events');
    return saved ? JSON.parse(saved) : UPCOMING_EVENTS;
  });
  const [checklist, setChecklist] = useState<CampusChecklistItem[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_checklist');
    return saved ? JSON.parse(saved) : [];
  });
  const [routine, setRoutine] = useState<DailyRoutineItem[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_routine');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'r1', title: 'Wake up before', type: 'fixed', frequency: 'daily', completed: false, color: 'bg-indigo-500' },
      { id: 'r2', title: 'Eat breakfast before', type: 'fixed', frequency: 'daily', completed: false, color: 'bg-emerald-500' },
      { id: 'r3', title: 'Sleep before', type: 'fixed', frequency: 'daily', completed: false, color: 'bg-purple-500' },
    ];
  });
  const [resources, setResources] = useState<ResourceLink[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_resources');
    return saved ? JSON.parse(saved) : [];
  });
  const [budget, setBudget] = useState<BudgetState>(() => {
    const saved = localStorage.getItem('cosmic_campus_budget');
    return saved ? JSON.parse(saved) : { period: 'daily', transactions: [], lastReset: new Date().toISOString() };
  });
  
  // Updated Exam State to support Groups
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_exam_schedules');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Focus Mode State
  const [focusState, setFocusState] = useState<FocusState>(() => {
    const saved = localStorage.getItem('cosmic_campus_focus');
    return saved ? JSON.parse(saved) : { status: 'idle', duration: 25, timeLeft: 25 * 60, isPaused: false, totalSessions: 0 };
  });
  const [claimedMilestones, setClaimedMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_claimed_milestones');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFocusModal, setShowFocusModal] = useState(false);

  // Milestone Modal States (Moved from ProgressScreen to avoid stacking context issues)
  const [viewingMilestone, setViewingMilestone] = useState<ProgressMilestone | null>(null);
  const [claimingMilestone, setClaimingMilestone] = useState<ProgressMilestone | null>(null);
  const [showClaimSuccess, setShowClaimSuccess] = useState<ProgressMilestone | null>(null);
  const [showLevelTable, setShowLevelTable] = useState(false);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_claimed_milestones', JSON.stringify(claimedMilestones));
  }, [claimedMilestones]);

  const claimMilestone = (id: string) => {
    if (!claimedMilestones.includes(id)) {
      playSound('milestone');
      setClaimedMilestones(prev => [...prev, id]);
      updateXP(50);
    }
  };

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  
  // Exam Modals
  const [isAddExamGroupModalOpen, setIsAddExamGroupModalOpen] = useState(false);
  const [editingExamGroup, setEditingExamGroup] = useState<ExamSchedule | null>(null);
  const [activeExamGroupId, setActiveExamGroupId] = useState<string | null>(null); // For adding subject
  const [editingExamSubject, setEditingExamSubject] = useState<{ groupId: string, subject: ExamSubject } | null>(null);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_routine', JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_exam_schedules', JSON.stringify(examSchedules));
  }, [examSchedules]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_focus', JSON.stringify(focusState));
  }, [focusState]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('cosmic_campus_user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Focus Timer Logic
  const prevFocusStatus = useRef(focusState.status);
  
  useEffect(() => {
    if (prevFocusStatus.current === 'focus' && focusState.status === 'completed') {
      updateXP(100);
    }
    prevFocusStatus.current = focusState.status;
  }, [focusState.status]);

  useEffect(() => {
    let interval: number;
    if (focusState.status !== 'idle' && focusState.status !== 'completed' && !focusState.isPaused) {
        interval = window.setInterval(() => {
            setFocusState(prev => {
                if (prev.timeLeft <= 1) {
                    // Timer Finished
                    if (prev.status === 'focus') {
                        // Focus Done -> Completed directly
                        return {
                            ...prev,
                            status: 'completed',
                            timeLeft: 0,
                            isPaused: false,
                            totalSessions: prev.totalSessions + 1
                        };
                    }
                    return prev;
                }
                return { ...prev, timeLeft: prev.timeLeft - 1 };
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusState.status, focusState.isPaused]);

  const updateXP = (amount: number) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      const currentXp = prev.xp || 0;
      let newXp = Math.max(0, currentXp + amount);
      const currentLevel = prev.level || 0;
      const newLevel = Math.floor(newXp / 1000);

      if (newLevel > currentLevel) {
        playSound('levelUp');
        if (newLevel === 25 || newLevel === 50 || newLevel === 75 || newLevel === 100) {
          setCelebrationLevel(newLevel);
        }
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  };

  // Focus Handlers
  const startFocusSession = (minutes: number) => {
    setFocusState({
        status: 'focus',
        duration: minutes,
        timeLeft: minutes * 60,
        isPaused: false,
        totalSessions: focusState.totalSessions
    });
    setShowFocusModal(true);
  };

  const pauseFocusSession = () => setFocusState(prev => ({ ...prev, isPaused: true }));
  const resumeFocusSession = () => setFocusState(prev => ({ ...prev, isPaused: false }));
  
  const stopFocusSession = () => {
      setFocusState(prev => ({ ...prev, status: 'idle', timeLeft: prev.duration * 60, isPaused: false }));
  };

  // Task Handlers
  const toggleTask = (id: string) => {
    playSound('click');
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      const isCompleting = !task.completed;
      updateXP(isCompleting ? 10 : -10);
      return prev.map(t => t.id === id ? { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : undefined } : t);
    });
  };
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const addTask = (title: string, category: Category, date: string, time: string, priority: 'low'|'med'|'high') => {
    setTasks(prev => [{ id: Date.now().toString(), title, date, category, time, completed: false, priority }, ...prev]);
    setIsTaskModalOpen(false);
  };
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTask(null);
  };

  // Event & Class Handlers
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const updateEvent = (id: string, updates: Partial<UpcomingEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    setEditingEvent(null);
  };
  const handleAddEventFull = (title: string, date: string, startTime: string, endTime: string, location: string, description: string, icon: string) => {
    setEvents(prev => [...prev, { id: Date.now().toString(), title, date, startTime, endTime, location, description, icon }]);
    updateXP(100);
    setIsEventModalOpen(false);
  };
  const addClass = (name: string, room: string, startTime: string, endTime: string, day: string, instructor: string, type: 'LECTURE'|'LAB'|'WORKSHOP'|'SEMINAR'|'BREAK'|'THEORY CUM LAB') => {
    const colors = ['bg-primary', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500'];
    const color = colors[classes.length % colors.length];
    setClasses(prev => [...prev, { id: Date.now().toString(), name, room, instructor, startTime, endTime, day, color, type }]);
    updateXP(10);
    setIsClassModalOpen(false);
  };
  const updateClass = (id: string, updates: Partial<ClassSession>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingClass(null);
  };
  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    updateXP(-10);
  };
  const updateClassNotes = (id: string, notes: string, noteFormat: 'paragraph' | 'bullets') => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, notes, noteFormat } : c));
  };

  // --- NEW EXAM HANDLERS ---

  const addExamGroup = (title: string) => {
    const newGroup: ExamSchedule = {
      id: Date.now().toString(),
      title,
      isConfirmed: false,
      subjects: []
    };
    setExamSchedules(prev => [newGroup, ...prev]);
    updateXP(20); // Bonus for starting a schedule
    setIsAddExamGroupModalOpen(false);
  };

  const updateExamGroup = (id: string, title: string) => {
    setExamSchedules(prev => prev.map(g => g.id === id ? { ...g, title } : g));
    setEditingExamGroup(null);
  };

  const deleteExamGroup = (id: string) => {
    setExamSchedules(prev => prev.filter(g => g.id !== id));
  };

  const toggleExamConfirmation = (id: string) => {
      setExamSchedules(prev => prev.map(g => {
          if (g.id === id) {
              const newStatus = !g.isConfirmed;
              if (newStatus) updateXP(50); // Bonus for confirming schedule
              return { ...g, isConfirmed: newStatus };
          }
          return g;
      }));
  };

  const addExamSubject = (subject: Omit<ExamSubject, 'id'>) => {
    if (!activeExamGroupId) return;
    
    setExamSchedules(prev => prev.map(group => {
      if (group.id === activeExamGroupId) {
        return {
          ...group,
          subjects: [...group.subjects, { id: Date.now().toString(), ...subject }]
        };
      }
      return group;
    }));
    
    setActiveExamGroupId(null);
  };

  const updateExamSubject = (groupId: string, subjectId: string, updates: Partial<ExamSubject>) => {
    setExamSchedules(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          subjects: group.subjects.map(sub => sub.id === subjectId ? { ...sub, ...updates } : sub)
        };
      }
      return group;
    }));
    setEditingExamSubject(null);
  };

  const deleteExamSubject = (groupId: string, subjectId: string) => {
    setExamSchedules(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          subjects: group.subjects.filter(s => s.id !== subjectId)
        };
      }
      return group;
    }));
  };

  // ... (Other handlers: Checklist, Routine, Budget, Resources) ...
  const addChecklistItem = (text: string) => setChecklist(prev => [{ id: Date.now().toString(), text, completed: false }, ...prev]);
  const toggleChecklistItem = (id: string) => setChecklist(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : undefined } : i));
  const editChecklistItem = (id: string, text: string) => setChecklist(prev => prev.map(i => i.id === id ? { ...i, text } : i));
  const deleteChecklistItem = (id: string) => setChecklist(prev => prev.filter(i => i.id !== id));
  const clearChecklist = () => setChecklist([]);
  
  const toggleRoutineItem = (id: string) => setRoutine(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : undefined } : i));
  const updateRoutineItem = (id: string, updates: Partial<DailyRoutineItem>) => setRoutine(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const addCustomHabit = (title: string, frequency: 'daily' | 'weekly' | 'monthly') => {
      const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
      setRoutine(prev => [...prev, { id: Date.now().toString(), title, type: 'custom', frequency, completed: false, color: colors[Math.floor(Math.random()*colors.length)] }]);
  };
  const deleteRoutineItem = (id: string) => setRoutine(prev => prev.filter(i => i.id !== id));
  const resetRoutine = () => setRoutine(prev => prev.map(i => ({ ...i, completed: false, completedAt: undefined })));

  const addTransaction = (amount: number, description: string) => setBudget(prev => ({ ...prev, transactions: [{ id: Date.now().toString(), amount, description, date: new Date().toISOString() }, ...prev.transactions] }));
  const resetBudget = () => setBudget(prev => ({ ...prev, transactions: [], lastReset: new Date().toISOString() }));
  const changeBudgetPeriod = (period: BudgetPeriod) => setBudget(prev => ({ ...prev, period, lastReset: new Date().toISOString() }));

  const addResource = (title: string, url: string, subject: string) => {
      setResources(prev => [{ id: Date.now().toString(), title, url: url.startsWith('http') ? url : `https://${url}`, subject, createdAt: new Date().toISOString() }, ...prev]);
      setIsResourceModalOpen(false);
  };
  const deleteResource = (id: string) => setResources(prev => prev.filter(r => r.id !== id));
  const reorderResources = (newOrder: ResourceLink[]) => setResources(newOrder);
  const handleInspirationXP = () => updateXP(5);

  const handleNavClick = (screen: Screen) => {
    playSound('click');
    if (currentScreen === screen) {
        const scrollId = screen === 'tasks' ? 'scroll-tasks' : screen === 'planner' ? 'scroll-planner' : screen === 'stats' ? 'scroll-stats' : 'scroll-settings';
        document.getElementById(scrollId)?.scrollTo({ top: 0, behavior: 'smooth' });
    } else setCurrentScreen(screen);
    setIsFabMenuOpen(false);
  };

  const allExamSubjects = examSchedules.flatMap(g => g.subjects);

  // Render Profile Screen (Settings)
  const renderSettingsScreen = () => {
      const age = userProfile?.dateOfBirth ? Math.floor((new Date().getTime() - new Date(userProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
      
      return (
          <div id="scroll-settings" className="h-full overflow-y-auto hide-scrollbar pb-32 p-6 space-y-8 animate-fade-in">
                <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="size-20 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden">
                    <img src={userProfile?.gender === 'female' ? FEMALE_ICON : MALE_ICON} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                    <h2 className="text-2xl font-black text-white truncate max-w-[180px]">{userProfile?.name}</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{userProfile?.joinedDate ? `Joined ${new Date(userProfile.joinedDate).toLocaleDateString()}` : 'New Student'}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowEditProfile(true)}
                    className="size-10 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">edit_square</span>
                </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Student Credentials</h3>
                    <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <span className="text-slate-500 text-xs font-bold shrink-0 mt-0.5">College</span>
                        <span className="text-white text-sm font-black text-right">{userProfile?.college}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                        <span className="text-slate-500 text-xs font-bold shrink-0 mt-0.5">Department</span>
                        <span className="text-white text-sm font-black text-right">{userProfile?.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">Year</span>
                        <span className="text-white text-sm font-black">{userProfile?.year}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-slate-400 text-xs font-bold">Gender & Age</span>
                        <span className="text-slate-500 text-sm font-bold capitalize flex items-center gap-1">
                            {userProfile?.gender === 'male' ? (
                                <span className="material-symbols-outlined text-blue-400 text-sm">male</span>
                            ) : (
                                <span className="material-symbols-outlined text-pink-400 text-sm">female</span>
                            )}
                            {userProfile?.gender}, {age} Years
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">Date of Birth</span>
                        <span className="text-white text-sm font-black">{userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    </div>
                </div>
                
                {userProfile?.timetableImageUrl && (
                  <div className="p-5 rounded-3xl bg-teal-500/10 border border-teal-500/20 space-y-3">
                      <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-teal-400">image</span>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-400">Official Timetable Linked</h3>
                      </div>
                      <a href={userProfile.timetableImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-300 underline break-all line-clamp-1">
                          {userProfile.timetableImageUrl}
                      </a>
                  </div>
                )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Connect</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <a href="https://www.instagram.com/cosmiccorp.in?igsh=MW14dnI2ejN3bDdteg==" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-[#1e2a36] border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                      <div className="size-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                      </div>
                      <span className="font-bold text-white">Instagram</span>
                    </a>
                    <a href="https://t.me/cosmic_campus" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-[#1e2a36] border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                      <div className="size-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701-.332 4.965c.488 0 .704-.223.977-.485l2.347-2.283 4.88 3.604c.899.496 1.542.241 1.766-.83l3.2-15.059c.328-1.315-.502-1.912-1.361-1.524z" /></svg>
                      </div>
                      <span className="font-bold text-white">Telegram</span>
                    </a>
                    <a href="https://youtube.com/@cosmic.campus?si=xhu4FKGIzN-P_SH8" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-[#1e2a36] border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                      <div className="size-10 rounded-full bg-[#ff0000] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                      </div>
                      <span className="font-bold text-white">YouTube</span>
                    </a>
                  </div>
                </div>

                <div className="text-center pt-8 pb-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cosmic Campus v1.0.0</p>
                  <p className="text-[9px] text-slate-700 mt-1">© 2026 Cosmic Campus</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => setShowLegal('terms')} className="text-[9px] font-bold text-slate-600 hover:text-white transition-colors">Terms of Service</button>
                    <span className="text-slate-800">•</span>
                    <button onClick={() => setShowLegal('privacy')} className="text-[9px] font-bold text-slate-600 hover:text-white transition-colors">Privacy Policy</button>
                  </div>
                </div>
          </div>
      );
  };

  return (
    <div className="flex h-screen w-screen flex-col mesh-gradient overflow-hidden relative font-display text-white">
      {/* Milestone Modals (Moved to top for absolute priority) */}
      {showLevelTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setShowLevelTable(false)}>
            <div className="w-full max-w-sm bg-[#111c26] rounded-[40px] border border-white/10 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div><h2 className="text-xl font-black text-white">XP Roadmap</h2><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Levels 0 - 100</p></div>
                    <button onClick={() => setShowLevelTable(false)} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
                    {Array.from({ length: 101 }).map((_, i) => {
                        const lvl = i;
                        const xp = lvl * 1000;
                        const isCurrent = (userProfile?.level || 0) === lvl;
                        return (
                            <div key={lvl} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isCurrent ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-xl flex items-center justify-center font-black text-xs ${isCurrent ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}>{lvl}</div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-tight ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{getLevelTitle(lvl)}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{lvl === 0 ? 'Starter' : `${xp.toLocaleString()} Total XP`}</p>
                                    </div>
                                </div>
                                {isCurrent && <span className="material-symbols-outlined text-primary text-sm">stars</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {viewingMilestone && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setViewingMilestone(null)}>
              <div 
                className={`w-full max-w-sm rounded-[40px] border shadow-2xl p-8 relative overflow-hidden animate-zoom-in ${viewingMilestone.style.bg.replace('/10', '/20').replace('/60', '/80').replace('bg-gradient-to-br', 'bg-[#1a1a2e]')} ${viewingMilestone.style.border}`}
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="absolute -top-20 -right-20 size-60 bg-white/5 blur-[100px] rounded-full"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`size-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border-2 ${viewingMilestone.style.bg.replace('/10', '').replace('/60', '')} ${viewingMilestone.style.border}`}>
                          <span className="material-symbols-outlined text-5xl text-white">{viewingMilestone.icon}</span>
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{viewingMilestone.name}</h2>
                      <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border ${viewingMilestone.style.text} ${viewingMilestone.style.border.replace('/30', '/20').replace('/50', '/30')}`}>
                          {viewingMilestone.type} Milestone
                      </div>
                      <p className="text-slate-300 font-bold text-sm leading-relaxed mb-8">
                          {viewingMilestone.description}
                      </p>
                      <button 
                        onClick={() => setViewingMilestone(null)}
                        className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
                      >
                        Close Details
                      </button>
                  </div>
              </div>
          </div>
      )}

      {claimingMilestone && (
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-fade-in">
              <div className="relative">
                  <div className={`size-40 rounded-[40px] flex items-center justify-center border-4 animate-pulse-slow ${claimingMilestone.style.bg.replace('/10', '').replace('/60', '')} ${claimingMilestone.style.border}`}>
                      <span className="material-symbols-outlined text-7xl text-white animate-bounce">emoji_events</span>
                  </div>
                  <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-black text-white mt-12 text-center uppercase tracking-tighter">Claiming Milestone...</h2>
              <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Synchronizing with Cosmic Network</p>
          </div>
      )}

      {showClaimSuccess && (
          <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-6" onClick={() => setShowClaimSuccess(null)}>
              <div className="w-full max-w-sm relative animate-zoom-in pointer-events-auto" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 bg-primary/30 blur-[120px] rounded-full"></div>
                  <div className={`relative bg-[#0c1219] rounded-[48px] border-2 p-10 flex flex-col items-center text-center overflow-hidden ${showClaimSuccess.style.border}`}>
                      <div className={`absolute inset-0 opacity-10 ${showClaimSuccess.style.bg}`}></div>
                      <div className={`size-28 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl border-2 animate-bounce-slow ${showClaimSuccess.style.bg.replace('/10', '').replace('/60', '')} ${showClaimSuccess.style.border}`}>
                          <span className="material-symbols-outlined text-6xl text-white">{showClaimSuccess.icon}</span>
                      </div>
                      <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4">New Milestone Obtained</p>
                      <h2 className="text-4xl font-black text-white mb-4 leading-none uppercase tracking-tighter">{showClaimSuccess.name}</h2>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>
                      <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10">
                          Congratulations! You've successfully unlocked and claimed this cosmic milestone. Your journey continues.
                      </p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowClaimSuccess(null); }}
                        className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-50"
                      >
                        Continue Journey
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        {currentScreen === 'tasks' && (
            <div id="scroll-tasks" className="h-full overflow-y-auto hide-scrollbar pb-32 animate-fade-in">
                <TasksScreen 
                    userProfile={userProfile} tasks={tasks} events={events} classes={classes}
                    onToggle={toggleTask} onDeleteTask={deleteTask} onEditTask={setEditingTask}
                    onDeleteEvent={deleteEvent} onEditEvent={setEditingEvent} onOpenAddEvent={() => setIsEventModalOpen(true)}
                    checklist={checklist} onAddChecklistItem={addChecklistItem} onToggleChecklistItem={toggleChecklistItem}
                    onEditChecklistItem={editChecklistItem} onDeleteChecklistItem={deleteChecklistItem} onClearChecklist={clearChecklist}
                    routine={routine} onToggleRoutineItem={toggleRoutineItem} onUpdateRoutineItem={updateRoutineItem}
                    onAddCustomHabit={addCustomHabit} onDeleteRoutineItem={deleteRoutineItem} onClearRoutine={resetRoutine}
                    onGetInspiration={handleInspirationXP} resources={resources} onOpenAddResource={() => setIsResourceModalOpen(true)}
                    onDeleteResource={deleteResource} onReorderResources={reorderResources} budget={budget}
                    onAddTransaction={addTransaction} onResetBudget={resetBudget} onChangeBudgetPeriod={changeBudgetPeriod}
                    focusState={focusState} onOpenFocus={() => setShowFocusModal(true)}
                />
            </div>
        )}
        {currentScreen === 'planner' && (
            <TimetableScreen 
                key="planner"
                classes={classes} 
                examSchedules={examSchedules}
                userProfile={userProfile}
                onOpenAddClass={() => setIsClassModalOpen(true)}
                onOpenAddExamGroup={() => setIsAddExamGroupModalOpen(true)}
                onOpenAddSubject={(groupId) => setActiveExamGroupId(groupId)}
                onUpdateNotes={updateClassNotes}
                onEditClass={setEditingClass}
                onDeleteClass={deleteClass}
                onEditSubject={(groupId, subject) => setEditingExamSubject({ groupId, subject })}
                onDeleteSubject={deleteExamSubject}
                onDeleteExamGroup={deleteExamGroup}
                onToggleConfirmGroup={toggleExamConfirmation}
                onEditExamGroup={setEditingExamGroup}
            />
        )}
        {currentScreen === 'stats' && (
            <div id="scroll-stats" className="h-full overflow-y-auto hide-scrollbar pb-32 animate-fade-in">
                <ProgressScreen 
                  tasks={tasks} 
                  userProfile={userProfile} 
                  classes={classes} 
                  events={events} 
                  checklist={checklist} 
                  routine={routine} 
                  budget={budget} 
                  focusState={focusState} 
                  examSchedules={examSchedules}
                  claimedMilestones={claimedMilestones}
                  onClaimMilestone={claimMilestone}
                  viewingMilestone={viewingMilestone}
                  setViewingMilestone={setViewingMilestone}
                  claimingMilestone={claimingMilestone}
                  setClaimingMilestone={setClaimingMilestone}
                  showClaimSuccess={showClaimSuccess}
                  setShowClaimSuccess={setShowClaimSuccess}
                  showLevelTable={showLevelTable}
                  setShowLevelTable={setShowLevelTable}
                />
            </div>
        )}
        {currentScreen === 'settings' && renderSettingsScreen()}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        <AnimatePresence>
          {isFabMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFabMenuOpen(false)}
                className="fixed inset-0 bg-transparent z-[-1]"
              />
              
              {/* Menu Items */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col items-center gap-3 mb-6"
              >
                {[
                  { 
                    label: 'Focus Mode', 
                    icon: 'self_improvement', 
                    color: 'bg-[#00bcd4]', 
                    onClick: () => { playSound('focusPlus'); setShowFocusModal(true); setIsFabMenuOpen(false); } 
                  },
                  { 
                    label: 'Schedule Class', 
                    icon: 'school', 
                    color: 'bg-[#7b61ff]', 
                    onClick: () => { playSound('focusPlus'); setIsClassModalOpen(true); setIsFabMenuOpen(false); } 
                  },
                  { 
                    label: 'Create Task', 
                    icon: 'task_alt', 
                    color: 'bg-[#0d7ff2]', 
                    onClick: () => { playSound('click'); setIsTaskModalOpen(true); setIsFabMenuOpen(false); } 
                  }
                ].map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
                    onClick={item.onClick}
                    className="flex items-center gap-4 pl-6 pr-2 py-2 rounded-[2rem] bg-[#222831] shadow-xl hover:bg-[#2a323d] active:scale-95 transition-all w-64 justify-between"
                  >
                    <span className="text-xs font-black text-white uppercase tracking-widest leading-tight text-left">{item.label}</span>
                    <div className={`size-12 rounded-full ${item.color} flex items-center justify-center text-white shrink-0`}>
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.button 
          onClick={() => { playSound('click'); setIsFabMenuOpen(!isFabMenuOpen); }} 
          animate={{ rotate: isFabMenuOpen ? 45 : 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex size-16 items-center justify-center rounded-full text-white shadow-lg relative overflow-hidden transition-colors duration-300 ${isFabMenuOpen ? 'bg-red-500 shadow-red-500/40' : 'bg-primary shadow-primary/40'}`}
        >
          <span className="material-symbols-outlined text-4xl relative z-10">add</span>
        </motion.button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 grid grid-cols-5 items-center px-2 z-40">
        {[
          { id: 'tasks', label: 'Home', icon: 'home' },
          { id: 'planner', label: 'Planner', icon: 'calendar_today' },
          { id: 'spacer', label: '', icon: '' },
          { id: 'stats', label: 'Stats', icon: 'analytics' },
          { id: 'settings', label: 'Profile', icon: 'person' },
        ].map((item) => (
          item.id === 'spacer' ? <div key="spacer" /> : (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick(item.id as Screen)}
              className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === item.id ? 'text-primary' : 'text-[#9cabba]'}`}
            >
              <span className={`material-symbols-outlined ${currentScreen === item.id ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
              {currentScreen === item.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 size-1 rounded-full bg-primary"
                />
              )}
            </motion.button>
          )
        ))}
      </nav>

      {/* Modals */}
      {showFocusModal && <FocusModal focusState={focusState} onStart={startFocusSession} onPause={pauseFocusSession} onResume={resumeFocusSession} onStop={() => { stopFocusSession(); setShowFocusModal(false); }} onClose={() => setShowFocusModal(false)} />}
      
      {showOnboarding && <OnboardingScreen onComplete={(profile) => { setUserProfile(profile); setShowOnboarding(false); }} onClose={() => setShowOnboarding(false)} onShowLegal={(type) => setShowLegal(type)} />}
      {showEditProfile && userProfile && <ProfileEditModal currentProfile={userProfile} onClose={() => setShowEditProfile(false)} onUpdate={(updates) => { setUserProfile(prev => prev ? { ...prev, ...updates } : null); setShowEditProfile(false); }} />}
      {showLegal && (
        <div className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-xl p-6 flex flex-col animate-fade-in items-center justify-center">
           <div className="w-full max-w-sm bg-[#111c26] rounded-3xl p-6 border border-white/10 relative">
               <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-white">{showLegal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2>
                   <button onClick={() => setShowLegal(null)} className="size-8 rounded-full bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-slate-400">close</span></button>
               </div>
               <div className="text-slate-400 text-sm space-y-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                   {showLegal === 'terms' ? (
                       <>
                           <p className="font-bold text-white mb-2">COSMIC CAMPUS – TERMS OF SERVICE</p>
                           <p className="text-xs text-slate-500 mb-4">Last Updated: 23-02-2026</p>
                           <p>Welcome to Cosmic Campus (“App”, “we”, “our”, or “us”). By using this application, you agree to the following Terms of Service. If you do not agree, please do not use the app.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">1. Use of the App</p>
                           <p>Cosmic Campus is a free educational application designed to help students manage and organize academic-related information. You agree to use the app only for lawful and educational purposes. You must not misuse, modify, reverse engineer, or attempt to disrupt the functionality of the application.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">2. User Data Storage</p>
                           <p>Cosmic Campus does not require online account registration. All user information entered into the app is stored locally on your device. We do not operate servers to store or process your personal information.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">3. Intellectual Property</p>
                           <p>All app content including design, layout, name, branding, and software structure belongs to Cosmic Campus and is protected by applicable intellectual property laws. You may not copy, distribute, or reuse any part of the application without permission.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">4. No Warranties</p>
                           <p>Cosmic Campus is provided “as is” without warranties of any kind. While we aim to provide a reliable experience, we do not guarantee that the app will be error-free or uninterrupted.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">5. Limitation of Liability</p>
                           <p>Since all data is stored locally on your device, you are responsible for maintaining your device security and backups. We are not responsible for data loss caused by device damage, deletion, or technical issues.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">6. Termination</p>
                           <p>We reserve the right to update, modify, or discontinue the app at any time without prior notice.</p>
                       </>
                   ) : (
                       <>
                           <p className="font-bold text-white mb-2">COSMIC CAMPUS – PRIVACY POLICY</p>
                           <p className="text-xs text-slate-500 mb-4">Last Updated: 23-02-2026</p>
                           <p>Cosmic Campus respects your privacy. This Privacy Policy explains how information is handled within the application.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">1. Information Stored</p>
                           <p>Cosmic Campus does not collect, transmit, or store user data on external servers. All information entered into the app is stored locally on your device only. This may include name, gender, age, college, and department.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">2. No Data Collection</p>
                           <p>We do not collect IP addresses, browsing activity, device information, analytics data, or usage tracking information. The app operates completely offline and does not transmit personal data to us.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">3. Data Sharing</p>
                           <p>We do not sell, share, or transfer your personal information to any third parties because we do not collect or store it externally.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">4. Data Security</p>
                           <p>Since all information is stored locally on your device, you are responsible for maintaining your device security. We recommend using device-level security such as passwords or biometric protection.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">5. Children’s Privacy</p>
                           <p>Cosmic Campus does not knowingly collect personal information from children online. All data remains on the user’s own device.</p>
                           
                           <p className="text-[10px] uppercase font-bold text-slate-600 mt-4">6. Changes to This Policy</p>
                           <p>We may update this Privacy Policy in the future. Continued use of the app after changes indicates acceptance of the updated policy.</p>
                       </>
                   )}
               </div>
           </div>
        </div>
      )}
      
      {isTaskModalOpen && <AddTaskModal onClose={() => setIsTaskModalOpen(false)} onAdd={addTask} />}
      {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} onUpdate={updateTask} />}
      {editingEvent && <AddEventModal initialEvent={editingEvent} onClose={() => setEditingEvent(null)} onAdd={(...args) => { const [title, date, startTime, endTime, location, description, icon] = args; updateEvent(editingEvent.id, { title, date, startTime, endTime, location, description, icon }); }} existingEvents={events} existingClasses={classes} />}
      {isClassModalOpen && <AddClassModal onClose={() => setIsClassModalOpen(false)} onAdd={addClass} existingClasses={classes} />}
      {editingClass && <EditClassModal classSession={editingClass} onClose={() => setEditingClass(null)} onUpdate={updateClass} existingClasses={classes} />}
      {isEventModalOpen && <AddEventModal onClose={() => setIsEventModalOpen(false)} onAdd={handleAddEventFull} existingEvents={events} existingClasses={classes} />}
      {isResourceModalOpen && <AddResourceModal onClose={() => setIsResourceModalOpen(false)} onAdd={addResource} />}
      
      {/* Exam Modals */}
      {isAddExamGroupModalOpen && <AddExamGroupModal onClose={() => setIsAddExamGroupModalOpen(false)} onAdd={addExamGroup} />}
      {editingExamGroup && <AddExamGroupModal initialTitle={editingExamGroup.title} onClose={() => setEditingExamGroup(null)} onAdd={(title) => updateExamGroup(editingExamGroup.id, title)} isEditing={true} />}
      {activeExamGroupId && <ExamModal onClose={() => setActiveExamGroupId(null)} onAdd={addExamSubject} existingExams={allExamSubjects} />}
      {editingExamSubject && <ExamModal initialExam={editingExamSubject.subject} onClose={() => setEditingExamSubject(null)} onAdd={(subject) => updateExamSubject(editingExamSubject.groupId, editingExamSubject.subject.id, subject)} existingExams={allExamSubjects} />}
    
      {celebrationLevel !== null && (
        <LevelUpCelebration 
          level={celebrationLevel} 
          onClose={() => setCelebrationLevel(null)} 
        />
      )}
    </div>
  );
};

const OnboardingScreen: React.FC<{ onComplete: (profile: UserProfile) => void, onClose: () => void, onShowLegal: (type: 'terms' | 'privacy') => void }> = ({ onComplete, onShowLegal }) => {
  const [step, setStep] = useState<'form' | 'card'>('form');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dob, setDob] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const diff = Date.now() - new Date(dateOfBirth).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleGenerateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && college && department && year && dob) {
      setStep('card');
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
        onComplete({
            name,
            college,
            department,
            year,
            gender,
            dateOfBirth: dob,
            joinedDate: new Date().toISOString(),
            xp: 100, // Earn 100 XP as requested
            level: 0,
            timetableImageUrl: ''
        });
    }, 1500);
  };

  const YEAR_OPTIONS = [
      'First Year', 'Second Year', 'Third Year', 'Fourth Year', 
      'Graduate', 'Post Graduate', 'Alumni'
  ];

  return (
    <div className="fixed inset-0 z-[1000] bg-[#090e14] overflow-y-auto hide-scrollbar">
      {/* Launch Overlay */}
      {isLaunching && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black pointer-events-none">
              <div className="absolute inset-0 bg-white animate-launch-flash"></div>
              <div className="relative z-10 text-center animate-bounce">
                  <div className="text-6xl mb-4">🚀</div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Launching Cosmic Campus...</h2>
              </div>
          </div>
      )}

      {/* Dynamic Starry Background */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 size-1 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
          <div className="absolute top-3/4 right-1/4 size-1.5 bg-blue-300 rounded-full animate-pulse shadow-[0_0_15px_cyan]" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-3/4 size-1 bg-purple-300 rounded-full animate-pulse shadow-[0_0_8px_purple]" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-10 left-10 size-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-10 right-20 size-2 bg-yellow-100 rounded-full animate-pulse shadow-[0_0_12px_gold]" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#101922]/50 to-[#101922] z-0"></div>
      </div>

      <div className={`min-h-full flex flex-col items-center justify-center p-6 py-10 relative z-10 transition-all duration-700 ${isLaunching ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="w-full max-w-md space-y-8">
            {step === 'form' ? (
                <>
                    <div className="text-center space-y-2">
                        <div className="size-20 rounded-full bg-gradient-to-br from-primary/30 to-purple-600/30 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(13,127,242,0.4)] relative">
                            <span className="material-symbols-outlined text-4xl text-white">person_add</span>
                            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20"></div>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Cosmic Profile</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Enter your details to begin</p>
                    </div>

                    <form onSubmit={handleGenerateIdentity} className="space-y-4">
                        <div className="space-y-4 bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-sm">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" placeholder="Alex Voyager" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">College Name</label>
                                <input type="text" value={college} onChange={e => setCollege(e.target.value)} maxLength={50} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" placeholder="Stellar University" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Dept</label>
                                    <input type="text" value={department} onChange={e => setDepartment(e.target.value)} maxLength={40} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" placeholder="CSE" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Year</label>
                                    <select value={year} onChange={e => setYear(e.target.value)} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all appearance-none" required>
                                        <option value="" disabled>Select</option>
                                        {YEAR_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setGender('male')} 
                                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                                            gender === 'male' 
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                                            : 'bg-transparent border-white/5 text-slate-500 hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">male</span> Male
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setGender('female')} 
                                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                                            gender === 'female' 
                                            ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]' 
                                            : 'bg-transparent border-white/5 text-slate-500 hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">female</span> Female
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date of Birth</label>
                                <input 
                                    type="date" 
                                    value={dob} 
                                    onChange={e => setDob(e.target.value)} 
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" 
                                    required 
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div className="flex items-center gap-3 px-2 py-2">
                                <input 
                                    type="checkbox" 
                                    id="agree" 
                                    checked={agreed} 
                                    onChange={e => setAgreed(e.target.checked)}
                                    className="size-5 rounded border-white/10 bg-[#1e2a36] text-primary focus:ring-primary"
                                />
                                <label htmlFor="agree" className="text-[11px] font-bold text-slate-400">
                                    I agree to the <button type="button" onClick={() => onShowLegal('terms')} className="text-primary hover:underline">Terms of Service</button> and <button type="button" onClick={() => onShowLegal('privacy')} className="text-primary hover:underline">Privacy Policy</button>
                                </label>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={!agreed}
                            className={`w-full py-5 rounded-2xl border border-white/10 text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${agreed ? 'bg-[#1e2a36] hover:bg-white/5 active:scale-98' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}
                        >
                            Generate Identity
                            <span className="material-symbols-outlined text-lg">badge</span>
                        </button>
                    </form>
                </>
            ) : (
                <div className="animate-zoom-in space-y-6">
                    {/* Identity Card */}
                    <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#1a2530] to-[#0f151b] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center group">
                        
                        {/* Edit Button */}
                        <button 
                            onClick={() => setStep('form')}
                            className="absolute top-6 right-6 size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20 group/edit"
                            title="Edit Details"
                        >
                            <span className="material-symbols-outlined text-lg group-hover/edit:rotate-12 transition-transform">edit</span>
                        </button>

                        {/* Holographic Overlay Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"></div>
                        <div className="absolute -top-20 -right-20 size-60 bg-primary/20 rounded-full blur-[80px]"></div>
                        <div className="absolute -bottom-20 -left-20 size-60 bg-purple-500/20 rounded-full blur-[80px]"></div>

                        <div className="relative z-10 size-24 rounded-full border-4 border-white/10 shadow-xl overflow-hidden mb-4">
                            <img src={gender === 'female' ? FEMALE_ICON : MALE_ICON} alt="Profile" className="w-full h-full object-cover" />
                        </div>

                        <h2 className="relative z-10 text-2xl font-black text-white leading-tight uppercase tracking-tight">{name}</h2>
                        <p className="relative z-10 text-xs font-bold text-primary uppercase tracking-widest mt-1 mb-6">{department} • {year}</p>

                        <div className="relative z-10 w-full grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Age</p>
                                <p className="text-lg font-bold text-white">{calculateAge(dob)}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Gender</p>
                                <p className="text-lg font-bold text-white capitalize flex items-center justify-center gap-1">
                                    {gender === 'male' ? <span className="material-symbols-outlined text-sm">male</span> : <span className="material-symbols-outlined text-sm">female</span>}
                                    {gender}
                                </p>
                            </div>
                        </div>
                        
                        <div className="relative z-10 w-full mb-6">
                             <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-between">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">DOB</p>
                                <p className="text-sm font-bold text-white">{new Date(dob).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="relative z-10 w-full p-4 rounded-2xl bg-[#101922] border border-white/10 text-left">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">College</p>
                            <p className="text-sm font-bold text-white truncate">{college}</p>
                        </div>

                        <div className="mt-auto relative z-10 pt-4">
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Cosmic Campus ID</span>
                        </div>
                    </div>

                    {/* Launch Button */}
                    <div className="space-y-3">
                        <button 
                            onClick={handleLaunch} 
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black text-base uppercase tracking-widest shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_50px_rgba(236,72,153,0.8)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                            <span className="relative z-10">Launch Journey</span>
                            <span className="material-symbols-outlined relative z-10 group-hover:translate-x-2 transition-transform">rocket_launch</span>
                        </button>
                        <div className="flex items-center justify-center gap-2 text-yellow-400">
                            <span className="material-symbols-outlined text-sm">stars</span>
                            <p className="text-[10px] font-black uppercase tracking-wide">Earn 100 XP for completing your profile</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
      <style>{`
        @keyframes launchFlash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-launch-flash {
          animation: launchFlash 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const ProfileEditModal: React.FC<{ currentProfile: UserProfile, onClose: () => void, onUpdate: (updates: Partial<UserProfile>) => void }> = ({ currentProfile, onClose, onUpdate }) => {
  const [name, setName] = useState(currentProfile.name);
  const [college, setCollege] = useState(currentProfile.college);
  const [department, setDepartment] = useState(currentProfile.department);
  const [year, setYear] = useState(currentProfile.year);
  const [gender, setGender] = useState(currentProfile.gender);
  const [dob, setDob] = useState(currentProfile.dateOfBirth || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ name, college, department, year, gender, dateOfBirth: dob });
  };

  const YEAR_OPTIONS = [
      'First Year', 'Second Year', 'Third Year', 'Fourth Year', 
      'Graduate', 'Post Graduate', 'Alumni'
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto" onClick={onClose}>
        <div className="w-full max-w-sm bg-[#111c26] rounded-[40px] p-8 border border-white/10 shadow-2xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">Edit Profile</h2>
                <button onClick={onClose} className="size-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"><span className="material-symbols-outlined text-slate-400">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">College</label>
                    <input type="text" value={college} onChange={e => setCollege(e.target.value)} maxLength={50} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Dept</label>
                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} maxLength={40} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Year</label>
                        <select value={year} onChange={e => setYear(e.target.value)} className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all appearance-none">
                            {YEAR_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setGender('male')} 
                            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase border flex items-center justify-center gap-2 ${
                                gender === 'male' 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                                : 'border-white/5 text-slate-500 hover:bg-white/5'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">male</span> Male
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setGender('female')} 
                            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase border flex items-center justify-center gap-2 ${
                                gender === 'female' 
                                ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]' 
                                : 'border-white/5 text-slate-500 hover:bg-white/5'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">female</span> Female
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date of Birth</label>
                    <input 
                        type="date" 
                        value={dob} 
                        onChange={e => setDob(e.target.value)} 
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" 
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
                
                <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 mt-2">Save Changes</button>
            </form>
        </div>
    </div>
  );
};

export default App;
