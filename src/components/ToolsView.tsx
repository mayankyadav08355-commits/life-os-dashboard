/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  Calendar, 
  Smile, 
  BedDouble, 
  FileText, 
  Trash2, 
  CheckCircle,
  Timer,
  Moon,
  Volume2,
  Trash
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types';

interface ToolsViewProps {
  journals: JournalEntry[];
  onUpdateJournals: (journals: JournalEntry[]) => void;
  soundEnabled: boolean;
}

export default function ToolsView({ journals, onUpdateJournals, soundEnabled }: ToolsViewProps) {
  // --- POMODORO TIMER CORE STATES ---
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes standard work
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const workTimeVal = 25 * 60;
  const breakTimeVal = 5 * 60;

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerMode]);

  const handleTimerCompleted = () => {
    setTimerRunning(false);
    if (soundEnabled) {
      // Synthesize elegant double high chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        [0, 0.2].forEach(delay => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + delay); // A5 chime
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.35);
          osc.start(audioCtx.currentTime + delay);
          osc.stop(audioCtx.currentTime + delay + 0.35);
        });
      } catch (e) {
        console.warn(e);
      }
    }
    
    alert(timerMode === 'work' ? "Focus session complete! Time for a short break." : "Break over! Time to focus again.");
    
    const nextMode = timerMode === 'work' ? 'break' : 'work';
    setTimerMode(nextMode);
    setTimeLeft(nextMode === 'work' ? workTimeVal : breakTimeVal);
  };

  const handleToggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerMode === 'work' ? workTimeVal : breakTimeVal);
  };

  const handleModeChange = (mode: 'work' | 'break') => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimeLeft(mode === 'work' ? workTimeVal : breakTimeVal);
  };

  const formatTimerStr = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // --- JOURNALING & MOOD CORE STATES ---
  const todayStr = new Date().toISOString().split('T')[0];
  const [journalInput, setJournalInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [mood, setMood] = useState<MoodType>('focused');
  const [sleep, setSleep] = useState(7.5);

  const moodEmojis: Record<MoodType, { emoji: string; label: string; color: string }> = {
    focused: { emoji: '🎯', label: 'Focused', color: 'bg-indigo-50 border-indigo-250 text-indigo-700' },
    calm: { emoji: '🧘', label: 'Calm', color: 'bg-emerald-50 border-emerald-250 text-emerald-700' },
    spiritual: { emoji: '🌸', label: 'Spiritual', color: 'bg-amber-50 border-amber-250 text-amber-700' },
    energetic: { emoji: '⚡', label: 'Energetic', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    tired: { emoji: '😴', label: 'Tired', color: 'bg-slate-100 border-slate-200 text-slate-700' },
    stressed: { emoji: '🌋', label: 'Stressed', color: 'bg-rose-50 border-rose-200 text-rose-700' },
    neutral: { emoji: '😐', label: 'Neutral', color: 'bg-slate-50 border-slate-200 text-slate-700' }
  };

  const activeJournalDay = journals.find(j => j.date === selectedDate);

  // Load existing entry parameters if date changes
  useEffect(() => {
    if (activeJournalDay) {
      setJournalInput(activeJournalDay.content);
      setMood(activeJournalDay.mood);
      setSleep(activeJournalDay.sleepHours);
    } else {
      setJournalInput('');
      setMood('focused');
      setSleep(7.5);
    }
  }, [selectedDate, journals]);

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: JournalEntry = {
      id: activeJournalDay?.id || Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      content: journalInput.trim(),
      mood,
      waterCups: 6, // default, synchronized via state elsewhere
      sleepHours: sleep
    };

    const existingIdx = journals.findIndex(j => j.date === selectedDate);
    let updated = [...journals];
    if (existingIdx >= 0) {
      updated[existingIdx] = newEntry;
    } else {
      updated.push(newEntry);
    }

    onUpdateJournals(updated);
    alert('Journal entry and mood matrix recorded successfully!');
  };

  const handleDeleteJournal = (id: string) => {
    if (window.confirm("Delete this journal day entry?")) {
      const updated = journals.filter(j => j.id !== id);
      onUpdateJournals(updated);
      setJournalInput('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6 animate-fade-in">

      {/* Grid: Left Column (40%) Pomodoro and Sleep, Right Column (60%) Journal and Mood */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: interactive Pomodoro & Tracker tools (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Pomodoro block */}
          <div id="pomodoro" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm text-center flex flex-col justify-between h-[340px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                <h2 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Timer className="w-4 h-4 text-indigo-650" />
                  Pomodoro Focus Station
                </h2>
                
                {/* Mode Select Buttons */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                  <button
                    id="pomo-mode-work"
                    onClick={() => handleModeChange('work')}
                    className={`text-[9px] font-black px-2 py-0.5 rounded uppercase leading-none ${
                      timerMode === 'work' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Focus
                  </button>
                  <button
                    id="pomo-mode-break"
                    onClick={() => handleModeChange('break')}
                    className={`text-[9px] font-black px-2 py-0.5 rounded uppercase leading-none ${
                      timerMode === 'break' 
                        ? 'bg-amber-500 text-white' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Break
                  </button>
                </div>
              </div>

              {/* Dynamic countdown visual progress */}
              <div className="relative w-36 h-36 mx-auto mt-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="5" fill="transparent"/>
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="62" 
                    stroke="currentColor" 
                    className={timerMode === 'work' ? 'text-indigo-600' : 'text-amber-500'}
                    strokeWidth="5" 
                    strokeDasharray={390}
                    strokeDashoffset={390 - (390 * timeLeft) / (timerMode === 'work' ? workTimeVal : breakTimeVal)}
                    strokeLinecap="round" 
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-3xl font-extrabold text-slate-850 dark:text-white font-mono tracking-tight">
                  {formatTimerStr(timeLeft)}
                </div>
              </div>
            </div>

            {/* Timer interactions */}
            <div className="flex justify-center items-center gap-3">
              <button
                id="pomo-play-btn"
                onClick={handleToggleTimer}
                className={`py-2 px-6 rounded-xl text-xs font-extrabold flex items-center gap-2 text-white shadow-xs transition-transform ${
                  timerRunning ? 'bg-amber-500 hover:bg-amber-400' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{timerRunning ? 'Pause Session' : 'Start Focus'}</span>
              </button>
              
              <button
                id="pomo-reset-btn"
                onClick={handleResetTimer}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 p-2.5 rounded-xl text-slate-500 hover:text-slate-850 border dark:border-slate-800 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sleep tracking slider */}
          <div id="sleep-station" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b pb-2 dark:border-slate-850">
              <BedDouble className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-350 tracking-wider">
                Daily Sleep Quality Log
              </h3>
            </div>
            
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border dark:border-slate-800/50">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Total Sleep Hours</span>
                <span className="font-bold text-indigo-600 font-mono">{sleep} hours</span>
              </div>
              <input
                id="sleep-hour-range"
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-2 cursor-pointer mt-1"
              />
              
              <div className="text-[10px] text-zinc-500 mt-2">
                Pacing Guide: 7.0 - 8.5 indicates optimum REST score.
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Diary entry & Mood check-in (7 cols) */}
        <div id="journal-and-mood" className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            
            {/* Upper Action block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 gap-4 border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <h2 className="font-bold text-slate-850 dark:text-white text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-650" />
                  Self-Evaluation Daily Journal
                </h2>
                <p className="text-xs text-slate-400">
                  Write down commitments, spiritual realizations, and achievements.
                </p>
              </div>

              {/* Custom date picker */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <input
                  id="journal-date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold border-none outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Mood selector checkboxes row */}
            <div className="space-y-2 mb-5">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-start">
                <Smile className="w-4 h-4 text-indigo-500" />
                Select Primary Vibrational Mood
              </span>
              
              <div className="flex flex-wrap gap-2">
                {(Object.keys(moodEmojis) as MoodType[]).map(key => {
                  const item = moodEmojis[key];
                  const isSelected = mood === key;
                  return (
                    <button
                      id={`mood-dial-${key}`}
                      key={key}
                      type="button"
                      onClick={() => setMood(key)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                        isSelected 
                          ? `${item.color} shadow-sm border-indigo-400 scale-102 font-bold` 
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-base leading-none">{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inherent entry editor */}
            <form onSubmit={handleSaveJournal} className="space-y-4">
              <textarea
                id="journal-canvas-input"
                rows={6}
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                placeholder="Declare today's spiritual realizations, what concepts you revised, or any struggles faced..."
                className="w-full text-xs p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-505 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Journal inputs are saved automatically in localStorage variables.
                </span>
                
                <div className="flex items-center gap-2">
                  {activeJournalDay && (
                    <button
                      id="delete-journal-entry-btn"
                      type="button"
                      onClick={() => handleDeleteJournal(activeJournalDay.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                      title="Delete today's journal"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    id="save-journal-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-600/15"
                  >
                    Commit Journal
                  </button>
                </div>
              </div>
            </form>

            {/* List entries helper */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-2">Previous Logs Saved ({journals.length})</h4>
              <div className="flex gap-2 max-w-full overflow-x-auto pb-2">
                {journals.map(j => (
                  <button
                    id={`saved-log-${j.date}`}
                    key={j.id}
                    onClick={() => setSelectedDate(j.date)}
                    className="text-[10px] font-mono shrink-0 px-2 py-1 border rounded-lg bg-slate-50 dark:bg-slate-950 hover:border-indigo-400 text-slate-600 dark:text-slate-400 font-semibold"
                  >
                    {new Date(j.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {moodEmojis[j.mood]?.emoji}
                  </button>
                ))}
                {journals.length === 0 && (
                  <span className="text-[10px] text-slate-400 italic">No historical journals cached yet. Write your first entry above.</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
