import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

function ManagerDashboard() {
  const navigate = useNavigate();
  
  const [intersectionFilter, setIntersectionFilter] = useState('top5');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const weeklySafetyAlertsData = [];
  const allTargetTypeData = [];
  const severityData = [];
  
  let displayData = allTargetTypeData;
  if (intersectionFilter === 'top5') {
    displayData = [...allTargetTypeData]
      .sort((a,b) => (b.children + b.adults + b.vehicles) - (a.children + a.adults + a.vehicles))
      .slice(0, 5);
  } else if (intersectionFilter === 'school') {
    displayData = allTargetTypeData.filter(d => d.type === 'school');
  }

  const severityColors = ['#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* תפריט צד מותאם למובייל */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:p-6 flex flex-col md:justify-between shadow-xl z-20 shrink-0 md:h-full">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-center border-b border-slate-700 pb-4">
            SafeCross 🚦<br/><span className="text-xs md:text-sm font-normal text-slate-400">ניהול אזורי</span>
          </h1>
          <nav className="flex flex-row md:flex-col gap-2 md:gap-3 text-slate-300 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
            <button className="text-right hover:text-white bg-slate-800 px-4 py-2 md:p-3 rounded font-medium transition shadow-sm border border-slate-700 text-blue-400 text-sm md:text-base">
              📊 לוח בקרה ראשי
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 px-4 py-2 md:p-3 rounded transition text-sm md:text-base">
              📑 דוחות סטטיסטיים
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 px-4 py-2 md:p-3 rounded transition text-sm md:text-base">
              👥 ניהול צוות מוקדנים
            </button>
          </nav>
        </div>
        
        <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-stretch gap-3 mt-4 md:mt-0">
            <div className="bg-slate-800 px-3 py-2 md:p-3 rounded text-xs md:text-sm text-center border border-slate-700">
              מנהל מחובר: אזור מרכז
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition font-bold shadow-md text-sm md:text-base"
            >
                התנתק
            </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 flex flex-col overflow-y-auto w-full">
        <header className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">מבט על אזורי - ניתוח בטיחות</h2>
            <p className="text-sm md:text-base text-slate-500 mt-1">פילוח נתוני AI וביצועי צמתים בשבוע האחרון</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-50 transition font-medium w-full sm:w-auto text-sm md:text-base flex justify-center">
                יצא דוח PDF 📥
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">אירועי AI</span>
                <span className="text-2xl md:text-3xl font-black text-slate-800 mt-1">0</span>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">סכנה (90%+)</span>
                <span className="text-2xl md:text-3xl font-black text-red-600 mt-1">0</span>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">זמן תגובה</span>
                <span className="text-2xl md:text-3xl font-black text-slate-800 mt-1">0 <span className="text-sm md:text-lg font-medium">דק'</span></span>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">צמתים פעילים</span>
                <span className="text-2xl md:text-3xl font-black text-blue-600 mt-1">0 / 0</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="font-bold text-slate-700 text-sm md:text-base">
                        {intersectionFilter === 'top5' ? '5 הצמתים עם כמות אירועי הסכנה הגבוהה ביותר' : 
                         intersectionFilter === 'school' ? 'אירועי סכנה בקרבת מוסדות חינוך' : 'אירועי סכנה בכלל הצמתים'}
                    </h3>
                    <select 
                        value={intersectionFilter}
                        onChange={(e) => setIntersectionFilter(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-600 outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto"
                    >
                        <option value="top5">🔥 5 המסוכנים ביותר</option>
                        <option value="school">🏫 סביבת מוסדות חינוך</option>
                        <option value="all">🚦 כל הצמתים</option>
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={displayData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 11}} />
                            <YAxis tick={{fill: '#64748b', fontSize: 11}} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} />
                            <Legend wrapperStyle={{fontSize: '11px'}} />
                            <Bar dataKey="children" name="ילדים" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="adults" name="מבוגרים" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="vehicles" name="רכבים" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col">
                <h3 className="font-bold text-slate-700 mb-1 text-sm md:text-base">מגמת עומס אירועי בטיחות (שבועי)</h3>
                <p className="text-xs text-slate-500 mb-4">משקף סכנות מבוססות AI בלבד</p>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklySafetyAlertsData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 11}} />
                            <YAxis tick={{fill: '#64748b', fontSize: 11}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="safetyAlerts" name="כמות אירועי סכנה" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col w-full lg:w-1/2">
            <h3 className="font-bold text-slate-700 mb-4 text-sm md:text-base">פילוח חומרת אירועים (מבוסס אחוזי סיכון ה-AI)</h3>
            <div className="flex-1 w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={severityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {severityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={severityColors[index % severityColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

      </main>
    </div>
  );
}

export default ManagerDashboard;