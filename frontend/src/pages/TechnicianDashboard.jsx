import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function TechnicianDashboard() {
  const navigate = useNavigate();

  const [faultyCrosswalks, setFaultyCrosswalks] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleFixHardware = (id) => {
    setFaultyCrosswalks(faultyCrosswalks.filter(cw => cw._id !== id));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* תפריט צד מותאם למובייל */}
      <aside className="w-full md:w-64 bg-slate-800 text-white p-4 md:p-6 flex flex-col md:justify-between shadow-xl z-20 shrink-0 md:h-full">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-center border-b border-slate-700 pb-4">
            SafeCross 🚦
          </h1>
          <nav className="flex flex-row md:flex-col gap-2 md:gap-3 text-slate-300 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
            <button className="text-right text-white bg-slate-700 px-4 py-2 md:p-3 rounded font-medium transition shadow-sm border border-slate-600 flex items-center gap-2 text-sm md:text-base">
              🔧 קריאות שירות
            </button>
            <button className="text-right hover:text-white hover:bg-slate-700 px-4 py-2 md:p-3 rounded transition flex items-center gap-2 text-sm md:text-base">
              📦 מלאי חלפים
            </button>
          </nav>
        </div>
        
        <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-stretch gap-3 mt-4 md:mt-0">
            <div className="bg-slate-700 px-3 py-2 md:p-3 rounded text-xs md:text-sm text-center border border-slate-600">
                👷‍♂️ טכנאי שטח
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
        
        <header className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">ניהול תקלות חומרה</h2>
            <p className="text-sm md:text-base text-slate-500 mt-1">רשימת ציוד קצה הדורש התערבות בשטח</p>
          </div>
          <div className="bg-orange-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm text-xs md:text-sm text-orange-800 border border-orange-200 font-bold flex items-center gap-2">
            <span>{faultyCrosswalks.length} תקלות פתוחות</span>
          </div>
        </header>

        <div className="flex flex-col gap-4 md:gap-6 flex-1">

          {faultyCrosswalks.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden h-48 md:h-64 shrink-0 flex flex-col">
              <div className="bg-slate-50 p-2 border-b border-slate-200 font-bold text-slate-700 text-xs md:text-sm">
                🗺️ פריסת תקלות גיאוגרפית
              </div>
              <div className="flex-1 relative z-0">
                <MapContainer 
                  center={[32.016, 34.774]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  {faultyCrosswalks.map((cw) => (
                    cw.lat && cw.lng ? (
                      <Marker key={cw._id} position={[cw.lat, cw.lng]}>
                        <Popup>
                          <div className="text-right font-sans" dir="rtl">
                            <strong className="block text-red-600">{cw.location}</strong>
                            <span className="text-xs text-gray-600">מזהה: {cw._id}</span>
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  ))}
                </MapContainer>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col flex-1 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center text-sm md:text-base">
                  <span>🛠️ סידור עבודה - צמתים לתיקון</span>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[700px]">
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
                                      <div className="text-xs text-slate-500 mt-1">{cw.areaName}</div>
                                  </td>
                                  <td className="p-4 font-mono text-sm text-slate-600">{cw._id}</td>
                                  <td className="p-4">
                                      <div className="flex flex-col gap-2">
                                          {cw.cameraStatus === 'offline' && (
                                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold inline-block w-fit border border-red-200 whitespace-nowrap">
                                                  📹 נתק תקשורת - מצלמה
                                              </span>
                                          )}
                                          {cw.ledStatus === 'offline' && (
                                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold inline-block w-fit border border-red-200 whitespace-nowrap">
                                                  💡 קצר/נתק - לדים
                                              </span>
                                          )}
                                      </div>
                                  </td>
                                  <td className="p-4 text-sm text-slate-600">{cw.lastMaintenance}</td>
                                  <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                          {cw.lat && cw.lng && (
                                            <a 
                                                href={`https://waze.com/ul?ll=${cw.lat},${cw.lng}&navigate=yes`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded text-xs font-bold border border-blue-200 transition inline-block whitespace-nowrap"
                                            >
                                                📍 נווט ב-Waze
                                            </a>
                                          )}
                                          <button 
                                              onClick={() => handleFixHardware(cw._id)}
                                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow transition whitespace-nowrap"
                                          >
                                              ✅ דווח כתוקן
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {faultyCrosswalks.length === 0 && (
                              <tr>
                                  <td colSpan="5" className="p-10 text-center text-slate-500 font-medium text-base md:text-lg">
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