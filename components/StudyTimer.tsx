import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { StudySession } from '../types';
import { XP_VALUES } from '../constants';

interface StudyTimerProps {
  onSessionComplete: (session: StudySession) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ onSessionComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [subject, setSubject] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!subject.trim()) {
      alert("Please enter a subject first!");
      return;
    }
    setIsRunning(true);
    setSessionStarted(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (elapsedSeconds > 0) {
      const newSession: StudySession = {
        id: Date.now().toString(),
        subject,
        durationSeconds: elapsedSeconds,
        timestamp: Date.now(),
      };
      onSessionComplete(newSession);
    }
    setElapsedSeconds(0);
    setSessionStarted(false);
    setSubject('');
  };

  const potentialXP = Math.floor((elapsedSeconds / 3600) * XP_VALUES.STUDY_PER_HOUR);

  return (
    <div className="bg-surface rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col items-center justify-center space-y-8 min-h-[400px]">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-200 flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-indigo-400" /> Smart Study Timer
        </h2>
        <p className="text-gray-400 text-sm">Earn +{XP_VALUES.STUDY_PER_HOUR} XP per hour</p>
      </div>

      {!sessionStarted ? (
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-400 mb-2">Subject / Topic</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Mathematics, React Hooks..."
            className="w-full bg-dark border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      ) : (
        <div className="text-center">
            <h3 className="text-2xl font-bold text-indigo-300 mb-2">{subject}</h3>
            <p className="text-green-400 font-mono text-sm">+ {potentialXP} XP earned so far</p>
        </div>
      )}

      {/* Timer Display */}
      <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-8 border-dark bg-gray-800 shadow-inner">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-pulse"></div>
        <div className="text-5xl font-mono font-bold text-white tracking-wider">
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-6">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center justify-center w-16 h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Pause className="w-8 h-8" />
          </button>
        )}
        
        {sessionStarted && (
           <button
           onClick={handleStop}
           className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
         >
           <Square className="w-6 h-6" />
         </button>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;
