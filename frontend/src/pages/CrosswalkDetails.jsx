import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import crosswalksData from '../data/crosswalks.json';

function CrosswalkDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const crosswalk = crosswalksData.find(cw => cw._id === id);

  const [filterDate, setFilterDate] = useState('');

  const [historyEvents] = useState([
    { _id: 'hist_1', date: '2026-07-01', time: '14:30', description: 'הולך רגל חצה באדום', severity: 'high', image: 'https://via.placeholder.com/150' },
    { _id: 'hist_2', date: '2026-07-01', time: '09:15', description: 'רכב חסם מעבר חציה', severity: 'medium', image: 'https://via.placeholder.com/150' },
    { _id: 'hist_3', date: '2026-06-28', time: '18:45', description: 'עומס חריג', severity: 'low', image: '' },
    { _id: 'hist_4', date: '2026-06-25', time: '22:10', description: 'רוכב קורקינט כמעט ונפגע', severity: 'high', image: 'https://via.placeholder.com/150' },
  ]);

  // סינון האירועים לפי התאריך שנבחר
  const filteredEvents = historyEvents.filter(event => {
    if (!filterDate) return true;
    return event.date === filterDate;
  });

  if (!crosswalk) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100" dir="rtl">
        <h2 className="text-2xl font-bold text-slate-700">הצומת לא נמצא</h2>
        <button onClick={() => navigate(-1)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">חזור אחורה</button>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    if (severity === 'high') return <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs border border-red-200">🔴 קריטי</span>;
    if (severity === 'medium') return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold text-xs border border-orange-200">🟠 בינוני</span>;
    return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs border border-blue-200">🔵 נמוך</span>;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans" dir="rtl">
      
      {/* כותרת עליונה וכפתור חזרה */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">תיק צומת: {crosswalk.location}</h1>
            <p className="text-slate-500 mt-1">{crosswalk.areaname} | מזהה: {crosswalk._id}</p>
        </div>
        <button 
            onClick={() => navigate(-1)}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition shadow"
        >
            חזור לדשבורד
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* כרטיסיית סטטוס חומרה */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 md:col-span-1 h-fit">
            <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">סטטוס ציוד מנטר</h2>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">מצלמות מותקנות:</span>
                    <span className="font-bold">{crosswalk.camerasInstalled}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">מצב מצלמות:</span>
                    <span className={`font-bold px-2 py-1 rounded text-sm ${crosswalk.cameraStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {crosswalk.cameraStatus === 'online' ? 'פעיל 🟢' : 'תקלה 🔴'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">מערכת לדים:</span>
                    <span className={`font-bold px-2 py-1 rounded text-sm ${crosswalk.ledStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {crosswalk.ledStatus === 'online' ? 'פעיל 🟢' : 'תקלה 🔴'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">תחזוקה אחרונה:</span>
                    <span className="font-mono text-sm text-slate-500">{crosswalk.lastMaintenance}</span>
                </div>
            </div>
        </div>

        {/* אזור היסטוריית אירועים מסוכנים */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 md:col-span-2">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-slate-700">היסטוריית אירועים מסוכנים</h2>
                
                {/* סינון תאריכים  */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-500">סנן תאריך:</label>
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                    />
                    {filterDate && (
                        <button onClick={() => setFilterDate('')} className="text-xs text-red-500 hover:underline">נקה</button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="text-slate-500 text-sm border-b">
                            <th className="py-2 px-4">תאריך ושעה</th>
                            <th className="py-2 px-4">חומרה</th>
                            <th className="py-2 px-4">תיאור המקרה</th>
                            <th className="py-2 px-4">תיעוד במצלמה</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEvents.map(ev => (
                            <tr key={ev._id} className="hover:bg-slate-50">
                                <td className="py-3 px-4 font-mono text-sm text-slate-600">
                                    <div>{ev.date}</div>
                                    <div className="text-slate-400">{ev.time}</div>
                                </td>
                                <td className="py-3 px-4">{getSeverityBadge(ev.severity)}</td>
                                <td className="py-3 px-4 font-bold text-slate-700">{ev.description}</td>
                                <td className="py-3 px-4">
                                    {/* Placeholder לתמונה כפי שנדרש  */}
                                    {ev.image ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-blue-600 underline cursor-pointer">צפה בתמונה</span>
                                            <span className="text-lg">🖼️</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">ללא תמונה</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredEvents.length === 0 && (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-slate-500">
                                    לא נמצאו אירועים בתאריך זה.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}

export default CrosswalkDetails;