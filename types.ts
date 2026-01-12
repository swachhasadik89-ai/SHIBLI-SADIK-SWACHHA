export type Category = 'Study' | 'Personal' | 'Health' | 'Work';

export type TaskStatus = 'Pending' | 'Completed' | 'Skipped';

export interface Task {
  id: string;
  title: string;
  category: Category;
  status: TaskStatus;
  date: string; // ISO Date string YYYY-MM-DD
}

export interface StudySession {
  id: string;
  subject: string;
  durationSeconds: number;
  timestamp: number; // Date.now()
}

export type Mood = 'Happy' | 'Productive' | 'Tired' | 'Sad' | 'Neutral';

export interface TimeBlock {
  id: string;
  startTime: string; // "14:00"
  endTime: string;   // "16:00"
  activity: string;
}

export interface Reflection {
  wentWrong: string;
  distractions: string;
  improvements: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  mood: Mood | null;
  diaryEntry: string;
  timeBlocks: TimeBlock[];
  reflection: Reflection | null;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
}
