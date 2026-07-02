import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import crosswalksData from '../data/crosswalks.json';

function ManagerDashboard() {
  const navigate = useNavigate();

  // נתוני דמה של המוקדנים במשמרת נוכחית - הוספנו זמן תגובה ממוצע!
  const [dispatchersLoad] = useState([
    { id: 1, name: 'דניאל כהן', pending: 8, inProgress: 2, maxCapacity: 15, avgResponseTime: '2m 15s' },
    { id: 2, name: 'רונית לוי', pending: 2, inProgress: 4, maxCapacity: 15, avgResponseTime: '1m 05s' },
    { id: 3, name: 'יעל שגיא (גיבוי)', pending: 0, inProgress: 1, maxCapacity: 10, avgResponseTime: '0m 45s' },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // פונקציות עזר סטטיסטיות למסך הניהול
  const totalCrosswalks = crosswalksData.length;
  const activeCameras = crosswalksData.filter(cw => cw.cameraStatus === 'online').length;
  const cameraHealthPercent = Math.round((activeCameras / totalCrosswalks) * 100);

  const getLoadColor = (pending, max) => {
    const ratio = pending / max;
    if (ratio >= 0.8) return 'bg-red-500';
    if (ratio >= 0.5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* תפריט צד ניהולי */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col justify-between shadow-xl z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center border-b border-blue-800 pb-4">
            SafeCross 🚦
          </h1>
          <nav className="flex flex-col gap-3 text-blue-200">
            <button className="text-right text-white bg-blue-800 p-3 rounded font-medium transition shadow-sm border border-blue-700">
              📊 דשבורד מנהל אזור
            </button>
            <button className="text-right hover:text-white hover:bg-blue-800 p-3 rounded transition">
              📈 דוחות סטטיסטיים
            </button>
            <button className="text-right hover:text-white hover:bg-blue-800 p-3 rounded transition">
              👥 ניהול צוות מוקד
            </button>
          </nav>
        </div>
        
        <div className="flex flex-col gap-3">
            <div className="bg-blue-800 p-3 rounded text-sm text-center border border-blue-700">
                👤 מחובר כמנהל
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition font-bold shadow-md"
            >
                התנתק
            </button>
        </div>
      </aside>

      {/* אזור תוכן מרכזי */}
      <main className="flex-1 p-6 flex flex-col overflow-y-auto">
        
        <header className="mb-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">תמונת מצב אזורית (Manager View)</h2>
            <p className="text-slate-500 mt-1">ריכוז מדדי בטיחות, ביצועי צוות וסטטוס תשתיות בעיר</p>
          </div>
        </header>

        <div className="flex flex-col gap-6 flex-1">
            
          {/* שורת כרטיסיות KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-r-4 border-r-blue-500">
                  <div className="text-slate-500 text-sm font-bold mb-1">סה"כ צמתים מנוטרים</div>
                  <div className="text-3xl font-black text-slate-800">{totalCrosswalks}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-r-4 border-r-red-500">
                  <div className="text-slate-500 text-sm font-bold mb-1">התרעות קריטיות (היום)</div>
                  <div className="text-3xl font-black text-slate-800">14</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-r-4 border-r-yellow-500">
                  <div className="text-slate-500 text-sm font-bold mb-1">אירועים פתוחים (העיר)</div>
                  <div className="text-3xl font-black text-slate-800">10</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-r-4 border-r-green-500">
                  <div className="text-slate-500 text-sm font-bold mb-1">תקינות מערכות (Uptime)</div>
                  <div className="text-3xl font-black text-slate-800">{cameraHealthPercent}%</div>
              </div>
          </div>

          {/* בקרת מוקדנים + התפלגות אירועים */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
              
              {/* בקרת מוקדנים (עומס אירועים וזמן תגובה) */}
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between items-center border-b pb-2">
                      <span>🎧 עומס אירועים - צוות מוקד</span>
                      <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">זמן אמת</span>
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                      {dispatchersLoad.map(dispatcher => (
                          <div key={dispatcher.id} className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-sm">
                                  <span className="font-bold text-slate-700">{dispatcher.name}</span>
                                  <div className="flex items-center gap-3 text-slate-500 font-mono text-xs">
                                      <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200">⏱️ ממוצע: {dispatcher.avgResponseTime}</span>
                                      <span>{dispatcher.pending} ממתינים | {dispatcher.inProgress} בטיפול</span>
                                  </div>
                              </div>
                              {/* פס התקדמות העומס */}
                              <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200 overflow-hidden mt-1">
                                  <div 
                                      className={`h-2.5 rounded-full transition-all ${getLoadColor(dispatcher.pending, dispatcher.maxCapacity)}`} 
                                      style={{ width: `${(dispatcher.pending / dispatcher.maxCapacity) * 100}%` }}
                                  ></div>
                              </div>
                              {dispatcher.pending >= dispatcher.maxCapacity * 0.8 && (
                                  <span className="text-xs text-red-500 font-bold mt-1">⚠️ עומס חריג - שקול ניתוב אירועים למוקדן אחר</span>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* התפלגות התרעות חודשית */}
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">📊 חומרת עבירות (יוני 2026)</h3>
                  
                  <div className="flex flex-col gap-4 justify-center flex-1">
                      <div className="flex items-center gap-3">
                          <span className="w-16 text-sm font-bold text-slate-600">קריטי</span>
                          <div className="flex-1 bg-slate-100 rounded-r-md h-6 overflow-hidden flex">
                              <div className="bg-red-500 h-full w-[45%] text-xs text-white flex items-center px-2">124 מקרים</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="w-16 text-sm font-bold text-slate-600">בינוני</span>
                          <div className="flex-1 bg-slate-100 rounded-r-md h-6 overflow-hidden flex">
                              <div className="bg-orange-400 h-full w-[35%] text-xs text-white flex items-center px-2">95 מקרים</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="w-16 text-sm font-bold text-slate-600">נמוך</span>
                          <div className="flex-1 bg-slate-100 rounded-r-md h-6 overflow-hidden flex">
                              <div className="bg-blue-400 h-full w-[20%] text-xs text-white flex items-center px-2">42 מקרים</div>
                          </div>
                      </div>
                  </div>
              </div>

          </div>

          {/* טבלת צמתים מרכזית בראייה אזורית */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col">
              <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center rounded-t-xl">
                  <span>📍 בקרת צמתים אזורית</span>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-right">
                      <thead className="bg-white border-b-2 border-slate-200 text-slate-500 text-sm">
                          <tr>
                              <th className="p-4 font-bold">מזהה ושם צומת</th>
                              <th className="p-4 font-bold">אזור (Area)</th>
                              <th className="p-4 font-bold">תשתיות עובדות</th>
                              <th className="p-4 font-bold">רמת מסוכנות (סטטוס)</th>
                              <th className="p-4 font-bold">פעולות ניהול</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {crosswalksData.map((cw) => (
                              <tr key={cw._id} className="hover:bg-slate-50 transition">
                                  <td className="p-4">
                                      <div className="font-bold text-slate-800">{cw.location}</div>
                                      <div className="text-xs text-slate-400 font-mono">{cw._id}</div>
                                  </td>
                                  <td className="p-4 text-sm font-medium text-slate-700">{cw.areaname}</td>
                                  <td className="p-4">
                                      <div className="flex flex-col gap-1 text-xs">
                                          <span className={`${cw.cameraStatus === 'online' ? 'text-green-600' : 'text-red-500'}`}>
                                              {cw.cameraStatus === 'online' ? '🟢 מצלמות באוויר' : '🔴 נתק מצלמות'}
                                          </span>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      {cw.status === 'active' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200">תקין (שגרה)</span>}
                                      {cw.status === 'warning' && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold border border-orange-200">דורש תשומת לב</span>}
                                      {cw.status === 'inactive' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold border border-red-200">מוקפא / תקול</span>}
                                  </td>
                                  <td className="p-4">
                                      <button 
                                          onClick={() => navigate(`/crosswalk/${cw._id}`)}
                                          className="text-blue-600 hover:text-blue-800 font-bold text-sm underline"
                                      >
                                          פתח תיק צומת
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ManagerDashboard;