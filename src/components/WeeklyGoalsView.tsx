/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Edit2, 
  X, 
  Award, 
  Calendar, 
  Clock, 
  Tag, 
  Sliders, 
  CircleDot 
} from 'lucide-react';
import { WeeklyGoal } from '../types';

interface WeeklyGoalsViewProps {
  goals: WeeklyGoal[];
  onUpdateGoals: (goals: WeeklyGoal[]) => void;
}

export default function WeeklyGoalsView({ goals, onUpdateGoals }: WeeklyGoalsViewProps) {
  // Goal fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career');
  const [deadline, setDeadline] = useState('2026-06-07'); // Default Sunday (relative to simulation date)
  const [progress, setProgress] = useState(0);

  // Edit states
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editProgress, setEditProgress] = useState(0);

  // Categories helper
  const availableCategories = ['Career', 'Fitness', 'Study', 'Spiritual', 'Relaxation', 'Health'];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newGoal: WeeklyGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      completed: progress === 100,
      deadline,
      progress,
      category
    };

    onUpdateGoals([...goals, newGoal]);
    
    // reset form
    setTitle('');
    setProgress(0);
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm("Are you sure you want to delete this weekly goal?")) {
      const updated = goals.filter(g => g.id !== id);
      onUpdateGoals(updated);
    }
  };

  // Start edit action
  const handleStartEdit = (goal: WeeklyGoal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditCategory(goal.category);
    setEditDeadline(goal.deadline);
    setEditProgress(goal.progress);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingGoalId(null);
  };

  // Save edited goal
  const handleSaveEdit = (id: string) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          title: editTitle.trim(),
          category: editCategory,
          deadline: editDeadline,
          progress: editProgress,
          completed: editProgress === 100
        };
      }
      return g;
    });
    
    onUpdateGoals(updated);
    setEditingGoalId(null);
  };

  // Interactive checkbox shortcut (complete or un-complete instantly)
  const handleToggleComplete = (id: string) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const isNowCompleted = !g.completed;
        return {
          ...g,
          completed: isNowCompleted,
          progress: isNowCompleted ? 100 : 0
        };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  // Quick Inline Slide Adjustment
  const handleSliderProgressChange = (id: string, amount: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          progress: amount,
          completed: amount === 100
        };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  // Derived overall completion percentage of all goals
  const overallPerformance = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
    : 0;

  const completedGoalsCount = goals.filter(g => g.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 md:py-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm animate-fade-in">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Weekly Key Focus Goals
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            "Define up to 7 major milestones for the current week. Micro-progress adjustments promote continuous execution."
          </p>
        </div>
        
        {/* Progress box metrics */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500">AVG PROGRESS</span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{overallPerformance}%</span>
          </div>
          <div className="border-l h-8 border-slate-200 dark:border-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500">STAGES COMPLETED</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-white">{completedGoalsCount} / {goals.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Add goal panel form (4 columns) */}
        <div id="goals-builder" className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm h-fit">
          <h2 className="text-sm font-bold text-slate-850 dark:text-white border-b border-sidebar-divider pb-2.5 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" />
            Build Weekly Objective
          </h2>

          <form onSubmit={handleAddGoal} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Weekly Task Title</label>
              <input
                id="goal_input_title"
                type="text"
                placeholder="e.g., Complete Laravel Auth module"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                required
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Commitment Area</label>
              <select
                id="goal_input_category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-505"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Deadline selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Target Deadline</label>
              <input
                id="goal_input_deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-505"
              />
            </div>

            {/* Inherent Progress tracker */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold">Starting Progress</span>
                <span className="font-mono font-bold text-indigo-600">{progress}%</span>
              </div>
              <input
                id="goal_input_progress_slider"
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <button
              id="submit-goal-btn"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Commit Weekly Goal Focus
            </button>
          </form>
        </div>

        {/* List of goals (8 columns) */}
        <div id="goals-list-container" className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[400px]">
          <div>
            <h2 className="text-sm font-bold text-slate-850 dark:text-white border-b border-sidebar-divider pb-2.5 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-indigo-500" />
                Active Objectives
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold font-mono uppercase">
                {goals.length} Tracked
              </span>
            </h2>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {goals.map(goal => {
                const isEditing = editingGoalId === goal.id;
                
                return (
                  <div 
                    id={`goal-item-${goal.id}`}
                    key={goal.id}
                    className={`p-4 border rounded-xl flex flex-col gap-3 transition-all ${
                      goal.completed 
                        ? 'border-emerald-250 bg-emerald-500/[0.01]' 
                        : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20'
                    }`}
                  >
                    {isEditing ? (
                      /* Inline edit frame */
                      <div className="space-y-3 font-sans">
                        <div className="flex gap-2.5">
                          <input
                            id={`edit-goal-title-${goal.id}`}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-950 border rounded-lg p-2 flex-1 outline-none text-slate-800 dark:text-white"
                          />
                          <select
                            id={`edit-goal-cat-${goal.id}`}
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-950 border rounded-lg p-2 outline-none text-slate-800 dark:text-white"
                          >
                            {availableCategories.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Deadline:</span>
                            <input
                              id={`edit-goal-deadline-${goal.id}`}
                              type="date"
                              value={editDeadline}
                              onChange={(e) => setEditDeadline(e.target.value)}
                              className="text-xs font-mono bg-white dark:bg-slate-950 border rounded-lg p-1 text-slate-850 dark:text-white"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Progress:</span>
                            <input
                              id={`edit-goal-slider-${goal.id}`}
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={editProgress}
                              onChange={(e) => setEditProgress(parseInt(e.target.value))}
                              className="accent-indigo-600 w-24 h-4 cursor-pointer"
                            />
                            <span className="text-xs font-mono font-bold text-indigo-500 w-8 text-right">{editProgress}%</span>
                          </div>

                          <div className="flex gap-1.5 ml-auto">
                            <button
                              id={`save-goal-edit-${goal.id}`}
                              onClick={() => handleSaveEdit(goal.id)}
                              className="p-1 px-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold"
                            >
                              Save
                            </button>
                            <button
                              id={`cancel-goal-edit-${goal.id}`}
                              onClick={handleCancelEdit}
                              className="p-1 px-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display Goal Frame */
                      <div className="flex items-start justify-between gap-4">
                        
                        {/* Title and stats */}
                        <div className="space-y-1 select-none flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            {/* Category Capsule */}
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase bg-indigo-50/80 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded flex items-center gap-1.5 border dark:border-indigo-950">
                              <Tag className="w-3 h-3" />
                              {goal.category}
                            </span>

                            {/* Deadline Display */}
                            <span className="text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              By {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-sm font-bold tracking-tight ${goal.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>
                            {goal.title}
                          </h3>

                          {/* Sliders manual progress tracker */}
                          <div className="pt-2 flex items-center gap-2.5 md:w-3/4">
                            <Sliders className="w-3.5 h-3.5 text-slate-400" />
                            <input
                              id={`inline-slider-goal-${goal.id}`}
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={goal.progress}
                              onChange={(e) => handleSliderProgressChange(goal.id, parseInt(e.target.value))}
                              className="accent-indigo-600 cursor-pointer flex-1 h-1.5 opacity-80 hover:opacity-100"
                            />
                            <span className="text-[10px] font-mono font-bold text-slate-500 w-8 shrink-0">{goal.progress}%</span>
                          </div>
                        </div>

                        {/* Interactive triggers */}
                        <div className="flex gap-1.5 shrink-0">
                          {/* Complete button checkmark */}
                          <button
                            id={`toggle-complete-btn-${goal.id}`}
                            onClick={() => handleToggleComplete(goal.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              goal.completed 
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' 
                                : 'bg-white hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-400 dark:hover:text-white'
                            }`}
                            title="Mark 100% complete"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>

                          {/* Edit button */}
                          <button
                            id={`edit-goal-btn-${goal.id}`}
                            onClick={() => handleStartEdit(goal)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            id={`delete-goal-btn-${goal.id}`}
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-950 text-slate-450 hover:border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}

              {goals.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-150 dark:border-slate-800/80 rounded-2xl text-xs text-slate-500">
                  No weekly objectives defined yet. Construct targets on the left side menu!
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-6">
            💡 Goals are synced with active analytics and influence weekly report recommendations.
          </p>
        </div>

      </div>

    </div>
  );
}
