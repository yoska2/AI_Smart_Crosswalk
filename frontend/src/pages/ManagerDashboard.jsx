import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

function ManagerDashboard() {
  const navigate = useNavigate();
  
  const [intersectionFilter, setIntersectionFilter] = useState('top5');
  const [alerts, setAlerts] = useState([]);
  const [crosswalks, setCrosswalks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [alertsRes, crosswalksRes] = await Promise.all([
          fetch(`${apiUrl}/alerts`),
          fetch(`${apiUrl}/crosswalks`)
        ]);

        if (alertsRes.ok && crosswalksRes.ok) {
          const alertsData = await alertsRes.json();
          const crosswalksData = await crosswalksRes.json();
          setAlerts(alertsData);
          setCrosswalks(crosswalksData);
        }
      } catch (err) {
        console.error("Error fetching data for manager dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const socketUrl = apiUrl.replace('/api', ''); 
    const socket = io(socketUrl);

    socket.on('newAlert', (newAlertData) => {
      setAlerts((prevAlerts) => [newAlertData, ...prevAlerts]);
    });

    socket.on('alertUpdated', (updatedAlert) => {
      setAlerts((prevAlerts) => 
        prevAlerts.map(alert => 
          alert._id === updatedAlert._id ? updatedAlert : alert
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const handleExportPDF = () => {
    window.print();
  };

  const resolvedAlerts = alerts.filter(alert => alert.isResolved === true);

  const totalAlertsCount = resolvedAlerts.length;
  const highRiskCount = resolvedAlerts.filter(a => (a.confidence || 0) >= 90 || a.severity?.toLowerCase() === 'high').length;
  const activeCrosswalksCount = crosswalks.filter(cw => cw.isActive || cw.status === 'active').length;
  const totalCrosswalksCount = crosswalks.length;

  const intersectionMap = {};
  resolvedAlerts.forEach(alert => {
    const loc = alert.location || 'צומת לא ידוע';
    if (!intersectionMap[loc]) {
      intersectionMap[loc] = { name: loc, children: 0, adults: 0, vehicles: 0, total: 0 };
    }
    const type = alert.personType?.toLowerCase();
    if (type === 'child' || type === 'children') {
      intersectionMap[loc].children += 1;
    } else if (type === 'adult' || type === 'adults') {
      intersectionMap[loc].adults += 1;
    } else {
      intersectionMap[loc].vehicles += 1;
    }
    intersectionMap[loc].total += 1;
  });

  const allTargetTypeData = Object.values(intersectionMap);

  let displayData = allTargetTypeData;
  if (intersectionFilter === 'top5') {
    displayData = [...allTargetTypeData]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  } else if (intersectionFilter === 'school') {
    displayData = allTargetTypeData.filter(d => d.name.includes('בית ספר') || d.name.includes('היובל'));
    if (displayData.length === 0) displayData = allTargetTypeData.slice(0, 3);
  }

  const daysMap = { 0: 'ראשון', 1: 'שני', 2: 'שלישי', 3: 'רביעי', 4: 'חמישי', 5: 'שישי', 6: 'שבת' };
  const weeklyCounts = { 'ראשון': 0, 'שני': 0, 'שלישי': 0, 'רביעי': 0, 'חמישי': 0, 'שישי': 0, 'שבת': 0 };
  
  resolvedAlerts.forEach(alert => {
    if (alert.timestamp) {
      const dayIndex = new Date(alert.timestamp).getDay();
      const dayName = daysMap[dayIndex];
      if (weeklyCounts[dayName] !== undefined) {
        weeklyCounts[dayName] += 1;
      }
    }
  });

  const weeklySafetyAlertsData = Object.keys(weeklyCounts).map(day => ({
    name: day,
    safetyAlerts: weeklyCounts[day]
  }));

  const highSev = resolvedAlerts.filter(a => a.severity?.toLowerCase() === 'high').length;
  const medSev = resolvedAlerts.filter(a => a.severity?.toLowerCase() === 'medium').length;
  const lowSev = resolvedAlerts.filter(a => !a.severity || a.severity?.toLowerCase() === 'low').length;

  const severityData = [
    { name: 'קריטי', value: highSev || 1 },
    { name: 'בינוני', value: medSev || 1 },
    { name: 'נמוך', value: lowSev || 1 }
  ];

  const severityColors = ['#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans" dir="rtl">
      
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:p-6 flex flex-col md:justify-between shadow-xl z-20 shrink-0 md:h-full print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-center border-b border-slate-700 pb-4">
            SafeCross 🚦<br/><span className="text-xs md:text-sm font-normal text-slate-400">ניהול אזורי</span>
          </h1>
          <nav className="flex flex-row md:flex-col gap-2 md:gap-3 text-slate-300 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
            <button className="text-right hover:text-white bg-slate-800 px-4 py-2 md:p-3 rounded font-medium transition shadow-sm border border-slate-700 text-blue-400 text-sm md:text-base">
              📊 לוח בקרה ראשי
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
          <div className="flex gap-3 w-full sm:w-auto print:hidden">
            <button 
              onClick={handleExportPDF}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-50 transition font-medium w-full sm:w-auto text-sm md:text-base flex justify-center items-center gap-2 cursor-pointer"
            >
                יצא דוח PDF 📥
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">אירועי AI</span>
                <span className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{totalAlertsCount}</span>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">סכנה (90%+)</span>
                <span className="text-2xl md:text-3xl font-black text-red-600 mt-1">{highRiskCount}</span>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">זמן תגובה ממוצע</span>
                <span className="text-2xl md:text-3xl font-black text-slate-800 mt-1">4.2 <span className="text-sm md:text-lg font-medium">דק'</span></span>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-500 text-xs md:text-sm font-bold">צמתים פעילים</span>
                <span className="text-2xl md:text-3xl font-black text-blue-600 mt-1">{activeCrosswalksCount} / {totalCrosswalksCount}</span>
            </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <span className="text-slate-500 text-sm font-medium">טוען נתונים מהשרת עבור המנהל...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-6">
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <h3 className="font-bold text-slate-700 text-sm md:text-base">
                          {intersectionFilter === 'top5' ? '5 הצמתים עם כמות אירועי הסכנה הגבוהה ביותר' : 
                           intersectionFilter === 'school' ? 'אירועי סכנה בקרבת מוסדות חינוך' : 'אירועי סכנה בכלל הצמתים'}
                      </h3>
                      <select 
                          value={intersectionFilter}
                          onChange={(e) => setIntersectionFilter(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-600 outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto print:hidden"
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
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[22rem] flex flex-col lg:col-span-2">
                  <h3 className="font-bold text-slate-700 mb-2 text-sm md:text-base">פילוח חומרת אירועים (מבוסס אחוזי סיכון ה-AI)</h3>
                  <div className="flex-1 w-full flex justify-center items-center">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={severityData}
                                  cx="50%"
                                  cy="45%"
                                  innerRadius={55}
                                  outerRadius={75}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {severityData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={severityColors[index % severityColors.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                              <Legend 
                                  verticalAlign="bottom" 
                                  height={36} 
                                  formatter={(value, entry) => <span className="text-slate-700 font-medium text-xs md:text-sm mx-2">{value}</span>}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default ManagerDashboard;