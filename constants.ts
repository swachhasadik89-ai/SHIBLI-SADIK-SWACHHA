import { Category, Mood } from "./types";

export const XP_VALUES = {
  TASK_COMPLETED: 10,
  TASK_MISSED: -5,
  STUDY_PER_HOUR: 20, // 0.33 per minute
  DIARY_ENTRY: 5,
};

export const LEVELS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000
];

export const CATEGORIES: Category[] = ['Study', 'Personal', 'Health', 'Work'];

export const MOODS: Mood[] = ['Happy', 'Productive', 'Tired', 'Sad', 'Neutral'];

export const MOOD_COLORS: Record<Mood, string> = {
  Happy: '#22c55e',
  Productive: '#3b82f6',
  Tired: '#f59e0b',
  Sad: '#ef4444',
  Neutral: '#94a3b8'
};
