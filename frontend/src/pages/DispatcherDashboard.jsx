import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import crosswalksData from '../data/crosswalks.json';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function DispatcherDashboard() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [alerts, setAlerts] = useState([
    {
      _id: "alert_001",
      cameraId: "cam_101",
      crosswalkId: "CW-882",
      location: "צומת הופיין / גולומב",
      areaId: "AREA-HLN-C",
      areaName: "חולון מרכז",
      severity: "High",
      description: "הולך רגל זוהה על הכביש באור אדום",
      personType: "adult",
      distanceFromCrosswalk: 0.5,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      timestamp: "2026-06-03T08:30:00Z",
      status: "pending",
      confidence: 95 // תוקן ל-confidence
    },
    {
      _id: "alert_002",
      cameraId: "cam_201",
      crosswalkId: "CW-105",
      location: "סוקולוב / קראוזה",
      areaId: "AREA-HLN-C",
      areaName: "חולון מרכז",
      severity: "Medium",
      description: "רכב נעצר על קו מעבר החצייה",
      personType: "unknown",
      distanceFromCrosswalk: 0,
      imageUrl: "",
      timestamp: "2026-06-03T11:15:00Z",
      status: "in-progress",
      confidence: 60 // תוקן ל-confidence
    }
  ]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const socket = io('http://localhost:3000'); 

    socket.on('newAlert', (newAlertData) => {
      setAlerts((prevAlerts) => [newAlertData, ...prevAlerts]);
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleStatusChange = (alertId, newStatus) => {
    setAlerts(alerts.map(alert => 
      alert._id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };

  const filteredCrosswalks = crosswalksData.filter(cw => 
    (cw.location && cw.location.includes(searchTerm)) || 
    (cw.areaName && cw.areaName.includes(searchTerm)) ||
    (cw._id && cw._id.includes(searchTerm))
  );

  const filteredAlerts = alerts.filter(alert => {
    if (!filterDate) return true;
    const alertDate = alert.timestamp.split('T')[0];
    return alertDate === filterDate;
  });

  const getStatusStyle = (status) => {
    if (status === 'pending') return 'bg-red-100 text-red-800 border-red-300';
    if (status === 'in-progress') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (status === 'resolved') return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'high') return <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs border border-red-200">🔴 קריטי</span>;
    if (s === 'medium') return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold text-xs border border-orange-200">🟠 בינוני</span>;
    return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs border border-blue-200">🔵 נמוך</span>;
  };

  const getCrosswalkStatusBadge = (status, isActive) => {
    if (isActive || status === 'active') return <span className="text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 text-xs font-bold">פעיל</span>;
    if (status === 'warning') return <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 text-xs font-bold">תקלה</span>;
    return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-300 text-xs font-bold">מנותק</span>;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateDisplay = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('he-IL');
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
            מחובר לשרת הנתונים
          </div>
        </header>

        <div className="flex flex-col gap-6 flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 h-72">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center z-10 relative">
                    <span className="flex items-center gap-2">📍 מפת צמתים</span>
                    <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">חיבור API חי</span>
                </div>
                <div className="flex-1 bg-slate-200 relative z-0">
                    <MapContainer 
                        center={[32.016, 34.774]} 
                        zoom={14} 
                        style={{ height: '100%', width: '100%', minHeight: '200px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {filteredCrosswalks.map((cw) => (
                            cw.lat && cw.lng ? (
                                <Marker key={cw._id} position={[cw.lat, cw.lng]}>
                                    <Popup>
                                        <div className="text-right font-sans" dir="rtl">
                                            <strong className="block text-blue-700">{cw.location}</strong>
                                            <span className="text-xs text-gray-600 block mb-1">{cw.areaName}</span>
                                            <span className="text-xs font-bold">
                                                סטטוס: {cw.isActive ? '🟢 פעיל' : '🔴 מנותק'}
                                            </span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : null
                        ))}
                    </MapContainer>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col h-full">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex flex-col gap-3 shrink-0">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                        <span className="flex items-center gap-2">🚦 פריסת צמתים (DB)</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{filteredCrosswalks.length} תוצאות</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="חיפוש לפי רחוב, אזור או מזהה..." 
                      className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3">
                    {filteredCrosswalks.map((cw) => (
                        <div 
                            key={cw._id} 
                            onClick={() => navigate(`/crosswalk/${cw._id}`)}
                            className="p-3 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 group"
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-sm text-slate-800 group-hover:text-blue-700">{cw.location}</span>
                                {getCrosswalkStatusBadge(cw.status, cw.isActive)}
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                                <span>{cw.areaName || cw.areaname}</span>
                                <span className="bg-slate-100 px-2 py-1 rounded flex items-center gap-1 font-mono">
                                    {cw._id}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col flex-1 overflow-hidden relative">
             <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center shrink-0">
                <span>⚠️ טבלת התרעות מהשטח</span>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-normal">
                        <label htmlFor="dateFilter" className="text-slate-600">סנן לפי תאריך:</label>
                        <input 
                            type="date" 
                            id="dateFilter"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                        />
                        {filterDate && (
                            <button onClick={() => setFilterDate('')} className="text-red-500 text-xs hover:underline">
                                נקה
                            </button>
                        )}
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {filteredAlerts.filter(a => a.status === 'pending').length} ממתינות
                    </span>
                </div>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1 space-y-4 bg-slate-50/50">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="text-slate-600 font-medium animate-pulse">מתחבר לשרת הנתונים...</div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center flex-1 space-y-3 bg-red-50/50">
                    <span className="text-4xl">⚠️</span>
                    <span className="font-bold text-red-600">{error}</span>
                    <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded font-medium transition shadow-sm border border-red-200">
                        נסה להתחבר שוב
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto overflow-y-auto flex-1">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-white sticky top-0 border-b-2 border-slate-200 shadow-sm z-10">
                            <tr className="text-slate-500 text-sm">
                                <th className="p-4 font-bold whitespace-nowrap">תאריך ושעה</th>
                                <th className="p-4 font-bold whitespace-nowrap">חומרה</th>
                                <th className="p-4 font-bold whitespace-nowrap">תיאור אירוע</th>
                                <th className="p-4 font-bold whitespace-nowrap">ניתוח AI (פילוח)</th>
                                <th className="p-4 font-bold whitespace-nowrap">מיקום (מאקרו ומיקרו)</th>
                                <th className="p-4 font-bold whitespace-nowrap">ציוד מנטר</th>
                                <th className="p-4 font-bold whitespace-nowrap">סטטוס טיפול</th>
                                <th className="p-4 font-bold whitespace-nowrap">תיעוד</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAlerts.map((alert) => (
                                <tr key={alert._id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-mono text-slate-600 whitespace-nowrap text-sm">
                                        <div>{formatDateDisplay(alert.timestamp)}</div>
                                        <div className="text-slate-400">{formatTime(alert.timestamp)}</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">{getSeverityBadge(alert.severity)}</td>
                                    <td className="p-4 font-bold text-slate-800">{alert.description}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        {alert.personType ? (
                                            <div className="flex flex-col gap-1">
                                                {/* תוקן ל-confidence */}
                                                <span className={`text-xs px-2 py-1 rounded-full font-bold w-fit ${alert.confidence > 90 ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-200 text-orange-800'}`}>
                                                    {alert.confidence || '0'}% ביטחון
                                                </span>
                                                <span className="text-xs text-slate-600 font-medium">
                                                    זיהוי: <span className="font-bold text-blue-700">{alert.personType === 'adult' ? 'מבוגר' : alert.personType}</span>
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">אין נתוני חכמים</span>
                                        )}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-800">{alert.location}</div>
                                        <div className="text-xs text-slate-500 mt-1">{alert.areaName} ({alert.areaId})</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1 font-mono text-xs text-slate-600">
                                            <span>📷 {alert.cameraId}</span>
                                            <span>🚶 {alert.crosswalkId}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <select 
                                          value={alert.status || 'pending'}
                                          onChange={(e) => handleStatusChange(alert._id, e.target.value)}
                                          className={`font-bold px-2 py-1 rounded outline-none cursor-pointer border text-sm ${getStatusStyle(alert.status || 'pending')}`}
                                        >
                                          <option value="pending">🔴 טרם טופל</option>
                                          <option value="in-progress">🟡 בטיפול</option>
                                          <option value="resolved">🟢 טופל</option>
                                        </select>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {alert.imageUrl ? (
                                            <button 
                                              className="text-blue-600 hover:text-blue-800 text-sm font-bold underline transition"
                                              onClick={() => setSelectedImage(alert.imageUrl)}
                                            >
                                                צפה 🖼️
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-sm">אין</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredAlerts.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">לא נמצאו אירועים לתאריך הנבחר.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>
      </main>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col relative border border-slate-200">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        📷 תיעוד אירוע סכנה מהשטח
                    </h3>
                    <button 
                        onClick={() => setSelectedImage(null)} 
                        className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg font-bold transition flex items-center gap-2 border border-red-100"
                    >
                        סגור <span className="text-lg">✖</span>
                    </button>
                </div>
                <div className="bg-slate-100 rounded-xl flex items-center justify-center p-2 border border-slate-200">
                    <img 
                        src={selectedImage} 
                        alt="Event Snapshot" 
                        className="w-full h-auto rounded-lg max-h-[65vh] object-contain shadow-sm" 
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default DispatcherDashboard;