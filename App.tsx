import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import StudyTimer from './components/StudyTimer';
import DiaryReflection from './components/DiaryReflection';
import Analytics from './components/Analytics';
import { UserStats, Task, StudySession, DailyLog } from './types';
import { XP_VALUES, LEVELS } from './constants';
import { LayoutDashboard, CheckSquare, Timer, Book, PieChart, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Tasks' | 'Timer' | 'Diary' | 'Analytics'>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial Data (In a real app, this would come from a database)
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('growth_stats');
    return saved ? JSON.parse(saved) : { xp: 0, level: 1, streak: 0 };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('growth_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('growth_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('growth_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Effects for Persistence ---
  useEffect(() => localStorage.setItem('growth_stats', JSON.stringify(stats)), [stats]);
  useEffect(() => localStorage.setItem('growth_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('growth_sessions', JSON.stringify(studySessions)), [studySessions]);
  useEffect(() => localStorage.setItem('growth_logs', JSON.stringify(dailyLogs)), [dailyLogs]);

  // --- Logic Helpers ---
  const today = new Date().toISOString().split('T')[0];

  const getCurrentLog = () => {
    let log = dailyLogs.find(l => l.date === today);
    if (!log) {
      log = {
        date: today,
        mood: null,
        diaryEntry: '',
        timeBlocks: [],
        reflection: { wentWrong: '', distractions: '', improvements: '' }
      };
    }
    return log;
  };

  const updateXP = (amount: number) => {
    setStats(prev => {
      const newXP = Math.max(0, prev.xp + amount);
      // Calculate level based on LEVELS array
      let newLevel = prev.level;
      for (let i = 0; i < LEVELS.length; i++) {
        if (newXP >= LEVELS[i]) {
          newLevel = i + 1;
        }
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  // --- Handlers ---
  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: Date.now().toString() };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTask = (id: string, status: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // XP Logic: Only award if changing from Pending to Completed/Skipped
    if (task.status === 'Pending') {
      if (status === 'Completed') updateXP(XP_VALUES.TASK_COMPLETED);
      if (status === 'Skipped') updateXP(XP_VALUES.TASK_MISSED);
    }
    
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSessionComplete = (session: StudySession) => {
    setStudySessions(prev => [session, ...prev]);
    const xpEarned = Math.floor((session.durationSeconds / 3600) * XP_VALUES.STUDY_PER_HOUR);
    if (xpEarned > 0) updateXP(xpEarned);
  };

  const handleUpdateLog = (updatedLog: DailyLog) => {
    const existingIndex = dailyLogs.findIndex(l => l.date === today);
    
    // XP for Diary: First time writing substantial entry?
    const oldLog = dailyLogs[existingIndex];
    if ((!oldLog || oldLog.diaryEntry.length < 10) && updatedLog.diaryEntry.length >= 10) {
        updateXP(XP_VALUES.DIARY_ENTRY);
    }

    if (existingIndex >= 0) {
      const newLogs = [...dailyLogs];
      newLogs[existingIndex] = updatedLog;
      setDailyLogs(newLogs);
    } else {
      setDailyLogs(prev => [...prev, updatedLog]);
    }
  };

  // Navigation Items
  const navItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'Tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'Timer', icon: Timer, label: 'Study' },
    { id: 'Diary', icon: Book, label: 'Diary' },
    { id: 'Analytics', icon: PieChart, label: 'Stats' },
  ] as const;

  return (
    <div className="min-h-screen bg-dark text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-surface p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">GrowthQuest</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-gray-700 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-8 hidden md:block">GrowthQuest</h1>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
                    {stats.level}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">Level {stats.level}</p>
                    <p className="text-xs text-gray-400">{stats.xp} Total XP</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 md:block hidden">
             <h2 className="text-3xl font-bold text-white">{activeTab === 'Dashboard' ? `Hello, Growth Seeker` : navItems.find(n => n.id === activeTab)?.label}</h2>
             <p className="text-gray-400">{new Date().toDateString()}</p>
          </header>

          {activeTab === 'Dashboard' && (
            <Dashboard 
              stats={stats} 
              tasks={tasks}
              recentStudySessions={studySessions.sort((a,b) => b.timestamp - a.timestamp)}
            />
          )}

          {activeTab === 'Tasks' && (
            <TaskManager 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'Timer' && (
            <StudyTimer onSessionComplete={handleSessionComplete} />
          )}

          {activeTab === 'Diary' && (
            <DiaryReflection 
              log={getCurrentLog()}
              tasks={tasks.filter(t => t.date === today)}
              studySessions={studySessions.filter(s => new Date(s.timestamp).toISOString().split('T')[0] === today)}
              onUpdateLog={handleUpdateLog}
            />
          )}

          {activeTab === 'Analytics' && (
            <Analytics logs={dailyLogs} studySessions={studySessions} />
          )}
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
