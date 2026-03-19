import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  AlertCircle,
  Calendar,
  RefreshCw,
  Edit2,
  X,
  Check,
  Target,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Home,
  LayoutGrid,
  MoreVertical
} from 'lucide-react';

// --- Constants & Helpers ---
const DAYS_KOR = ['일', '월', '화', '수', '목', '금', '토'];

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateStatus = (task) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextDate;

  if (task.mode === 'once') {
    nextDate = new Date(task.targetDate);
    nextDate.setHours(0, 0, 0, 0);
  } else if (task.mode === 'weekly' && task.daysOfWeek && task.daysOfWeek.length > 0) {
    const last = new Date(task.lastCleaned);
    last.setHours(0, 0, 0, 0);
    let checkDate = new Date(last);
    if (last.getTime() === today.getTime()) {
      checkDate.setDate(checkDate.getDate() + 1);
    } else {
      checkDate = new Date(today);
    }
    for (let i = 0; i < 7; i++) {
      if (task.daysOfWeek.includes(checkDate.getDay())) {
        nextDate = new Date(checkDate);
        break;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
  } else {
    const last = new Date(task.lastCleaned);
    last.setHours(0, 0, 0, 0);
    nextDate = new Date(last);
    nextDate.setDate(nextDate.getDate() + (Number(task.frequencyDays) || 1));
  }

  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays), nextDate };
  if (diffDays === 0) return { status: 'today', days: 0, nextDate };
  return { status: 'upcoming', days: diffDays, nextDate };
};

// --- Components ---
const BroomIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.2 20.8A3.1 3.1 0 0 0 7.6 22l6.8-6.8-5.6-5.6L3.2 16.4a3.1 3.1 0 0 0 0 4.4Z"/>
    <path d="M11 14.2 20.8 4.4a2.1 2.1 0 0 0-3-3L8 11.2"/>
  </svg>
);

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('cleanly-tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '거실 청소기', mode: 'daily', frequencyDays: 3, lastCleaned: '2026-03-16' },
      { id: 2, name: '분리수거', mode: 'weekly', daysOfWeek: [1, 4], lastCleaned: '2026-03-16' },
      { id: 3, name: '에어컨 필터 교체', mode: 'once', targetDate: '2026-04-01', lastCleaned: '2000-01-01' },
    ];
  });

  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('cleanly-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const { overdueTasks, todayTasks, upcomingTasks } = useMemo(() => {
    const overdue = [];
    const today = [];
    const upcoming = [];
    tasks.forEach(task => {
      const { status, days, nextDate } = calculateStatus(task);
      const taskWithStatus = { ...task, status, days, nextDate };
      if (status === 'overdue') overdue.push(taskWithStatus);
      else if (status === 'today') today.push(taskWithStatus);
      else upcoming.push(taskWithStatus);
    });
    upcoming.sort((a, b) => a.days - b.days);
    overdue.sort((a, b) => b.days - a.days);
    return { overdueTasks: overdue, todayTasks: today, upcomingTasks: upcoming };
  }, [tasks]);

  const handleMarkAsDone = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, lastCleaned: getTodayString() } : t));
  };

  const handleAddTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: Date.now(), lastCleaned: '2000-01-01' }]);
    setIsModalOpen(false);
    setActiveTab('home');
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FE] text-slate-900 max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 bg-white shrink-0 border-b border-slate-50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-blue-600 flex items-center gap-2 tracking-tight">
              <Sparkles size={24} fill="currentColor" />
              CLEANLY
            </h1>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">
              {getTodayString()} • {DAYS_KOR[new Date().getDay()]}요일
            </p>
          </div>
          <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-600">
            <LayoutGrid size={20} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-32 pt-4">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-xl shadow-blue-200">
              <div className="flex justify-between items-center mb-4">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Sun size={20} />
                </div>
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">LIVE</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {overdueTasks.length + todayTasks.length > 0 ? '청소를 시작해볼까요?' : '정말 깨끗한 하루네요!'}
              </div>
              <p className="text-xs opacity-80 font-medium">
                {overdueTasks.length > 0 ? `${overdueTasks.length}개의 일정이 지연되었습니다.` : '현재 밀린 일정이 없습니다.'}
              </p>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h2 className="font-black text-slate-800 text-xl tracking-tight">오늘 할 일</h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  {overdueTasks.length + todayTasks.length}건
                </span>
              </div>
              
              {[...overdueTasks, ...todayTasks].length === 0 && (
                <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
                  <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <p className="text-sm text-slate-500 font-bold">완벽하게 관리되고 있어요</p>
                </div>
              )}

              {[...overdueTasks, ...todayTasks].map(task => (
                <MobileTaskCard 
                  key={task.id} 
                  task={task} 
                  onDone={handleMarkAsDone} 
                  onEdit={() => setEditingTask(task)}
                />
              ))}

              <h2 className="font-black text-slate-800 text-xl pt-4 tracking-tight">예정된 일정</h2>
              <div className="space-y-3">
                {upcomingTasks.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-4">등록된 일정이 없습니다.</p>
                )}
                {upcomingTasks.map(task => (
                  <MobileTaskCard 
                    key={task.id} 
                    task={task} 
                    onDone={handleMarkAsDone}
                    onEdit={() => setEditingTask(task)}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-6 pt-2">
            <h2 className="text-2xl font-black tracking-tight">오늘의 날씨</h2>
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm text-center">
              <div className="bg-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sun size={48} className="text-amber-500" />
              </div>
              <div className="text-6xl font-black text-slate-900 mb-2">18°</div>
              <div className="text-lg font-bold text-slate-500 mb-8">서울, 맑음</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-3xl p-4">
                  <Droplets size={20} className="mx-auto mb-2 text-blue-500" />
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">습도</div>
                  <div className="font-black text-slate-800">45%</div>
                </div>
                <div className="bg-slate-50 rounded-3xl p-4">
                  <Wind size={20} className="mx-auto mb-2 text-slate-400" />
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">바람</div>
                  <div className="font-black text-slate-800">2.4m/s</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
              <p className="text-sm font-bold text-blue-700 leading-relaxed">
                "창밖이 맑고 미세먼지가 적은 날입니다. 청소기를 돌린 후 15분 정도 맞통풍 환기를 시켜주세요!"
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-10 pb-8 pt-4 flex justify-between items-center z-40">
        <NavButton active={activeTab === 'home'} icon={<Home size={24} />} label="홈" onClick={() => setActiveTab('home')} />
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-200 -mt-14 border-[6px] border-[#F8F9FE] active:scale-90 transition-transform"
        >
          <Plus size={28} strokeWidth={3} />
        </button>

        <NavButton active={activeTab === 'weather'} icon={<CloudRain size={24} />} label="날씨" onClick={() => setActiveTab('weather')} />
      </nav>

      {/* Modals */}
      {isModalOpen && <TaskFormModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddTask} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} onSubmit={handleUpdateTask} onDelete={handleDelete} />}
    </div>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-300'}`}>
      {icon}
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function MobileTaskCard({ task, onDone, onEdit, compact = false }) {
  const isOverdue = task.status === 'overdue';
  const isToday = task.status === 'today';

  return (
    <div className={`bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex items-center gap-4 active:scale-95 transition-transform ${isOverdue ? 'bg-red-50/30' : ''}`}>
      <div className={`p-3.5 rounded-2xl ${isOverdue ? 'bg-red-100 text-red-500' : isToday ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
        <BroomIcon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-slate-800 truncate tracking-tight">{task.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[11px] font-black ${isOverdue ? 'text-red-500' : isToday ? 'text-blue-600' : 'text-slate-400'}`}>
            {isOverdue ? `지연 D+${task.days}` : isToday ? '오늘' : `D-${task.days}`}
          </span>
          <span className="text-slate-200 text-[10px]">|</span>
          <span className="text-[11px] font-bold text-slate-400">
            {task.mode === 'daily' ? `${task.frequencyDays}일 주기` : task.mode === 'weekly' ? '요일' : '지정일'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!compact && (
          <button 
            onClick={() => onDone(task.id)}
            className={`p-2.5 rounded-xl text-white shadow-lg ${isOverdue ? 'bg-red-500 shadow-red-100' : 'bg-blue-600 shadow-blue-100'}`}
          >
            <Check size={18} strokeWidth={4} />
          </button>
        )}
        <button onClick={onEdit} className="p-2 text-slate-300">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}

function TaskFormModal({ task, onClose, onSubmit, onDelete }) {
  const [name, setName] = useState(task?.name || '');
  const [mode, setMode] = useState(task?.mode || 'daily');
  const [freq, setFreq] = useState(task?.frequencyDays || 3);
  const [days, setDays] = useState(task?.daysOfWeek || []);
  const [date, setDate] = useState(task?.targetDate || getTodayString());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      ...(task || {}),
      name, mode, 
      frequencyDays: mode === 'daily' ? Number(freq) : null,
      daysOfWeek: mode === 'weekly' ? days : null,
      targetDate: mode === 'once' ? date : null
    });
  };

  const toggleDay = (idx) => {
    setDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-[48px] p-8 pb-12 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2" onClick={onClose} />
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight">{task ? '계획 수정' : '새 청소 추가'}</h2>
          <button onClick={onClose} className="bg-slate-100 p-2.5 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">청소 항목 이름</label>
            <input 
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
              placeholder="무엇을 청소할까요?" autoFocus
            />
          </div>

          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            {['daily', 'weekly', 'once'].map(m => (
              <button 
                key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${mode === m ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                {m === 'daily' ? '간격' : m === 'weekly' ? '요일' : '지정일'}
              </button>
            ))}
          </div>

          {mode === 'daily' && (
            <div className="flex items-center justify-between bg-slate-50 rounded-3xl px-6 py-5">
              <span className="font-bold text-slate-700 text-sm">반복 간격</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" value={freq} onChange={(e) => setFreq(e.target.value)}
                  className="w-12 text-center bg-transparent font-black text-blue-600 text-xl outline-none"
                />
                <span className="text-xs font-black text-slate-400 uppercase">DAYS</span>
              </div>
            </div>
          )}

          {mode === 'weekly' && (
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_KOR.map((day, idx) => (
                <button
                  key={day} type="button" onClick={() => toggleDay(idx)}
                  className={`h-11 text-xs font-black rounded-xl border-2 transition-all ${days.includes(idx) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}
                >{day}</button>
              ))}
            </div>
          )}

          {mode === 'once' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">날짜 선택</label>
              <input 
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 rounded-3xl px-6 py-5 font-black text-blue-600 outline-none border-none text-lg"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {task && (
              <button 
                type="button" onClick={() => onDelete(task.id)}
                className="bg-red-50 text-red-500 p-5 rounded-3xl active:scale-90 transition-transform"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[28px] shadow-xl shadow-blue-100 active:scale-95 transition-transform"
            >
              {task ? '수정 완료' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}