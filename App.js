<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Cleanly - 우리집 청소 알리미</title>
    <!-- 더 안정적인 cdnjs 라이브러리 사용 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;700;900&display=swap');
        body { 
            font-family: 'Pretendard', sans-serif; 
            -webkit-tap-highlight-color: transparent;
            background-color: #F8F9FE;
            margin: 0;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useMemo } = React;

        // --- 인라인 SVG 아이콘 (외부 로딩 없음) ---
        const Icons = {
            Sparkles: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
                </svg>
            ),
            Check: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            ),
            Trash2: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
            ),
            Home: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
            ),
            CloudRain: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>
                </svg>
            ),
            Plus: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            ),
            X: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            ),
            Sun: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                </svg>
            ),
            Droplets: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-6-4-6s-4 2.7-4 6c0 2.2 1.8 4 4 4Z"/><path d="M17 18.5c2.5 0 4.5-2 4.5-4.5 0-3.7-4.5-7-4.5-7s-4.5 3.3-4.5 7c0 2.5 2 4.5 4.5 4.5Z"/>
                </svg>
            ),
            Wind: ({ size = 24, className = "" }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
                </svg>
            )
        };

        const DAYS_KOR = ['일', '월', '화', '수', '목', '금', '토'];
        const getTodayString = () => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        };

        const calculateStatus = (task) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let lastDate = new Date(task.lastCleaned === '2000-01-01' ? '2020-01-01' : task.lastCleaned);
            lastDate.setHours(0, 0, 0, 0);
            
            let nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + (task.frequencyDays || 1));
            
            if (task.lastCleaned === '2000-01-01') nextDate = new Date(today);

            const diffTime = nextDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays) };
            if (diffDays === 0) return { status: 'today', days: 0 };
            return { status: 'upcoming', days: diffDays };
        };

        function App() {
            const [tasks, setTasks] = useState(() => {
                try {
                    const saved = localStorage.getItem('cleanly_v2_tasks');
                    return saved ? JSON.parse(saved) : [
                        { id: 1, name: '거실 청소기 돌리기', frequencyDays: 2, lastCleaned: getTodayString() },
                        { id: 2, name: '욕실 물때 제거', frequencyDays: 7, lastCleaned: '2020-01-01' }
                    ];
                } catch (e) {
                    return [];
                }
            });

            const [activeTab, setActiveTab] = useState('home');
            const [isModalOpen, setIsModalOpen] = useState(false);
            const [newTaskName, setNewTaskName] = useState('');

            useEffect(() => {
                localStorage.setItem('cleanly_v2_tasks', JSON.stringify(tasks));
            }, [tasks]);

            const sortedTasks = useMemo(() => {
                return tasks.map(t => ({ ...t, ...calculateStatus(t) }))
                            .sort((a, b) => {
                                if (a.status === 'overdue' && b.status !== 'overdue') return -1;
                                if (b.status === 'overdue' && a.status !== 'overdue') return 1;
                                return a.days - b.days;
                            });
            }, [tasks]);

            const addTask = () => {
                if (!newTaskName.trim()) return;
                const newTask = {
                    id: Date.now(),
                    name: newTaskName,
                    frequencyDays: 3,
                    lastCleaned: '2000-01-01'
                };
                setTasks([...tasks, newTask]);
                setNewTaskName('');
                setIsModalOpen(false);
            };

            const completeTask = (id) => {
                setTasks(tasks.map(t => t.id === id ? { ...t, lastCleaned: getTodayString() } : t));
            };

            const deleteTask = (id) => {
                setTasks(tasks.filter(t => t.id !== id));
            };

            return (
                <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden shadow-2xl bg-[#F8F9FE]">
                    <header className="px-6 pt-12 pb-6 bg-white shrink-0 border-b border-slate-100">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-black text-blue-600 flex items-center gap-2">
                                    <Icons.Sparkles size={28} /> CLEANLY
                                </h1>
                                <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-wider uppercase">
                                    {getTodayString()} • {DAYS_KOR[new Date().getDay()]}요일
                                </p>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto px-6 pt-6 pb-32 no-scrollbar">
                        {activeTab === 'home' ? (
                            <div className="space-y-8">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-lg shadow-blue-200">
                                    <h2 className="text-xl font-bold mb-1">반가워요! 👋</h2>
                                    <p className="text-sm opacity-90 font-medium">
                                        오늘 해결할 청소가 {sortedTasks.filter(t => t.status !== 'upcoming').length}개 있습니다.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-slate-800">청소 목록</h3>
                                    {sortedTasks.length === 0 ? (
                                        <div className="text-center py-12 opacity-40 font-bold text-slate-400">
                                            등록된 청소가 없습니다.
                                        </div>
                                    ) : (
                                        sortedTasks.map(task => (
                                            <div key={task.id} className="bg-white rounded-[24px] p-5 flex items-center gap-4 border border-slate-50 shadow-sm transition-all active:scale-[0.98]">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 leading-tight">{task.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                                                            task.status === 'overdue' ? 'bg-red-50 text-red-500' : 
                                                            task.status === 'today' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                                                        }`}>
                                                            {task.status === 'overdue' ? `D+${task.days}` : task.status === 'today' ? 'TODAY' : `D-${task.days}`}
                                                        </span>
                                                        <span className="text-[10px] text-slate-300 font-bold">주기: {task.frequencyDays}일</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => completeTask(task.id)}
                                                    className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center active:bg-blue-600 active:text-white transition-colors"
                                                >
                                                    <Icons.Check size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteTask(task.id)}
                                                    className="w-10 h-10 rounded-xl text-slate-200 flex items-center justify-center active:text-red-500 transition-colors"
                                                >
                                                    <Icons.Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-12 text-center">
                                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
                                    <Icons.Sun size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800">18°C 맑음</h2>
                                <p className="text-slate-500 font-bold mt-2 leading-relaxed">
                                    공기 질이 아주 좋습니다.<br/>창문을 열고 환기를 시켜보세요!
                                </p>
                                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white p-5 rounded-3xl border border-slate-50 text-center shadow-sm">
                                        <Icons.Droplets className="mx-auto text-blue-400 mb-2" size={24} />
                                        <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase">습도</div>
                                        <div className="font-black text-slate-800 text-lg">45%</div>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl border border-slate-50 text-center shadow-sm">
                                        <Icons.Wind className="mx-auto text-emerald-400 mb-2" size={24} />
                                        <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase">미세먼지</div>
                                        <div className="font-black text-emerald-500 text-lg">좋음</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-100 px-10 pb-10 pt-4 flex justify-between items-center z-40">
                        <button onClick={() => setActiveTab('home')} className={`p-2 transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-300'}`}>
                            <Icons.Home size={28} />
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white w-14 h-14 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center -mt-16 border-[6px] border-[#F8F9FE] active:scale-90 transition-transform"
                        >
                            <Icons.Plus size={28} />
                        </button>
                        <button onClick={() => setActiveTab('weather')} className={`p-2 transition-colors ${activeTab === 'weather' ? 'text-blue-600' : 'text-slate-300'}`}>
                            <Icons.CloudRain size={28} />
                        </button>
                    </nav>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-end">
                            <div className="bg-white rounded-t-[40px] p-8 pb-12 animate-slide-up shadow-2xl">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-slate-800">새 청소 추가</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-300 p-1">
                                        <Icons.X size={24} />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase ml-1">항목 이름</label>
                                        <input 
                                            value={newTaskName}
                                            onChange={(e) => setNewTaskName(e.target.value)}
                                            className="w-full bg-slate-50 rounded-2xl p-5 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                                            placeholder="예: 창틀 닦기, 에어컨 필터"
                                        />
                                    </div>
                                    <button 
                                        onClick={addTask}
                                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
                                    >
                                        추가하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // DOM이 완전히 로드된 후 실행되도록 보장
        window.onload = () => {
            const rootElement = document.getElementById('root');
            if (rootElement) {
                const root = ReactDOM.createRoot(rootElement);
                root.render(<App />);
            }
        };
    </script>
</body>
</html>