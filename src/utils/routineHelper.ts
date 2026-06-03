/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoutineItem } from '../types';

export const STANDARD_ROUTINE: Omit<RoutineItem, 'status'>[] = [
  {
    id: 'wake_up',
    timeSlot: '5:00 AM - 6:00 AM',
    title: 'Wake Up & Spiritual Alignment',
    subtasks: ['Wake up early', 'Drink copper-flask water', 'Meditation (15 mins)', 'Freshen up'],
    category: 'spiritual'
  },
  {
    id: 'gym',
    timeSlot: '6:00 AM - 7:30 AM',
    title: 'Fitness & Gym Workout',
    subtasks: ['Gym session', 'Workout tracking in app', 'Stretch'],
    category: 'health'
  },
  {
    id: 'cooking_bf',
    timeSlot: '7:30 AM - 9:00 AM',
    title: 'Cooking & Breakfast',
    subtasks: ['Meal prep', 'High protein post-workout breakfast', 'Clean kitchen'],
    category: 'health'
  },
  {
    id: 'spiritual',
    timeSlot: '9:00 AM - 10:00 AM',
    title: 'Spiritual Routine & Sadhana',
    subtasks: ['Bath', 'Pooja room prayers', 'Naam Jap (chanting meditation)'],
    category: 'spiritual'
  },
  {
    id: 'deep_study',
    timeSlot: '10:00 AM - 1:00 PM',
    title: 'Deep Study Block - Focus Phase I',
    subtasks: ['Shut down phone/distractions', 'Complex core topics research', 'Pen-and-paper notes'],
    category: 'study'
  },
  {
    id: 'lunch_rest',
    timeSlot: '1:00 PM - 2:00 PM',
    title: 'Lunch & Quick Rest',
    subtasks: ['Light healthy lunch', 'Afternoon power nap (20 mins)', 'Hydrate'],
    category: 'rest'
  },
  {
    id: 'coding_projects',
    timeSlot: '2:00 PM - 5:00 PM',
    title: 'Coding, Portfolio Projects & Practice',
    subtasks: ['Build React/Express applications', 'Solve DS & Algo problems', 'GitHub commits'],
    category: 'career'
  },
  {
    id: 'afternoon_break',
    timeSlot: '5:00 PM - 5:30 PM',
    title: 'Unwind Break',
    subtasks: ['Light stretches', 'Drink green tea / coconut water', 'Sunset brief walk'],
    category: 'rest'
  },
  {
    id: 'revision_study',
    timeSlot: '5:30 PM - 7:00 PM',
    title: 'Revision & Light Study',
    subtasks: ['Revise morning study notes', 'Flashcards (Anki)', 'Read industry blogs'],
    category: 'study'
  },
  {
    id: 'cooking_dinner',
    timeSlot: '7:00 PM - 8:30 PM',
    title: 'Cooking & Dinner',
    subtasks: ['Prepare home-cooked dinner', 'Eat dinner screen-free'],
    category: 'health'
  },
  {
    id: 'relaxation',
    timeSlot: '8:30 PM - 10:30 PM',
    title: 'Family, Partner & Relaxation',
    subtasks: ['Family dialogue', 'Partner Call / Deep connection', 'Read novel (20 mins)', 'Wind down'],
    category: 'rest'
  },
  {
    id: 'sleep',
    timeSlot: '11:00 PM',
    title: 'Rest & Deep Sleep',
    subtasks: ['Device blackout', 'Gratitude journal entry', 'Sleep by 11:00 PM'],
    category: 'rest'
  }
];

export const JOB_MODE_ROUTINE: Omit<RoutineItem, 'status'>[] = [
  {
    id: 'wake_up',
    timeSlot: '5:00 AM - 6:00 AM',
    title: 'Wake Up & Spiritual Alignment',
    subtasks: ['Wake up early', 'Drink copper-flask water', 'Meditation (15 mins)', 'Freshen up'],
    category: 'spiritual'
  },
  {
    id: 'gym',
    timeSlot: '6:00 AM - 7:30 AM',
    title: 'Fitness & Gym Workout',
    subtasks: ['Gym session', 'Workout tracking in app', 'Stretch'],
    category: 'health'
  },
  {
    id: 'cooking_bf_job',
    timeSlot: '7:30 AM - 8:30 AM',
    title: 'Cooking, Breakfast & Prep',
    subtasks: ['Quick high protein breakfast', 'Prepare office lunchbox', 'Shower & Dress up'],
    category: 'health'
  },
  {
    id: 'commute_in',
    timeSlot: '8:30 AM - 9:00 AM',
    title: 'Office Commute / Spiritual Audio',
    subtasks: ['Listen to spiritual podcasts', 'Prepare mentally for the workday'],
    category: 'spiritual'
  },
  {
    id: 'dev_job',
    timeSlot: '9:00 AM - 6:00 PM',
    title: 'Developer Job Routine',
    subtasks: ['Daily standup & agile deliverables', 'Team collaborations & active coding', 'Solve complex production tickets'],
    category: 'work'
  },
  {
    id: 'commute_out',
    timeSlot: '6:00 PM - 7:00 PM',
    title: 'Commute / Spiritual Chanting & Decompress',
    subtasks: ['Commute back home', 'Naam Jap chanting to wash off office stress', 'Warm bath on arrival'],
    category: 'spiritual'
  },
  {
    id: 'dinner_job',
    timeSlot: '7:00 PM - 8:00 PM',
    title: 'Prepare & Eat Dinner',
    subtasks: ['Healthy light dinner', 'Avoid heavy carbs'],
    category: 'health'
  },
  {
    id: 'evening_focus',
    timeSlot: '8:00 PM - 10:00 PM',
    title: 'Super-Focus Coding & Project Build',
    subtasks: ['Work on SaaS project development', 'Deep study new frameworks', 'Strict flow state'],
    category: 'career'
  },
  {
    id: 'partner_family_job',
    timeSlot: '10:00 PM - 11:00 PM',
    title: 'Partner Call & Reading Novel',
    subtasks: ['Call partner / dial family', 'Read novel (15 mins)', 'Write evening diary / review state'],
    category: 'rest'
  },
  {
    id: 'sleep',
    timeSlot: '11:00 PM',
    title: 'Rest & Deep Sleep',
    subtasks: ['Device blackout', 'Gratitude journal entry', 'Sleep by 11:00 PM'],
    category: 'rest'
  }
];

export function getInitialRoutine(jobMode: boolean): RoutineItem[] {
  const source = jobMode ? JOB_MODE_ROUTINE : STANDARD_ROUTINE;
  return source.map((r) => ({
    ...r,
    status: 'pending'
  }));
}

export function calculateDisciplineScore(routine: RoutineItem[]): number {
  if (!routine.length) return 0;
  const weights = {
    completed: 100,
    missed: 0,
    pending: 40 // pending counts neutrally/slightly positive to avoid score crashing early in the day
  };
  
  const totalWeight = routine.reduce((acc, item) => acc + weights[item.status], 0);
  return Math.round(totalWeight / routine.length);
}

export const MOTIVATIONAL_QUOTES = [
  "Discipline is the bridge between goals and accomplishment. – Jim Rohn",
  "It is not that we have a short time to live, but that we waste a lot of it. – Seneca",
  "Consistency is the companion of progress.",
  "Naam Jap burns karma, spiritual alignment strengthens the mind to rule the day.",
  "Small daily improvements over time lead to stunning results. Stay on track!",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. – Aristotle",
  "Do not pray for an easy life, pray for the strength to endure a difficult one. – Bruce Lee"
];
