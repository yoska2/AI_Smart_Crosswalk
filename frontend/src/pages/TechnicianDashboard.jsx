import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import crosswalksData from '../data/crosswalks.json';

function TechnicianDashboard() {
  const navigate = useNavigate();

  // מסננים רק את הצמתים שיש בהם תקלת חומרה (מצלמה או לדים למטה)
  const [faultyCrosswalks, setFaultyCrosswalks] = useState(
    crosswalksData.filter(cw => cw.cameraStatus === 'offline' || cw.ledStatus === 'offline')
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // פונקציה שמדמה תיקון של תקלה בשטח (מעלימה אותה מהרשימה)
  const handleFixHardware = (id) => {
    setFaultyCrosswalks(faultyCrosswalks.filter(cw => cw._id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* תפריט צד - מותאם לטכנאי */}
      <aside className="w-64 bg-slate-800 text-white p-6 flex flex-col justify-between shadow-xl z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center border-b border-slate-700 pb-4">
            SafeCross 🚦
          </h1>
          <nav className="flex flex-col gap-3 text-slate-300">
            <button className="text-right text-white bg-slate-700 p-3 rounded font-medium transition shadow-sm border border-slate-600 flex items-center gap-2">
              🔧 קריאות שירות פתוחות
            </button>
            <button className="text-right hover:text-white hover:bg-slate-700 p-3 rounded transition flex items-center gap-2">
              🗺️ מפת תקלות וניווט
            </button>
            <button className="text-right hover:text-white hover:bg-slate-700 p-3 rounded transition flex items-center gap-2">
              📦 ניהול מלאי חלפים
            </button>
          </nav>
        </div>
        
        <div className="flex flex-col gap-3">
            <div className="bg-slate-700 p-3 rounded text-sm text-center border border-slate-600">
                👷‍♂️ מחובר כטכנאי שטח
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
            <h2 className="text-3xl font-bold text-slate-800">ניהול תקלות חומרה</h2>
            <p className="text-slate-500 mt-1">רשימת ציוד קצה הדורש התערבות טכנית בשטח</p>
          </div>
          <div className="bg-orange-100 px-4 py-2 rounded-full shadow-sm text-sm text-orange-800 border border-orange-200 font-bold flex items-center gap-2">
            <span>{faultyCrosswalks.length} תקלות פתוחות</span>
          </div>
        </header>

        <div className="flex flex-col gap-6 flex-1">

          {/* טבלת קריאות השירות */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col flex-1 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                  <span>🛠️ סידור עבודה - צמתים לתיקון</span>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-right">
                      <thead className="bg-white border-b-2 border-slate-200 text-slate-500 text-sm">
                          <tr>
                              <th className="p-4 font-bold">מיקום הצומת</th>
                              <th className="p-4 font-bold">מזהה מערכת</th>
                              <th className="p-4 font-bold">תיאור התקלה</th>
                              <th className="p-4 font-bold">תחזוקה אחרונה</th>
                              <th className="p-4 font-bold text-center">פעולות טכנאי</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {faultyCrosswalks.map((cw) => (
                              <tr key={cw._id} className="hover:bg-slate-50 transition">
                                  <td className="p-4">
                                      <div className="font-bold text-slate-800">{cw.location}</div>
                                      <div className="text-xs text-slate-500 mt-1">{cw.areaname}</div>
                                  </td>
                                  <td className="p-4 font-mono text-sm text-slate-600">{cw._id}</td>
                                  <td className="p-4">
                                      <div className="flex flex-col gap-2">
                                          {cw.cameraStatus === 'offline' && (
                                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold inline-block w-fit border border-red-200">
                                                  📹 נתק תקשורת - מצלמה
                                              </span>
                                          )}
                                          {cw.ledStatus === 'offline' && (
                                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold inline-block w-fit border border-red-200">
                                                  💡 קצר/נתק - מערכת לדים
                                              </span>
                                          )}
                                      </div>
                                  </td>
                                  <td className="p-4 text-sm text-slate-600">{cw.lastMaintenance}</td>
                                  <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                          <button 
                                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-bold border border-blue-200 transition"
                                          >
                                              📍 נווט למקום
                                          </button>
                                          <button 
                                              onClick={() => handleFixHardware(cw._id)}
                                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-bold shadow transition"
                                          >
                                              ✅ דווח כתוקן
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {faultyCrosswalks.length === 0 && (
                              <tr>
                                  <td colSpan="5" className="p-10 text-center text-slate-500 font-medium text-lg">
                                      🎉 אין תקלות חומרה פתוחות! כל הצמתים תקינים.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default TechnicianDashboard;