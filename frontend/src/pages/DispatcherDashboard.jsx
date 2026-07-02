import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ייבוא קובץ הנתונים (ה-DB הזמני שלנו)
import crosswalksData from '../data/crosswalks.json';

function DispatcherDashboard() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([
    { 
      _id: 'alert_001', 
      cameraId: 'CAM-NORTH-01',
      crosswalkId: 'CW-882',
      location: 'צומת הופיין / גולומב', 
      areaid: 'AREA-HLN-C',
      areaname: 'חולון מרכז',
      severity: 'high',
      description: 'הולך רגל התפרץ לכביש באדום', 
      imageUrl: 'https://via.placeholder.com/600x400?text=Camera+Feed+Snapshot',
      timestamp: '2026-06-05T19:55:00Z',
      status: 'pending',
      note: ''
    },
    { 
      _id: 'alert_002', 
      cameraId: 'CAM-SOUTH-04',
      crosswalkId: 'CW-105',
      location: 'סוקולוב / קראוזה', 
      areaid: 'AREA-HLN-C',
      areaname: 'חולון מרכז',
      severity: 'medium',
      description: 'רכב עצר על קו חצייה', 
      imageUrl: '',
      timestamp: '2026-06-05T19:50:30Z',
      status: 'in-progress',
      note: 'ניידת סיור בדרך למקום'
    },
    { 
      _id: 'alert_003', 
      cameraId: 'CAM-EAST-09',
      crosswalkId: 'CW-443',
      location: 'קמפוס HIT - שער ראשי', 
      areaid: 'AREA-HLN-E',
      areaname: 'חולון מזרח',
      severity: 'low',
      description: 'עומס חריג של הולכי רגל', 
      imageUrl: 'https://via.placeholder.com/600x400?text=Crowd+Snapshot',
      timestamp: '2026-06-05T19:42:15Z',
      status: 'resolved',
      note: 'העומס השתחרר, תקין'
    },
  ]);

  const handleLogout = () => {
    // מחיקת הטוקן מהזיכרון בעת התנתקות
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleStatusChange = (alertId, newStatus) => {
    setAlerts(alerts.map(alert => 
      alert._id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };

  const handleNoteChange = (alertId, newNote) => {
    setAlerts(alerts.map(alert => 
      alert._id === alertId ? { ...alert, note: newNote } : alert
    ));
  };

  const getStatusStyle = (status) => {
    if (status === 'pending') return 'bg-red-100 text-red-800 border-red-300';
    if (status === 'in-progress') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (status === 'resolved') return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'high') return <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs border border-red-200">🔴 קריטי</span>;
    if (severity === 'medium') return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold text-xs border border-orange-200">🟠 בינוני</span>;
    return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs border border-blue-200">🔵 נמוך</span>;
  };

  // פונקציית עזר לעיצוב הסטטוס של הצמתים מה-JSON
  const getCrosswalkStatusBadge = (status) => {
    if (status === 'active') return <span className="text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 text-xs font-bold">פעיל</span>;
    if (status === 'warning') return <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 text-xs font-bold">תקלה חלקית</span>;
    return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-300 text-xs font-bold">מנותק</span>;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans" dir="rtl">
      
      <aside className="w-64 bg-slate-800 text-white p-6 flex flex-col justify-between shadow-xl z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center border-b border-slate-700 pb-4">
            SafeCross 🚦
          </h1>
          <nav className="flex flex-col gap-3 text-slate-300">
            <button className="text-right hover:text-white bg-slate-700 p-3 rounded font-medium transition shadow-sm border border-slate-600">
              🎧 תצוגת מוקדן
            </button>
            <button className="text-right hover:text-white hover:bg-slate-700 p-3 rounded transition">
              📹 צפייה חיה (קיר וידאו)
            </button>
            <button className="text-right hover:text-white hover:bg-slate-700 p-3 rounded transition">
              📒 יומן מבצעי (Shift Log)
            </button>
          </nav>
        </div>
        
        <div className="flex flex-col gap-3">
            <div className="bg-slate-700 p-3 rounded text-sm text-center border border-slate-600">
                🟢 סטטוס מערכת: תקין
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition font-bold shadow-md"
            >
                התנתק
            </button>
        </div>
      </aside>

      <main className="flex-1 p-6 flex flex-col overflow-hidden">
        <header className="mb-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">מוקד שליטה בזמן אמת</h2>
            <p className="text-slate-500 mt-1">מנטר אזורים פעילים ומציג התרעות מבוססות מצלמה</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm text-green-700 border border-green-200 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            מחובר למערכת
          </div>
        </header>

        <div className="flex flex-col gap-6 flex-1 overflow-hidden">
            
          {/* אזור עליון מפוצל: מפה (ימין) + רשימת צמתים מה-JSON (שמאל) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 h-72">
              
              {/* מפה - תופסת 2 מתוך 3 עמודות */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col h-full">
                <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                    <span className="flex items-center gap-2">📍 מפת צמתים</span>
                    <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">חיבור API חי</span>
                </div>
                <div className="flex-1 bg-slate-200 flex items-center justify-center rounded-b-xl">
                    <div className="text-center">
                        <p className="text-slate-500 text-xl font-medium mb-2">כאן נשלב את המפה 🗺️</p>
                    </div>
                </div>
              </div>

              {/* רשימת צמתים מתוך מסד הנתונים (JSON) - תופסת עמודה 1 */}
              <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col h-full">
                <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                    <span className="flex items-center gap-2">🚦 פריסת צמתים (DB)</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{crosswalksData.length} מנוטרים</span>
                </div>
                {/* אזור נגלל לרשימת הצמתים */}
                <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3">
                    {crosswalksData.map((cw) => (
                        <div key={cw._id} className="p-3 border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-sm text-slate-800">{cw.location}</span>
                                {getCrosswalkStatusBadge(cw.status)}
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                                <span>{cw.areaname}</span>
                                <span className="bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                                    📷 {cw.camerasInstalled} מצלמות
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

          </div>

          {/* טבלת התרעות - חלק תחתון */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col flex-1 overflow-hidden">
             <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center shrink-0">
                <span>⚠️ טבלת התרעות מהשטח</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {alerts.filter(a => a.status === 'pending').length} ממתינות לטיפול
                </span>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-white sticky top-0 border-b-2 border-slate-200 shadow-sm z-10">
                        <tr className="text-slate-500 text-sm">
                            <th className="p-4 font-bold whitespace-nowrap">שעה</th>
                            <th className="p-4 font-bold whitespace-nowrap">חומרה</th>
                            <th className="p-4 font-bold whitespace-nowrap">תיאור אירוע</th>
                            <th className="p-4 font-bold whitespace-nowrap">מיקום (מאקרו ומיקרו)</th>
                            <th className="p-4 font-bold whitespace-nowrap">ציוד מנטר</th>
                            <th className="p-4 font-bold whitespace-nowrap">סטטוס טיפול</th>
                            <th className="p-4 font-bold whitespace-nowrap">הערות מוקדן</th>
                            <th className="p-4 font-bold whitespace-nowrap">תיעוד</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {alerts.map((alert) => (
                            <tr key={alert._id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-mono text-slate-600 whitespace-nowrap">{formatTime(alert.timestamp)}</td>
                                <td className="p-4 whitespace-nowrap">{getSeverityBadge(alert.severity)}</td>
                                <td className="p-4 font-bold text-slate-800">{alert.description}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-slate-800">{alert.location}</div>
                                    <div className="text-xs text-slate-500 mt-1">{alert.areaname} ({alert.areaid})</div>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1 font-mono text-xs text-slate-600">
                                        <span>📷 {alert.cameraId}</span>
                                        <span>🚶 {alert.crosswalkId}</span>
                                    </div>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <select 
                                      value={alert.status}
                                      onChange={(e) => handleStatusChange(alert._id, e.target.value)}
                                      className={`font-bold px-2 py-1 rounded outline-none cursor-pointer border text-sm ${getStatusStyle(alert.status)}`}
                                    >
                                      <option value="pending">🔴 טרם טופל</option>
                                      <option value="in-progress">🟡 בטיפול</option>
                                      <option value="resolved">🟢 טופל</option>
                                    </select>
                                </td>
                                <td className="p-4 min-w-[200px]">
                                    <input 
                                      type="text" 
                                      placeholder="הוסף הערה..." 
                                      value={alert.note || ''}
                                      onChange={(e) => handleNoteChange(alert._id, e.target.value)}
                                      className="w-full p-2 border border-slate-200 rounded text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white transition"
                                    />
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    {alert.imageUrl ? (
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-bold underline transition">
                                            צפה 🖼️
                                        </button>
                                    ) : (
                                        <span className="text-slate-400 text-sm">אין</span>
                                    )}
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

export default DispatcherDashboard;