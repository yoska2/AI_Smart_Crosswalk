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
    <div className="flex h-screen bg-slate-100 font-sans" dir="rtl">
      
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-xl z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center border-b border-slate-700 pb-4">
            SafeCross 🚦<br/><span className="text-sm font-normal text-slate-400">ניהול אזורי</span>
          </h1>
          <nav className="flex flex-col gap-3 text-slate-300">
            <button className="text-right hover:text-white bg-slate-800 p-3 rounded font-medium transition shadow-sm border border-slate-700 text-blue-400">
              📊 לוח בקרה ראשי
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 p-3 rounded transition">
              📑 דוחות סטטיסטיים
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 p-3 rounded transition">
              👥 ניהול צוות מוקדנים
            </button>
          </nav>
        </div>
        
        <div className="flex flex-col gap-3">
            <div className="bg-slate-800 p-3 rounded text-sm text-center border border-slate-700">
              מנהל מחובר: אזור מרכז
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition font-bold shadow-md"
            >
                התנתק
            </button>
        </div>
      </aside>

      <main className="flex-1 p-6 flex flex-col overflow-hidden overflow-y-auto">
        <header className="mb-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">מבט על אזורי - ניתוח בטיחות וסיכונים</h2>
            <p className="text-slate-500 mt-1">פילוח נתוני AI וביצועי צמתים ב-7 הימים האחרונים (לא כולל תקלות תשתית)</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-50 transition font-medium">
                יצא דוח PDF 📥
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">סה"כ אירועי בטיחות מבוססי AI</span>
                <span className="text-3xl font-black text-slate-800 mt-1">0</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">התרעות סכנה (סיכון מעל 90%)</span>
                <span className="text-3xl font-black text-red-600 mt-1">0</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">זמן תגובת מוקדן ממוצע</span>
                <span className="text-3xl font-black text-slate-800 mt-1">0 <span className="text-lg font-medium">דק'</span></span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">צמתים מנוטרים (פעילים)</span>
                <span className="text-3xl font-black text-blue-600 mt-1">0 / 0</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">
                        {intersectionFilter === 'top5' ? '5 הצמתים עם כמות אירועי הסכנה הגבוהה ביותר' : 
                         intersectionFilter === 'school' ? 'אירועי סכנה בקרבת מוסדות חינוך' : 'אירועי סכנה בכלל הצמתים'}
                    </h3>
                    <select 
                        value={intersectionFilter}
                        onChange={(e) => setIntersectionFilter(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-600 outline-none focus:border-blue-500 cursor-pointer"
                    >
                        <option value="top5">🔥 5 הצמתים המסוכנים ביותר</option>
                        <option value="school">🏫 סביבת מוסדות חינוך</option>
                        <option value="all">🚦 כל הצמתים באזור</option>
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} />
                            <Legend wrapperStyle={{fontSize: '12px'}} />
                            <Bar dataKey="children" name="ילדים" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="adults" name="מבוגרים" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="vehicles" name="רכבים מתפרצים" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col">
                <h3 className="font-bold text-slate-700 mb-1">מגמת עומס אירועי בטיחות (שבועי)</h3>
                <p className="text-xs text-slate-500 mb-4">משקף סכנות מבוססות AI בלבד, ללא התרעות תקשורת/חומרה</p>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklySafetyAlertsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="safetyAlerts" name="כמות אירועי סכנה" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col w-full lg:w-1/2">
            <h3 className="font-bold text-slate-700 mb-4">פילוח חומרת אירועים (מבוסס אחוזי סיכון ה-AI)</h3>
            <div className="flex-1 w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={severityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
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