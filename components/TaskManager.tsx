import React, { useState } from 'react';
import { Task, Category } from '../types';
import { CATEGORIES } from '../constants';
import { Plus, Check, X, Circle, Trash2, Calendar } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (id: string, status: Task['status']) => void;
  onDeleteTask: (id: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Study');
  const [filter, setFilter] = useState<'All' | Category>('All');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    onAddTask({
      title: newTaskTitle,
      category: selectedCategory,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });
    setNewTaskTitle('');
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.category === filter);

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <form onSubmit={handleAdd} className="bg-surface p-4 rounded-xl shadow border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new goal..."
            className="flex-1 bg-dark border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="bg-dark border border-gray-600 rounded-lg p-3 text-white outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg flex items-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        <button
          onClick={() => setFilter('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'All' ? 'bg-indigo-600 text-white' : 'bg-surface text-gray-300 hover:bg-gray-700'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-surface text-gray-300 hover:bg-gray-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No tasks found for this category.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`group bg-surface rounded-xl p-4 border transition-all ${task.status === 'Completed' ? 'border-green-500/50 opacity-70' : task.status === 'Skipped' ? 'border-red-500/50 opacity-70' : 'border-gray-700 hover:border-indigo-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                   <div className={`p-2 rounded-full ${
                     task.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                     task.status === 'Skipped' ? 'bg-red-500/20 text-red-500' :
                     'bg-gray-700 text-gray-400'
                   }`}>
                      {task.status === 'Completed' ? <Check className="w-5 h-5" /> :
                       task.status === 'Skipped' ? <X className="w-5 h-5" /> :
                       <Circle className="w-5 h-5" />}
                   </div>
                   <div>
                     <h3 className={`font-medium text-white ${task.status !== 'Pending' ? 'line-through text-gray-400' : ''}`}>
                       {task.title}
                     </h3>
                     <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                       <span className={`px-2 py-0.5 rounded bg-gray-700 ${
                         task.category === 'Study' ? 'text-blue-300' :
                         task.category === 'Work' ? 'text-orange-300' :
                         task.category === 'Health' ? 'text-green-300' : 'text-purple-300'
                       }`}>{task.category}</span>
                       <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {task.date}</span>
                     </div>
                   </div>
                </div>

                <div className="flex items-center space-x-2">
                  {task.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onUpdateTask(task.id, 'Completed')}
                        title="Complete (+10 XP)"
                        className="p-2 hover:bg-green-500/20 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onUpdateTask(task.id, 'Skipped')}
                        title="Skip (-5 XP)"
                        className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 hover:bg-gray-700 text-gray-500 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
