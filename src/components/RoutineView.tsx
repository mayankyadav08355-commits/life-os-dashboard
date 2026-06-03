/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Award, 
  GlassWater, 
  Briefcase, 
  Sun,
  Moon, 
  Clock, 
  Activity 
} from 'lucide-react';
import { RoutineItem, CategoryType } from '../types';

interface RoutineViewProps {
  routine: RoutineItem[];
  onUpdateRoutine: (routine: RoutineItem[]) => void;
  jobMode: boolean;
  onJobModeToggle: () => void;
  soundEnabled: boolean;
}

export default function RoutineView({ 
  routine, 
  onUpdateRoutine, 
  jobMode, 
  onJobModeToggle,
  soundEnabled
}: RoutineViewProps) {
  const [filterActive, setFilterActive] = useState<'all' | 'pending' | 'completed' | 'missed'>('all');
  
  // Water tracker local persistent counter
  const [waterCups, setWaterCups] = useState<number>(() => {
    const saved = localStorage.getItem('lifeos_water_cups');
    return saved ? parseInt(saved) : 3;
  });

  const saveWaterCups = (cups: number) => {
    setWaterCups(cups);
    localStorage.setItem('lifeos_water_cups', cups.toString());
  };

  // Sound triggering mechanism (optional)
  const triggerSound = (type: 'success' | 'fail' | 'click') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'fail') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.25); // A2
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.12);
      }
    } catch (e) {
      console.warn("Audio Context blocked by client policies", e);
    }
  };

  const handleUpdateStatus = (itemId: string, status: 'completed' | 'missed' | 'pending') => {
    const timestamp = status === 'completed' 
      ? new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) 
      : undefined;

    const updated = routine.map(item => {
      if (item.id === itemId) {
        return { ...item, status, timestamp };
      }
      return item;
    });

    onUpdateRoutine(updated);
    
    // Play tone feedback
    if (status === 'completed') triggerSound('success');
    if (status === 'missed') triggerSound('fail');
  };

  const handleResetTask = (itemId: string) => {
    const updated = routine.map(item => {
      if (item.id === itemId) {
        return { ...item, status: 'pending' as const, timestamp: undefined };
      }
      return item;
    });
    onUpdateRoutine(updated);
    triggerSound('click');
  };

  const handleResetAll = () => {
    if (window.confirm("Start fresh? This resets all tracker statuses back to pending.")) {
      const updated = routine.map(item => ({ ...item, status: 'pending' as const, timestamp: undefined }));
      onUpdateRoutine(updated);
      triggerSound('click');
    }
  };

  const changeWater = (diff: number) => {
    const res = Math.max(0, Math.min(12, waterCups + diff));
    saveWaterCups(res);
    triggerSound('click');
  };

  // Filtering items
  const filteredRoutine = routine.filter(item => {
    if (filterActive === 'pending') return item.status === 'pending';
    if (filterActive === 'completed') return item.status === 'completed';
    if (filterActive === 'missed') return item.status === 'missed';
    return true; // all
  });

  // Calculate resolution progress percentages
  const completedCount = routine.filter(r => r.status === 'completed').length;
  const missedCount = routine.filter(r => r.status === 'missed').length;
  const totalCount = routine.length;
  const progressRatio = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Custom Category Styling helper
  const getCategoryStyles = (cat: CategoryType) => {
    switch (cat) {
      case 'spiritual':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50';
      case 'health':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50';
      case 'study':
        return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50';
      case 'career':
        return 'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/50';
      case 'rest':
        return 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800';
      case 'work':
        return 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200/50 dark:border-sky-900/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              24-Hour Schedule Tracker
            </h1>
            {jobMode && (
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/25">
                JOB ALIGNED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            "Slay the day block by block. Maintain your commitments or explicitly mark items missed."
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            id="job-toggle-routine-view"
            onClick={onJobModeToggle}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              jobMode 
                ? 'bg-indigo-600 border-indigo-650 text-white shadow-sm shadow-indigo-600/15' 
                : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Mode ({jobMode ? 'Active' : 'Off'})</span>
          </button>
          
          <button
            id="reset-all-routine-btn"
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 transition-all font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Day
          </button>
        </div>
      </div>

      {/* Routine Progress Overview & Water Tracker Flex Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Progress Card (8 cols) */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Daily Commitment Ratio
            </h2>
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-200/40 dark:border-slate-800/60 p-0.5">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{Math.round(progressRatio)}% Completed</span>
              <span className="flex gap-4">
                <span>🟢 {completedCount} Done</span>
                <span>🔴 {missedCount} Missed</span>
                <span>⚪ {totalCount - completedCount - missedCount} Pending</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Water Tracker (4 cols) */}
        <div id="water-tracker" className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <GlassWater className="w-4 h-4 text-sky-500 fill-sky-500/20 animate-pulse" />
              Hydration Fuel Log
            </h2>
            <span className="text-[10px] font-mono bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-300 font-bold px-1.5 py-0.5 rounded">
              {waterCups * 250} ml
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            {[...Array(8)].map((_, i) => (
              <GlassWater 
                key={i} 
                className={`w-6 h-6 transition-all shrink-0 ${
                  i < waterCups 
                    ? 'text-sky-500 fill-sky-400/80 drop-shadow-sm scale-110' 
                    : 'text-slate-200 dark:text-slate-800 scale-95'
                }`} 
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2 w-full">
            <button
              id="water-dec-btn"
              onClick={() => changeWater(-1)}
              className="flex-1 text-center font-mono py-1 font-bold text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400"
            >
              - 250ml
            </button>
            <button
              id="water-inc-btn"
              onClick={() => changeWater(1)}
              className="flex-1 text-center font-mono py-1 font-bold text-xs bg-sky-50 dark:bg-indigo-950/20 hover:bg-sky-100/60 dark:hover:bg-indigo-950/50 border border-sky-100 dark:border-indigo-900 rounded-lg text-sky-600 dark:text-sky-300"
            >
              + 250ml
            </button>
          </div>
        </div>

      </div>

      {/* Routine Filters Tabbed Switch */}
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/55 dark:border-slate-800/80">
        <div className="flex gap-1">
          {(['all', 'pending', 'completed', 'missed'] as const).map(tab => (
            <button
              id={`tab-routine-filter-${tab}`}
              key={tab}
              onClick={() => setFilterActive(tab)}
              className={`text-xs px-4 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filterActive === tab 
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm font-semibold' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-mono pr-2 hidden sm:inline">
          Showing {filteredRoutine.length} of {routine.length} slots
        </span>
      </div>

      {/* Routine list timeline */}
      <div id="routine-timeline-container" className="space-y-4">
        {filteredRoutine.map((item, index) => {
          const isPending = item.status === 'pending';
          const isCompleted = item.status === 'completed';
          const isMissed = item.status === 'missed';

          return (
            <div 
              id={`routine-card-${item.id}`}
              key={item.id}
              className={`group relative overflow-hidden rounded-xl border ${
                isCompleted 
                  ? 'border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-500/[0.01]' 
                  : isMissed 
                  ? 'border-rose-200/60 dark:border-rose-900/40 bg-rose-500/[0.01]' 
                  : 'border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60'
              } p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-xs`}
            >
              {/* Highlight accent bar on left */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                isCompleted 
                  ? 'bg-emerald-500' 
                  : isMissed 
                  ? 'bg-rose-500' 
                  : 'bg-indigo-500 dark:bg-indigo-400'
              }`} />

              {/* Left Column: Metadata & Subtasks */}
              <div className="flex items-start gap-3 pl-2.5">
                
                {/* Visual Circle Clock Indicator */}
                <div className="mt-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    isCompleted 
                      ? 'border-emerald-350 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                      : isMissed 
                      ? 'border-rose-350 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isMissed ? (
                      <X className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>

                <div className="space-y-1 my-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Time Slot */}
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-bold tracking-tight">
                      {item.timeSlot}
                    </span>
                    
                    {/* Category Capsule */}
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black border tracking-wider leading-none ${getCategoryStyles(item.category)}`}>
                      {item.category}
                    </span>

                    {/* Timestamp */}
                    {isCompleted && item.timestamp && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-mono">
                        ✓ {item.timestamp}
                      </span>
                    )}
                  </div>

                  {/* Title text */}
                  <h3 className={`text-sm font-bold tracking-tight leading-tight transition-all duration-300 ${
                    isCompleted 
                      ? 'text-emerald-700 dark:text-emerald-400 line-through/30' 
                      : isMissed 
                      ? 'text-rose-600 dark:text-rose-400 line-through/50 opacity-60' 
                      : 'text-slate-850 dark:text-white'
                  }`}>
                    {item.title}
                  </h3>

                  {/* Subtask micro checklists */}
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {item.subtasks.map((sub, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : isMissed ? 'bg-rose-400' : 'bg-indigo-400'}`} />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Interaction Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {isPending ? (
                  <>
                    <button
                      id={`complete-btn-${item.id}`}
                      onClick={() => handleUpdateStatus(item.id, 'completed')}
                      className="group flex items-center justify-center p-2 rounded-xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/25 dark:border-emerald-900/60 dark:hover:bg-emerald-900/40 dark:text-emerald-400 transition-colors cursor-pointer"
                      title="Completed block"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      id={`miss-btn-${item.id}`}
                      onClick={() => handleUpdateStatus(item.id, 'missed')}
                      className="group flex items-center justify-center p-2 rounded-xl border border-rose-250 bg-rose-50/50 hover:bg-rose-100 text-rose-750 dark:bg-rose-950/25 dark:border-rose-900/60 dark:hover:bg-rose-900/40 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Missed block"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </>
                ) : (
                  <button
                    id={`undo-btn-${item.id}`}
                    onClick={() => handleResetTask(item.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    Undo Stat
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredRoutine.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No daily tasks filtered by choice. Switch filter selection!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
