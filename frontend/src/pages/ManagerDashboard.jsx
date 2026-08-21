import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

function ManagerDashboard() {
  const navigate = useNavigate();
  
  // State לסינון גרף העמודות
  const [intersectionFilter, setIntersectionFilter] = useState('top5');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // נתונים לגרף מגמה שבועית - *עודכן לאירועי בטיחות בלבד*
  const weeklySafetyAlertsData = [
    { name: 'א', safetyAlerts: 12 },
    { name: 'ב', safetyAlerts: 19 },
    { name: 'ג', safetyAlerts: 15 },
    { name: 'ד', safetyAlerts: 22 },
    { name: 'ה', safetyAlerts: 30 },
    { name: 'ו', safetyAlerts: 8 },
    { name: 'ש', safetyAlerts: 5 },
  ];

  // נתונים מורחבים לגרף פילוח הצמתים 
  const allTargetTypeData = [
    { name: 'צומת הופיין', children: 45, adults: 80, vehicles: 20, type: 'regular' },
    { name: 'קמפוס HIT', children: 10, adults: 120, vehicles: 5, type: 'regular' },
    { name: 'סוקולוב', children: 60, adults: 50, vehicles: 40, type: 'school' }, // סביבת מוסדות
    { name: 'כיכר קוגל', children: 15, adults: 40, vehicles: 90, type: 'regular' },
    { name: 'שנקר / סוקולוב', children: 55, adults: 30, vehicles: 15, type: 'school' }, // סביבת מוסדות
    { name: 'אלופי צה"ל', children: 5, adults: 15, vehicles: 10, type: 'regular' },
  ];

  // לוגיקת הסינון של גרף העמודות לפי בחירת המנהל
  let displayData = allTargetTypeData;
  if (intersectionFilter === 'top5') {
    // ממיין מהגבוה לנמוך לפי סך כל התרעות הבטיחות ולוקח את ה-5 הראשונים
    displayData = [...allTargetTypeData]
      .sort((a,b) => (b.children + b.adults + b.vehicles) - (a.children + a.adults + a.vehicles))
      .slice(0, 5);
  } else if (intersectionFilter === 'school') {
    displayData = allTargetTypeData.filter(d => d.type === 'school');
  }

  // נתונים לגרף עוגה (התפלגות חומרת אירועי בטיחות)
  const severityData = [
    { name: 'קריטי (מעל 90%)', value: 15 },
    { name: 'בינוני', value: 35 },
    { name: 'נמוך', value: 50 },
  ];
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

        {/* קלפי נתונים עליונים (KPIs) - ממוקדים בבטיחות */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">סה"כ אירועי בטיחות מבוססי AI</span>
                <span className="text-3xl font-black text-slate-800 mt-1">342</span>
                <span className="text-xs text-green-500 font-bold mt-2">↑ 12% משבוע שעבר</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">התרעות סכנה (סיכון מעל 90%)</span>
                <span className="text-3xl font-black text-red-600 mt-1">45</span>
                <span className="text-xs text-red-500 font-bold mt-2">נדרשת התערבות מונעת</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">זמן תגובת מוקדן ממוצע</span>
                <span className="text-3xl font-black text-slate-800 mt-1">1.2 <span className="text-lg font-medium">דק'</span></span>
                <span className="text-xs text-green-500 font-bold mt-2">↓ 0.3 דק' שיפור</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-sm font-bold">צמתים מנוטרים (פעילים)</span>
                <span className="text-3xl font-black text-blue-600 mt-1">12 / 14</span>
                <span className="text-xs text-slate-500 font-bold mt-2">מתוכם 3 ליד מוסדות חינוך</span>
            </div>
        </div>

        {/* אזור הגרפים */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* גרף 1: פילוח AI לפי צמתים עם אפשרות סינון */}
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

            {/* גרף 2: מגמת אירועים שבועית ממוקדת בטיחות */}
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

        {/* גרף 3: פילוח חומרת אירועים */}
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