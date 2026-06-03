/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Minus, 
  CalendarDays, 
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Skill } from '../types';

interface SkillsViewProps {
  skills: Skill[];
  onUpdateSkills: (skills: Skill[]) => void;
}

export default function SkillsView({ skills, onUpdateSkills }: SkillsViewProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || 'coding');
  
  // States to facilitate manual target inputs
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [tempDaily, setTempDaily] = useState(60);
  const [tempWeekly, setTempWeekly] = useState(300);
  const [tempMonthly, setTempMonthly] = useState(1200);

  // Time logging values
  const [logAmount, setLogAmount] = useState<number>(30); // minutes default

  const activeSkill = skills.find(s => s.id === selectedSkillId) || skills[0];

  const handleSelectSkill = (id: string) => {
    setSelectedSkillId(id);
    setEditingTargetId(null);
  };

  const handleLogTime = (skillId: string, minutes: number) => {
    const updated = skills.map(skill => {
      if (skill.id === skillId) {
        const newDaily = Math.max(0, skill.dailyLoggedMinutes + minutes);
        
        // Append or update today's date in history
        const todayStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const existingHistoryIdx = skill.history.findIndex(h => h.date === todayStr);
        let newHistory = [...skill.history];
        
        if (existingHistoryIdx >= 0) {
          newHistory[existingHistoryIdx] = { 
            ...newHistory[existingHistoryIdx], 
            minutes: Math.max(0, newHistory[existingHistoryIdx].minutes + minutes) 
          };
        } else {
          newHistory.push({ date: todayStr, minutes });
          if (newHistory.length > 7) newHistory.shift(); // keep track of last 7 points
        }

        // Adjust streak based on logged targets
        let streak = skill.streak;
        if (newDaily >= skill.dailyTargetMinutes && skill.dailyLoggedMinutes < skill.dailyTargetMinutes) {
          streak += 1;
        }

        return {
          ...skill,
          dailyLoggedMinutes: newDaily,
          history: newHistory,
          streak
        };
      }
      return skill;
    });

    onUpdateSkills(updated);
  };

  const handleResetSkillTime = (skillId: string) => {
    if (window.confirm("Undo today's progress for this skill?")) {
      const updated = skills.map(skill => {
        if (skill.id === skillId) {
          const todayStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const newHistory = skill.history.map(h => h.date === todayStr ? { ...h, minutes: 0 } : h);
          return {
            ...skill,
            dailyLoggedMinutes: 0,
            history: newHistory,
            // streak remains or slightly lowered by 1
            streak: Math.max(0, skill.streak - 1)
          };
        }
        return skill;
      });
      onUpdateSkills(updated);
    }
  };

  const startEditingTargets = (skill: Skill) => {
    setEditingTargetId(skill.id);
    setTempDaily(skill.dailyTargetMinutes);
    setTempWeekly(skill.weeklyTargetMinutes);
    setTempMonthly(skill.monthlyTargetMinutes);
  };

  const handleSaveTargets = () => {
    if (!editingTargetId) return;
    const updated = skills.map(skill => {
      if (skill.id === editingTargetId) {
        return {
          ...skill,
          dailyTargetMinutes: tempDaily,
          weeklyTargetMinutes: tempWeekly,
          monthlyTargetMinutes: tempMonthly
        };
      }
      return skill;
    });
    
    onUpdateSkills(updated);
    setEditingTargetId(null);
  };

  // Helper formatting for minutes to hr:min
  const formatTimeStr = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Simulated comparative report for active skill
  const generateMonthlyAnalyticSummary = (skill: Skill) => {
    const totalWeekly = skill.history.reduce((a, b) => a + b.minutes, 0);
    const targetComp = skill.weeklyTargetMinutes > 0 ? Math.round((totalWeekly / skill.weeklyTargetMinutes) * 100) : 0;
    
    if (skill.id === 'coding') {
      return {
        trend: '+24% Velocity Growth',
        summary: "Your practice volume of projects and coding blocks shows substantial upward traction. Building consistent daily streaks maintains synapsis activation. Highly recommended to continue committing repository changes directly."
      };
    }
    if (skill.id === 'english') {
      return {
        trend: '+12% Speaking Fluency',
        summary: "Speaking consistency is increasing. Connecting conversational grammar to active study blocks yields solid retention. Ensure you call your speaking partner consistently in the evening."
      };
    }
    if (skill.id === 'fitness') {
      return {
        trend: '+8% Strength Recovery Index',
        summary: "Early morning gym commitment remains your strongest habit. Excellent muscle recovery indicators, coinciding with high hydration metrics."
      };
    }
    
    return {
      trend: targetComp >= 70 ? '+15% Stable Traction' : 'Needs attention',
      summary: `You met ${targetComp}% of your weekly targeted commits. Focusing effort on morning spiritual or evening study blocks blocks will stabilize consistency gaps.`
    };
  };

  const activeAnalytic = generateMonthlyAnalyticSummary(activeSkill);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Skill Priority & Time Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            "Allocate dedicated minutes toward your five primary pillars. Log practice to raise your competence score."
          </p>
        </div>
        
        {/* Quick legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border dark:border-slate-850">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Active Practice Pillars</span>
        </div>
      </div>

      {/* Grid: Left navigation of skills (5 pillars), Right detail log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation panel (5 columns) */}
        <div id="skills-pillars-nav" className="lg:col-span-5 space-y-3">
          {skills.map(skill => {
            const isSelected = skill.id === selectedSkillId;
            const dailyProgress = Math.min(100, Math.round((skill.dailyLoggedMinutes / skill.dailyTargetMinutes) * 100));
            
            return (
              <button
                id={`skill-nav-btn-${skill.id}`}
                key={skill.id}
                onClick={() => handleSelectSkill(skill.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all relative ${
                  isSelected 
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/25 dark:bg-indigo-950/20 shadow-xs' 
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                {/* Active Highlight flag */}
                {isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 animate-pulse">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}

                <div className="flex items-center gap-3 justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white capitalize">
                      {skill.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        Logged: {formatTimeStr(skill.dailyLoggedMinutes)}
                      </span>
                      {skill.streak > 0 && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-1 py-0.5 rounded flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {skill.streak}d streak
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Minu progress gauge */}
                  <div className="w-10 h-10 shrink-0 relative flex items-center justify-center font-mono text-[10px] font-bold text-slate-600 dark:text-slate-350">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-slate-100 dark:text-slate-850" strokeWidth="3.5" fill="transparent"/>
                      <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-indigo-500" strokeWidth="3.5" strokeDasharray={100} strokeDashoffset={100 - dailyProgress} strokeLinecap="round" fill="transparent"/>
                    </svg>
                    <span>{dailyProgress}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed target log panel (7 columns) */}
        <div id="skills-log-detail" className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            
            {/* Upper Action Banner */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="font-bold text-base text-slate-800 dark:text-white capitalize">
                  {activeSkill.name} Diagnostic & Logging
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  Configure targets and log real work metrics.
                </p>
              </div>

              {editingTargetId === null ? (
                <button
                  id="edit-targets-btn"
                  onClick={() => startEditingTargets(activeSkill)}
                  className="rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-semibold text-slate-650"
                >
                  Adjust Goals/Targets
                </button>
              ) : (
                <button
                  id="save-targets-btn"
                  onClick={handleSaveTargets}
                  className="rounded-xl px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold"
                >
                  Save Matrix
                </button>
              )}
            </div>

            {/* Editing Sub-system */}
            {editingTargetId === activeSkill.id ? (
              <div id="targets-editor-form" className="bg-slate-50/50 dark:bg-slate-950/60 p-4 border rounded-2xl mb-5 space-y-3 dark:border-slate-850">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Adjust Skill Goals</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Daily Target (Mins)</label>
                    <input
                      id="input_daily_target"
                      type="number"
                      step="10"
                      value={tempDaily}
                      onChange={(e) => setTempDaily(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs font-mono bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Weekly Target (Mins)</label>
                    <input
                      id="input_weekly_target"
                      type="number"
                      step="30"
                      value={tempWeekly}
                      onChange={(e) => setTempWeekly(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs font-mono bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Monthly (Mins)</label>
                    <input
                      id="input_monthly_target"
                      type="number"
                      step="60"
                      value={tempMonthly}
                      onChange={(e) => setTempMonthly(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs font-mono bg-white dark:bg-slate-900 border dark:border-slate-800 p-2 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Targets Tier Display Matrix */
              <div id="targets-display-matrix" className="grid grid-cols-3 gap-3 mb-6">
                
                {/* Daily box */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3">
                  <div className="text-[10px] font-black text-slate-400">DAILY TARGET</div>
                  <div className="text-sm font-bold font-mono py-1 text-slate-755 dark:text-white">
                    {formatTimeStr(activeSkill.dailyTargetMinutes)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Status: <span className="font-semibold text-indigo-500">{activeSkill.dailyLoggedMinutes >= activeSkill.dailyTargetMinutes ? 'Achieved!' : 'In progress'}</span>
                  </div>
                </div>

                {/* Weekly box */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3">
                  <div className="text-[10px] font-black text-slate-400">WEEKLY TARGET</div>
                  <div className="text-sm font-bold font-mono py-1 text-slate-755 dark:text-white">
                    {formatTimeStr(activeSkill.weeklyTargetMinutes)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Active pacing
                  </div>
                </div>

                {/* Monthly box */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3">
                  <div className="text-[10px] font-black text-slate-400">MONTHLY SPEC</div>
                  <div className="text-sm font-bold font-mono py-1 text-slate-755 dark:text-white">
                    {formatTimeStr(activeSkill.monthlyTargetMinutes)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Monthly goals metrics
                  </div>
                </div>

              </div>
            )}

            {/* Manual Effort logger block */}
            <div className="space-y-3.5 bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <h3 className="text-xs font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1.5 leading-none">
                <Clock className="w-4 h-4 text-indigo-500" />
                Log Active Practice
              </h3>
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-1.5">
                  {[15, 30, 45, 60, 120].map(amount => (
                    <button
                      id={`log-shortcut-${amount}`}
                      key={amount}
                      onClick={() => {
                        handleLogTime(activeSkill.id, amount);
                      }}
                      className="text-xs font-bold font-mono px-2.5 py-1 bg-white dark:bg-slate-900 border dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 rounded-lg transition-all"
                    >
                      +{amount}m
                    </button>
                  ))}
                </div>

                {/* Undo manual */}
                <button
                  id="reset-skill-time-btn"
                  onClick={() => handleResetSkillTime(activeSkill.id)}
                  className="text-xs text-rose-500 dark:text-rose-450 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2 py-1 rounded"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Today
                </button>
              </div>
            </div>

            {/* Custom Responsive SVG History Sparkline or mini charts */}
            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Weekly History Matrix (Mins)
              </h3>
              <div className="w-full bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-850 rounded-2xl p-4 flex items-end justify-between h-28 font-mono">
                {activeSkill.history.length === 0 ? (
                  <div className="w-full text-center py-6 text-xs text-slate-400">
                    No historical practice logged yet. Record some minutes to plot graphs!
                  </div>
                ) : (
                  activeSkill.history.map((pt, index) => {
                    // Maximum of history to scale heights
                    const maxMinutes = Math.max(120, ...activeSkill.history.map(h => h.minutes));
                    const scaledHeight = pt.minutes > 0 ? Math.round((pt.minutes / maxMinutes) * 60) : 4; // minimum height 4px to see line
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 space-y-1.5 group cursor-default">
                        {/* Tooltip on Hover */}
                        <div className="text-[9px] bg-slate-800 dark:bg-slate-900 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute mb-14 border border-slate-700">
                          {pt.minutes}m
                        </div>
                        {/* Column Bar */}
                        <div 
                          className={`w-4 rounded-t-sm transition-all duration-300 ${
                            pt.minutes >= activeSkill.dailyTargetMinutes 
                              ? 'bg-emerald-500 hover:bg-emerald-400' 
                              : 'bg-indigo-500 hover:bg-indigo-450'
                          }`}
                          style={{ height: `${scaledHeight}px` }}
                        />
                        {/* Date Label */}
                        <span className="text-[9px] text-slate-400 font-bold shrink-0">{pt.date}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* AI Comparative Report Block widget */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded tracking-wide leading-none">
                {activeAnalytic.trend}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">MONTHLY RETROSPECT</span>
            </div>
            <p className="text-xs italic text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
              "{activeAnalytic.summary}"
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
