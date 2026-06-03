/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'completed' | 'missed' | 'pending';

export type CategoryType = 'health' | 'career' | 'spiritual' | 'rest' | 'study' | 'work';

export interface RoutineItem {
  id: string;
  timeSlot: string;
  title: string;
  subtasks: string[];
  status: TaskStatus;
  timestamp?: string; // ISO String when recorded
  category: CategoryType;
  isJobModeOnly?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  dailyLoggedMinutes: number;
  dailyTargetMinutes: number;
  weeklyTargetMinutes: number;
  monthlyTargetMinutes: number;
  history: { date: string; minutes: number }[]; // historical log
  streak: number;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  completed: boolean;
  deadline: string;
  progress: number; // 0 to 100
  category: string;
}

export type MoodType = 'focused' | 'calm' | 'spiritual' | 'energetic' | 'tired' | 'stressed' | 'neutral';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: MoodType;
  waterCups: number; // Target 8-12 cups
  sleepHours: number; // Target 7-8 hours
}

export interface DisciplineMetrics {
  disciplineScore: number; // 0-100 index
  weeklyConsistency: number; // percentage
  activeStreaks: number; // consecutive standard days
  completedCount: number;
  missedCount: number;
  suggestionText: string;
}

export interface AIAnalysisReport {
  id: string;
  dateStr: string; // Range e.g. "May 25 - Jun 1"
  productivityScore: number;
  focusScore: number;
  disciplineScore: number;
  performanceSummary: string;
  mostMissedHabits: string[];
  bestPerformingHabits: string[];
  improvementSuggestions: string[];
  generatedAt: string;
}

export interface AppState {
  routine: RoutineItem[];
  skills: Skill[];
  weeklyGoals: WeeklyGoal[];
  journals: JournalEntry[];
  jobMode: boolean;
  theme: 'light' | 'dark';
  reports: AIAnalysisReport[];
}
