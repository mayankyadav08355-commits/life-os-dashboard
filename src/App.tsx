/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Check, 
  Info,
  Flame,
  Moon,
  Sun
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import RoutineView from './components/RoutineView';
import SkillsView from './components/SkillsView';
import WeeklyGoalsView from './components/WeeklyGoalsView';
import AnalyticsView from './components/AnalyticsView';
import ToolsView from './components/ToolsView';

import { AppState, RoutineItem, Skill, WeeklyGoal, JournalEntry } from './types';
import { getInitialRoutine, calculateDisciplineScore } from './utils/routineHelper';

// --- SEED SECTIONS ---
const INITIAL_SKILLS: Skill[] = [
  {
    id: 'coding',
    name: 'Coding & Projects',
    dailyLoggedMinutes: 45,
    dailyTargetMinutes: 120,
    weeklyTargetMinutes: 840,
    monthlyTargetMinutes: 3360,
    streak: 3,
    history: [
      { date: 'May 28', minutes: 90 },
      { date: 'May 29', minutes: 130 },
      { date: 'May 30', minutes: 120 },
      { date: 'May 31', minutes: 45 },
      { date: 'Jun 01', minutes: 75 },
      { date: 'Jun 02', minutes: 45 }
    ]
  },
  {
    id: 'communication',
    name: 'Communication',
    dailyLoggedMinutes: 15,
    dailyTargetMinutes: 30,
    weeklyTargetMinutes: 210,
    monthlyTargetMinutes: 840,
    streak: 2,
    history: [
      { date: 'May 28', minutes: 30 },
      { date: 'May 29', minutes: 20 },
      { date: 'May 30', minutes: 40 },
      { date: 'May 31', minutes: 15 },
      { date: 'Jun 01', minutes: 30 },
      { date: 'Jun 02', minutes: 15 }
    ]
  },
  {
    id: 'english',
    name: 'English Speaking Practice',
    dailyLoggedMinutes: 35,
    dailyTargetMinutes: 45,
    weeklyTargetMinutes: 315,
    monthlyTargetMinutes: 1260,
    streak: 4,
    history: [
      { date: 'May 28', minutes: 45 },
      { date: 'May 29', minutes: 50 },
      { date: 'May 30', minutes: 30 },
      { date: 'May 31', minutes: 60 },
      { date: 'Jun 01', minutes: 45 },
      { date: 'Jun 02', minutes: 35 }
    ]
  },
  {
    id: 'problem_solving',
    name: 'Problem Solving (Algo)',
    dailyLoggedMinutes: 30,
    dailyTargetMinutes: 60,
    weeklyTargetMinutes: 420,
    monthlyTargetMinutes: 1680,
    streak: 1,
    history: [
      { date: 'May 28', minutes: 60 },
      { date: 'May 29', minutes: 60 },
      { date: 'May 30', minutes: 0 },
      { date: 'May 31', minutes: 40 },
      { date: 'Jun 01', minutes: 45 },
      { date: 'Jun 02', minutes: 30 }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness & Gym Workouts',
    dailyLoggedMinutes: 90,
    dailyTargetMinutes: 90,
    weeklyTargetMinutes: 540,
    monthlyTargetMinutes: 2160,
    streak: 5,
    history: [
      { date: 'May 28', minutes: 90 },
      { date: 'May 29', minutes: 90 },
      { date: 'May 30', minutes: 0 },
      { date: 'May 31', minutes: 90 },
      { date: 'Jun 01', minutes: 90 },
      { date: 'Jun 02', minutes: 90 }
    ]
  }
];

const INITIAL_GOALS: WeeklyGoal[] = [
  {
    id: 'g1',
    title: 'Complete Laravel Authentication Integration',
    completed: false,
    deadline: '2026-06-07',
    progress: 75,
    category: 'Career'
  },
  {
    id: 'g2',
    title: 'Practice English speaking with study partner for 5 hours',
    completed: false,
    deadline: '2026-06-07',
    progress: 40,
    category: 'Study'
  },
  {
    id: 'g3',
    title: 'Finish one responsive coding project',
    completed: true,
    deadline: '2026-06-05',
    progress: 100,
    category: 'Career'
  },
  {
    id: 'g4',
    title: 'Read one self-development or spiritual novel',
    completed: false,
    deadline: '2026-06-07',
    progress: 15,
    category: 'Relaxation'
  },
  {
    id: 'g5',
    title: 'Hit gym workouts exactly 6 days',
    completed: false,
    deadline: '2026-06-06',
    progress: 80,
    category: 'Fitness'
  }
];

const INITIAL_JOURNALS: JournalEntry[] = [
  {
    id: 'j1',
    date: '2026-06-01',
    content: "Woke up energized. Completed morning meditation blocks. Studied full stack coding blocks and went for revision in revision study hour.",
    mood: 'focused',
    waterCups: 8,
    sleepHours: 7.5
  },
  {
    id: 'j2',
    date: '2026-06-02',
    content: "Completed Naam Jap with deep concentration today. Gym session was focused - worked on chest pull movements. Coding required focus but successfully built backend paths.",
    mood: 'spiritual',
    waterCups: 9,
    sleepHours: 8.0
  }
];

// Mock Smart alert timeline triggers (helps simulate the interactive alarm alerts!)
const ADVISORY_TIMELINE = [
  { text: "Wake up time! Align your mind early with water and deep meditation.", delaySec: 15 },
  { text: "Gym routine starts now! Hydrate and track workout logs in focus panels.", delaySec: 45 },
  { text: "Spiritual routine has begun. Bath and Pooja Naam Jap block.", delaySec: 90 },
  { text: "Deep study session has started. Silent mode recommended.", delaySec: 160 },
  { text: "Caution: Stay focused on English Speaking conversations today.", delaySec: 240 }
];

interface NotificationAlert {
  id: string;
  text: string;
  timeStr: string;
  isRead: boolean;
  type: 'info' | 'alert' | 'success';
}

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'routine' | 'skills' | 'goals' | 'analytics' | 'tools'>('dashboard');
  
  // App-level state objects
  const [jobMode, setJobMode] = useState<boolean>(() => {
    return localStorage.getItem('lifeos_job_mode') === 'true';
  });

  const [routine, setRoutine] = useState<RoutineItem[]>(() => {
    const saved = localStorage.getItem('lifeos_routine_list');
    return saved ? JSON.parse(saved) : getInitialRoutine(jobMode);
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem('lifeos_skills_list');
    return saved ? JSON.parse(saved) : INITIAL_SKILLS;
  });

  const [goals, setGoals] = useState<WeeklyGoal[]>(() => {
    const saved = localStorage.getItem('lifeos_weekly_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('lifeos_journals');
    return saved ? JSON.parse(saved) : INITIAL_JOURNALS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('lifeos_sound_enabled') !== 'false';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('lifeos_theme') as 'light' | 'dark') || 'dark';
  });

  // Notifications Popover and Log
  const [notifications, setNotifications] = useState<NotificationAlert[]>([
    {
      id: 'init-1',
      text: 'Aura LifeOS booted. Tap notification log to review commitments.',
      timeStr: 'Just now',
      isRead: false,
      type: 'success'
    },
    {
      id: 'init-2',
      text: 'Welcome! Job Mode is currently ' + (jobMode ? 'on.' : 'off.'),
      timeStr: 'Just now',
      isRead: false,
      type: 'info'
    }
  ]);
  const [showNotificationTray, setShowNotificationTray] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('lifeos_routine_list', JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem('lifeos_skills_list', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('lifeos_weekly_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('lifeos_journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('lifeos_job_mode', jobMode.toString());
  }, [jobMode]);

  useEffect(() => {
    localStorage.setItem('lifeos_sound_enabled', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('lifeos_theme', theme);
    // Apply styling class to root document element
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle dynamic Schedule realignment when Job Mode flips
  const handleJobModeToggle = () => {
    const nextJobMode = !jobMode;
    setJobMode(nextJobMode);
    
    // Auto-migrate or confirm routine replacement
    if (window.confirm("Job Mode toggled. Align and shift routine slots? This will reset all current checkbox statuses to pending.")) {
      const aligned = getInitialRoutine(nextJobMode);
      setRoutine(aligned);
      
      // Feed notification
      dispatchNotification(`Routine reorganized under ${nextJobMode ? 'Job Mode' : 'Standard Day Schedule'}!`, 'info');
    }
  };

  // Helper dispatcher for notifications
  const dispatchNotification = (text: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const newAlert: NotificationAlert = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      timeStr: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
      isRead: false,
      type
    };
    
    setNotifications(prev => [newAlert, ...prev]);

    // Synthesize simple bell audio notification if sound is active
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5 Chime
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {
        console.warn("Chime context block", e);
      }
    }
  };

  // Simulate schedule alerts on timer interval (proactive notifications!)
  useEffect(() => {
    const activeAlerts: string[] = [];
    
    const handles = ADVISORY_TIMELINE.map(alertTask => {
      return setTimeout(() => {
        dispatchNotification(alertTask.text, 'info');
      }, alertTask.delaySec * 1000);
    });

    return () => {
      handles.forEach(clearTimeout);
    };
  }, []);

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotificationTray(false);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Derived core Discipline score based on today's checked-off routine
  const activeDisciplineScore = calculateDisciplineScore(routine);
  
  // Calculate unread alerts
  const unreadAlerts = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-150`}>
      
      {/* Sidebar Navigation Drawer */}
      <Sidebar 
        currentView={currentView}
        onViewChange={(v: any) => setCurrentView(v)}
        jobMode={jobMode}
        onJobModeToggle={handleJobModeToggle}
        disciplineScore={activeDisciplineScore}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Main Content Pane wrapper */}
      <main className="flex-1 flex flex-col justify-between relative overflow-y-auto min-h-screen">
        
        {/* Sub-header status bar with notification bell */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-35 select-none">
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
              Operational Focus: {currentView.replace('-', ' ')} view
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Quick alert indicator sound indicators */}
            <button 
              id="header-sound-indicator"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded text-slate-450 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              title={soundEnabled ? "Audio chimes active" : "Audio muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Smart Notification Indicator Popover Trigger */}
            <div className="relative">
              <button 
                id="notification-bell-btn"
                onClick={() => {
                  setShowNotificationTray(!showNotificationTray);
                  handleMarkNotificationsRead();
                }}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-850 dark:hover:text-white transition-all relative flex items-center justify-center"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] font-black font-mono text-white items-center justify-center leading-none">
                      {unreadAlerts}
                    </span>
                  </span>
                )}
              </button>

              {/* Floating Notifications drawer */}
              {showNotificationTray && (
                <div 
                  id="notifications-tray"
                  className="absolute right-0 mt-3 w-[290px] sm:w-[350px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 text-xs font-semibold text-slate-800 dark:text-zinc-200 space-y-3"
                >
                  <div className="flex items-center justify-between border-b pb-2.5 mb-2 dark:border-slate-800">
                    <span className="font-bold text-slate-850 dark:text-white flex items-center gap-1.5 text-xs">
                      <Bell className="w-4 h-4 text-indigo-650" />
                      Commitment Reminders Log
                    </span>
                    
                    <button 
                      id="clear-notifications-btn"
                      onClick={handleClearNotifications}
                      className="text-[10px] text-zinc-400 hover:text-rose-500"
                    >
                      Clear Log
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {notifications.map(alert => (
                      <div 
                        id={`alert-log-item-${alert.id}`}
                        key={alert.id} 
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          alert.type === 'success' 
                            ? 'bg-emerald-50/20 border-emerald-100 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-950/40' 
                            : alert.type === 'alert' 
                            ? 'bg-rose-50/20 border-rose-105 text-rose-800 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-950/40' 
                            : 'bg-indigo-50/20 border-indigo-100 text-slate-805 dark:bg-indigo-950/10 dark:text-indigo-400 dark:border-indigo-950/40'
                        }`}
                      >
                        <div className="mt-0.5 text-xs">
                          {alert.type === 'success' ? '🔔' : alert.type === 'alert' ? '⚠️' : '⏱️'}
                        </div>
                        <div className="space-y-0.5 leading-tight flex-1">
                          <p className="font-medium text-[11px] font-sans">{alert.text}</p>
                          <span className="text-[9px] text-slate-400 font-bold block">{alert.timeStr}</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-center py-6 text-[11px] text-slate-400 italic">No historical notification triggers logged.</p>
                    )}
                  </div>

                  {/* manual simulation triggers for demo/preview review! */}
                  <div className="pt-2.5 border-t dark:border-slate-800 flex gap-2 justify-between">
                    <button
                      id="simulate-routine-alarm"
                      onClick={() => dispatchNotification("Gym routine begins in 10 minutes!", "info")}
                      className="text-[9px] font-bold text-center bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-400 transition-colors flex-1"
                    >
                      ⏱ Simulate Gym Alarm
                    </button>
                    <button
                      id="simulate-routine-missed"
                      onClick={() => dispatchNotification("Warning: Study session was checked completed/missed.", "success")}
                      className="text-[9px] font-bold text-center bg-slate-105 dark:bg-slate-950 px-2 py-1 rounded hover:bg-emerald-50 hover:text-emerald-600 dark:text-zinc-405 transition-colors flex-1"
                    >
                      🔔 Check-in Notice
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Core Render router based on selected navigation pane */}
        <div id="view-renderer-container" className="flex-1">
          {currentView === 'dashboard' && (
            <DashboardView 
              state={{ routine, skills, weeklyGoals: goals, journals, jobMode, theme, reports: [] }}
              onUpdateRoutine={setRoutine}
              onNavigate={(v: any) => setCurrentView(v)}
              disciplineScore={activeDisciplineScore}
            />
          )}

          {currentView === 'routine' && (
            <RoutineView 
              routine={routine}
              onUpdateRoutine={setRoutine}
              jobMode={jobMode}
              onJobModeToggle={handleJobModeToggle}
              soundEnabled={soundEnabled}
            />
          )}

          {currentView === 'skills' && (
            <SkillsView 
              skills={skills}
              onUpdateSkills={setSkills}
            />
          )}

          {currentView === 'goals' && (
            <WeeklyGoalsView 
              goals={goals}
              onUpdateGoals={setGoals}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView 
              state={{ routine, skills, weeklyGoals: goals, journals, jobMode, theme, reports: [] }}
              disciplineScore={activeDisciplineScore}
            />
          )}

          {currentView === 'tools' && (
            <ToolsView 
              journals={journals}
              onUpdateJournals={setJournals}
              soundEnabled={soundEnabled}
            />
          )}
        </div>

        {/* Human-centered professional copyright footer */}
        <footer className="py-4 text-center border-t border-slate-200/50 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/30 text-[10px] text-slate-400 font-mono tracking-tight select-none mt-12">
          AURA LIFEOS OPERATING SYSTEMS • DISCIPLINE DRIVES PROGRESS • MADE BY HUMANS
        </footer>

      </main>

    </div>
  );
}
