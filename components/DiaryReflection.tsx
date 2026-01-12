import React, { useState } from 'react';
import { DailyLog, Mood, Reflection, TimeBlock, Task, StudySession } from '../types';
import { MOODS, MOOD_COLORS } from '../constants';
import { getDailyInsight } from '../services/geminiService';
import { BookOpen, Smile, AlertTriangle, Sparkles, Clock, Save, BrainCircuit, Check } from 'lucide-react';

interface DiaryReflectionProps {
  log: DailyLog;
  tasks: Task[];
  studySessions: StudySession[];
  onUpdateLog: (log: DailyLog) => void;
}

const DiaryReflection: React.FC<DiaryReflectionProps> = ({ log, tasks, studySessions, onUpdateLog }) => {
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Journal' | 'Reflection'>('Journal');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Local state for the text input (controller)
  const [noteInput, setNoteInput] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Helper for sub-components to update the log
  const updateLog = (partial: Partial<DailyLog>) => {
    onUpdateLog({ ...log, ...partial });
  };

  const handleTimeBlockAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      startTime: formData.get('start') as string,
      endTime: formData.get('end') as string,
      activity: formData.get('activity') as string,
    };
    updateLog({ timeBlocks: [...log.timeBlocks, newBlock] });
    e.currentTarget.reset();
  };

  const handleSaveEntry = () => {
    if (!noteInput.trim()) return;

    // Append new entry to existing log with a separator
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entryToAdd = `[${timestamp}] ${noteInput}`;
    const newDiaryEntry = log.diaryEntry 
      ? `${log.diaryEntry}\n\n${entryToAdd}` 
      : entryToAdd;

    updateLog({ diaryEntry: newDiaryEntry });
    
    // Clear input and show success message
    setNoteInput('');
    setShowSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const generateInsight = async () => {
    setIsGenerating(true);
    const insight = await getDailyInsight(log, tasks, studySessions);
    setAiInsight(insight);
    setIsGenerating(false);
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg border border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button 
          onClick={() => setActiveTab('Timeline')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'Timeline' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <Clock className="w-4 h-4" /> Timeline
        </button>
        <button 
          onClick={() => setActiveTab('Journal')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'Journal' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <BookOpen className="w-4 h-4" /> Journal
        </button>
        <button 
          onClick={() => setActiveTab('Reflection')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'Reflection' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Gap Analysis
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'Timeline' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Life Logger</h3>
            <p className="text-sm text-gray-400">Log specific time blocks to track where your time actually goes.</p>
            
            <form onSubmit={handleTimeBlockAdd} className="bg-dark p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required name="start" type="time" className="bg-surface border border-gray-600 rounded p-2 text-white text-sm" />
                <input required name="end" type="time" className="bg-surface border border-gray-600 rounded p-2 text-white text-sm" />
              </div>
              <input required name="activity" type="text" placeholder="Activity (e.g., Gossip, Scroll, Gym)" className="w-full bg-surface border border-gray-600 rounded p-2 text-white text-sm" />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded text-sm font-medium">Add Block</button>
            </form>

            <div className="space-y-2 relative border-l-2 border-gray-700 ml-3 pl-6 py-2">
               {log.timeBlocks.length === 0 && <p className="text-gray-500 text-sm italic">No time logs yet.</p>}
               {log.timeBlocks.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(block => (
                 <div key={block.id} className="relative mb-4 last:mb-0">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-gray-900"></div>
                    <span className="text-xs text-indigo-300 font-mono">{block.startTime} - {block.endTime}</span>
                    <p className="text-white font-medium">{block.activity}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'Journal' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">How was your mood today?</label>
              <div className="flex flex-wrap gap-3">
                {MOODS.map(m => (
                  <button
                    key={m}
                    onClick={() => updateLog({ mood: m })}
                    className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${log.mood === m ? 'bg-opacity-20 border-opacity-100 scale-105' : 'bg-transparent border-gray-600 opacity-60 hover:opacity-100'}`}
                    style={{ 
                      borderColor: MOOD_COLORS[m], 
                      backgroundColor: log.mood === m ? MOOD_COLORS[m] : undefined,
                      color: log.mood === m ? MOOD_COLORS[m] : 'white'
                    }}
                  >
                    <Smile className="w-4 h-4" /> {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Read-only view of saved entries */}
            {log.diaryEntry && (
              <div className="bg-black/20 p-4 rounded-lg border border-gray-700 animate-fade-in">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Today's Entries</h4>
                <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {log.diaryEntry}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">New Entry</label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Write about your day..."
                className="w-full h-32 bg-dark border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
               {showSaveSuccess && (
                 <div className="flex items-center text-green-400 text-sm font-medium animate-bounce-short bg-green-400/10 px-3 py-2 rounded-lg border border-green-500/20">
                     <Check className="w-4 h-4 mr-2" /> Entry Saved! +5 XP
                 </div>
               )}
               <button 
                  onClick={handleSaveEntry}
                  disabled={!noteInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
               >
                  <Save className="w-4 h-4" /> Save Entry
               </button>
            </div>
          </div>
        )}

        {activeTab === 'Reflection' && (
          <div className="space-y-6">
             <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                <h4 className="text-orange-400 font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> End-of-Day Analysis</h4>
                <p className="text-xs text-orange-200/70 mt-1">Be honest. This is for your growth.</p>
             </div>

             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">What went wrong?</label>
                 <textarea 
                    value={log.reflection?.wentWrong || ''}
                    onChange={(e) => updateLog({ reflection: { ...log.reflection!, wentWrong: e.target.value } })}
                    className="w-full bg-dark border border-gray-600 rounded p-3 text-white text-sm focus:border-red-500 outline-none transition-colors"
                    rows={2}
                 />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Major Distractions</label>
                 <textarea 
                    value={log.reflection?.distractions || ''}
                    onChange={(e) => updateLog({ reflection: { ...log.reflection!, distractions: e.target.value } })}
                    className="w-full bg-dark border border-gray-600 rounded p-3 text-white text-sm focus:border-red-500 outline-none transition-colors"
                    rows={2}
                 />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Improvements for Tomorrow</label>
                 <textarea 
                    value={log.reflection?.improvements || ''}
                    onChange={(e) => updateLog({ reflection: { ...log.reflection!, improvements: e.target.value } })}
                    className="w-full bg-dark border border-gray-600 rounded p-3 text-white text-sm focus:border-green-500 outline-none transition-colors"
                    rows={2}
                 />
               </div>
             </div>

             {/* AI Section */}
             <div className="border-t border-gray-700 pt-6">
               {!aiInsight ? (
                 <button
                   onClick={generateInsight}
                   disabled={isGenerating || !log.diaryEntry}
                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isGenerating ? (
                     <span className="animate-pulse">Consulting AI Coach...</span>
                   ) : (
                     <>
                        <Sparkles className="w-5 h-5" /> Analyze My Day with Gemini
                     </>
                   )}
                 </button>
               ) : (
                  <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-5 rounded-lg animate-fade-in">
                    <h5 className="flex items-center gap-2 text-indigo-300 font-semibold mb-2">
                       <BrainCircuit className="w-5 h-5" /> Gemini Coach says:
                    </h5>
                    <p className="text-gray-200 text-sm leading-relaxed italic">
                      "{aiInsight}"
                    </p>
                    <button onClick={() => setAiInsight('')} className="text-xs text-indigo-400 mt-4 hover:text-indigo-300 underline">Close</button>
                  </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryReflection;