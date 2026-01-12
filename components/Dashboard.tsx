import React from 'react';
import { UserStats, Task, StudySession } from '../types';
import { LEVELS } from '../constants';
import { Trophy, Flame, Target, Star, AlertCircle } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  tasks: Task[];
  recentStudySessions: StudySession[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, tasks, recentStudySessions }) => {
  const nextLevelXp = LEVELS.find(l => l > stats.xp) || LEVELS[LEVELS.length - 1];
  const prevLevelXp = LEVELS[[...LEVELS].reverse().find(l => l <= stats.xp)!] || 0; 
  // Fix logic: find the level floor.
  const currentLevelBase = LEVELS.slice().reverse().find(l => l <= stats.xp) || 0;
  
  const progressPercent = Math.min(100, Math.max(0, ((stats.xp - currentLevelBase) / (nextLevelXp - currentLevelBase)) * 100));

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Gamification Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level {stats.level}</h2>
              <p className="text-indigo-200 text-sm">Growth Seeker</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.xp} <span className="text-sm font-normal text-indigo-200">XP</span></div>
            <div className="text-xs text-indigo-200">Next Level: {nextLevelXp} XP</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-4 bg-black/20 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs mt-2 text-right opacity-80">{Math.round(progressPercent)}% to Level {stats.level + 1}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl p-4 shadow flex items-center space-x-3 border border-gray-700">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <div className="text-2xl font-bold text-white">{stats.streak}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow flex items-center space-x-3 border border-gray-700">
          <Target className="w-8 h-8 text-blue-500" />
          <div>
            <div className="text-2xl font-bold text-white">{pendingTasks.length}</div>
            <div className="text-xs text-gray-400">Tasks Pending</div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="bg-surface rounded-xl p-6 shadow border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" /> Recent Gains
        </h3>
        <div className="space-y-3">
          {recentStudySessions.length === 0 && tasks.filter(t => t.status === 'Completed').length === 0 ? (
             <p className="text-gray-400 text-sm">No activity today yet. Let's get started!</p>
          ) : (
            <>
              {recentStudySessions.slice(0, 3).map(session => (
                <div key={session.id} className="flex justify-between items-center text-sm p-2 bg-dark rounded">
                  <span className="text-gray-200">Studied <span className="font-semibold text-indigo-400">{session.subject}</span></span>
                  <span className="text-green-400">+{Math.floor(session.durationSeconds / 60 * 20 / 60)} XP</span>
                </div>
              ))}
              {tasks.filter(t => t.status === 'Completed').slice(0, 3).map(task => (
                <div key={task.id} className="flex justify-between items-center text-sm p-2 bg-dark rounded">
                   <span className="text-gray-200">Completed <span className="font-semibold text-indigo-400">{task.title}</span></span>
                   <span className="text-green-400">+10 XP</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
