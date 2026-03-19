<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Cleanly - 우리집 청소 알리미</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;700;900&display=swap');
        body { font-family: 'Pretendard', sans-serif; -webkit-tap-highlight-color: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes move-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-move-up { animation: move-up 0.3s ease-out; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useMemo } = React;

        /**
         * Lucide 아이콘 에러 방지를 위한 컴포넌트
         * 에러 #130을 방지하기 위해 lucide.icons[name]이 유효한지 체크합니다.
         */
        const Icon = ({ name, size = 24, className = "" }) => {
            try {
                // lucide 객체나 icons가 아직 로드되지 않았을 경우 대비
                if (typeof lucide === 'undefined' || !lucide.icons || !lucide.icons[name]) {
                    return <span style={{ width: size, height: size, display: 'inline-block' }} className={className}></span>;
                }
                const LucideIcon = lucide.icons[name];
                return <LucideIcon size={size} className={className} />;
            } catch (e) {
                console.error("Icon rendering error:", e);
                return null;
            }
        };

        // --- Helpers ---
        const DAYS_KOR = ['일', '월', '화', '수', '목', '금', '토'];
        const getTodayString = () => {
            const today = new Date();
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        };

        const calculateStatus = (task) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let nextDate;

            try {
                if (task.mode === 'once') {
                    nextDate = new Date(task.targetDate);
                } else if (task.mode === 'weekly') {
                    let checkDate = new Date(task.lastCleaned === '2000-01-01' ? today : task.lastCleaned);
                    checkDate.setHours(0,0,0,0);
                    if (task.lastCleaned !== '2000-01-01') checkDate.setDate(checkDate.getDate() + 1);
                    else checkDate = new Date(today);

                    for (let i = 0; i < 7; i++) {
                        if (task.daysOfWeek && task.daysOfWeek.includes(checkDate.getDay())) {
                            nextDate = new Date(checkDate);
                            break;
                        }
                        checkDate.setDate(checkDate.getDate() + 1);
                    }
                } else {
                    const last = new Date(task.lastCleaned === '2000-01-01' ? today : task.lastCleaned);
                    last.setHours(0,0,0,0);
                    nextDate = new Date(last);
                    if (task.lastCleaned !== '2000-01-01') {
                        nextDate.setDate(nextDate.getDate() + Number(task.frequencyDays || 1));
                    }
                }
            } catch (e) {
                nextDate = new Date(today);
            }
            
            if (!nextDate || isNaN(nextDate.getTime())) nextDate = new Date(today);
            nextDate.setHours(0,0,0,0);
            const diffTime = nextDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays), nextDate };
            if (diffDays === 0) return { status: 'today', days: 0, nextDate };
            return { status: 'upcoming', days: diffDays, nextDate };
        };

        // --- Main App ---
        function App() {
            const [tasks, setTasks] = useState(() => {
                try {
                    const saved = localStorage.getItem('cleanly-tasks');
                    return saved ? JSON.parse(saved) : [
                        { id: 1, name: '거실 청소기', mode: 'daily', frequencyDays: 3, lastCleaned: '2026-03-16' },
                        { id: 2, name: '분리수거', mode: 'weekly', daysOfWeek: [1, 4], lastCleaned: '2026-03-16' }
                    ];
                } catch (e) {
                    return [];
                }
            });

            const [activeTab, setActiveTab] = useState('home');
            const [isModalOpen, setIsModalOpen] = useState(false);

            useEffect(() => {
                localStorage.setItem('cleanly-tasks', JSON.stringify(tasks));
            }, [tasks]);

            const { overdueTasks, todayTasks } = useMemo(() => {
                const overdue = [], todayList = [];
                tasks.forEach(task => {
                    const statusInfo = calculateStatus(task);
                    const t = { ...task, ...statusInfo };
                    if (t.status === 'overdue') overdue.push(t);
                    else if (t.status === 'today') todayList.push(t);
                });
                return { 
                    overdueTasks: overdue.sort((a,b) => b.days - a.days), 
                    todayTasks: todayList
                };
            }, [tasks]);

            const handleComplete = (id) => {
                setTasks(prev => prev.map(t => t.id === id ? {...t, lastCleaned: getTodayString()} : t));
            };

            const handleDelete = (id) => {
                setTasks(prev => prev.filter(t => t.id !== id));
            };

            return (
                <div className="flex flex-col h-screen bg-[#F8F9FE] max-w-md mx-auto relative overflow-hidden">
                    <header className="px-6 pt-12 pb-4 bg-white border-b border-slate-50 shrink-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-black text-blue-600 flex items-center gap-2">
                                    <Icon name="Sparkles" /> CLEANLY
                                </h1>
                                <p className="text-[11px] text-slate-400 font-bold uppercase">
                                    {getTodayString()} • {DAYS_KOR[new Date().getDay()]}요일
                                </p>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto px-6 pb-32 pt-4 no-scrollbar">
                        {activeTab === 'home' ? (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-6 text-white shadow-xl">
                                    <div className="text-2xl font-bold mb-1">
                                        {overdueTasks.length + todayTasks.length > 0 ? '청소를 시작할까요?' : '정말 깨끗해요!'}
                                    </div>
                                    <p className="text-xs opacity-80">{overdueTasks.length}개의 일정이 지연됨</p>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="font-black text-slate-800 text-xl">오늘 할 일</h2>
                                    {[...overdueTasks, ...todayTasks].length === 0 && (
                                        <div className="bg-white rounded-[28px] p-8 text-center border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-400 font-bold">모든 청소를 완료했습니다!</p>
                                        </div>
                                    )}
                                    {[...overdueTasks, ...todayTasks].map(t => (
                                        <div key={t.id} className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-black text-slate-800">{t.name}</h3>
                                                <p className={`text-[11px] font-bold ${t.status === 'overdue' ? 'text-red-500' : 'text-blue-600'}`}>
                                                    {t.status === 'overdue' ? `지연 D+${t.days}` : '오늘'}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleComplete(t.id)} 
                                                className="bg-blue-600 text-white p-2.5 rounded-xl active:scale-90 transition-transform"
                                            >
                                                <Icon name="Check" size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(t.id)} 
                                                className="text-slate-300 p-2 active:text-red-400"
                                            >
                                                <Icon name="Trash2" size={18}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="pt-8 text-center">
                                <Icon name="Sun" size={64} className="mx-auto text-amber-500 mb-4" />
                                <h2 className="text-3xl font-black text-slate-800">18° 맑음</h2>
                                <p className="text-slate-500 font-bold mt-2">환기하기 좋은 날씨입니다!</p>
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
                                        <Icon name="Droplets" className="mx-auto text-blue-400 mb-2" />
                                        <div className="text-[10px] text-slate-400 font-bold">습도</div>
                                        <div className="font-black text-slate-800">45%</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
                                        <Icon name="Wind" className="mx-auto text-slate-400 mb-2" />
                                        <div className="text-[10px] text-slate-400 font-bold">미세먼지</div>
                                        <div className="font-black text-green-500">좋음</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-10 pb-8 pt-4 flex justify-between items-center z-40">
                        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-blue-600' : 'text-slate-300'}><Icon name="Home" /></button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl -mt-14 border-[6px] border-[#F8F9FE] active:scale-95 transition-transform"><Icon name="Plus" /></button>
                        <button onClick={() => setActiveTab('weather')} className={activeTab === 'weather' ? 'text-blue-600' : 'text-slate-300'}><Icon name="CloudRain" /></button>
                    </nav>

                    {isModalOpen && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end">
                            <div className="bg-white rounded-t-[40px] p-8 pb-12 space-y-6 animate-move-up">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black">새 청소 추가</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-300"><Icon name="X" /></button>
                                </div>
                                <input id="taskName" className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border-none focus:ring-2 focus:ring-blue-500" placeholder="항목 이름 (예: 침구 정리)" />
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        const input = document.getElementById('taskName');
                                        const name = input.value;
                                        if(name) {
                                            setTasks(prev => [...prev, { id: Date.now(), name, mode: 'daily', frequencyDays: 3, lastCleaned: '2000-01-01' }]);
                                            setIsModalOpen(false);
                                        }
                                    }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-transform">추가하기</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>