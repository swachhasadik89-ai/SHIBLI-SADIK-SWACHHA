import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { UserStats, StudySession, DailyLog } from '../types';
import { MOOD_COLORS } from '../constants';

interface AnalyticsProps {
  logs: DailyLog[];
  studySessions: StudySession[];
}

const Analytics: React.FC<AnalyticsProps> = ({ logs, studySessions }) => {
  // Prepare data for "Study Hours vs Mood" (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const studyData = last7Days.map(date => {
    const daySessions = studySessions.filter(s => new Date(s.timestamp).toISOString().split('T')[0] === date);
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60;
    const log = logs.find(l => l.date === date);
    return {
      date: date.slice(5), // MM-DD
      hours: +(totalMinutes / 60).toFixed(1),
      mood: log?.mood || 'Neutral',
    };
  });

  // Prepare Mood Distribution
  const moodCounts = logs.reduce((acc, log) => {
    if (log.mood) {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const moodData = Object.keys(moodCounts).map(key => ({
    name: key,
    value: moodCounts[key],
    color: MOOD_COLORS[key as keyof typeof MOOD_COLORS]
  }));
  
  if (logs.length === 0 && studySessions.length === 0) {
      return (
          <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Not enough data to generate analytics yet.</p>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface p-6 rounded-xl shadow border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Study Hours (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-xl shadow border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Mood Distribution</h3>
        <div className="h-64 flex items-center justify-center">
            {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={moodData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                         contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                         itemStyle={{ color: '#e2e8f0' }}
                    />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-500 text-sm">Log your mood to see stats</p>
            )}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
            {moodData.map(m => (
                <div key={m.name} className="flex items-center text-xs text-gray-300">
                    <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: m.color}}></span>
                    {m.name}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
