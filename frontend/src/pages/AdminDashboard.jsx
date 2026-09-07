import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [users, setUsers] = useState([
    { id: 'U-001', name: 'ישראל ישראלי', username: 'admin', role: 'Admin', status: 'active', lastLogin: '2026-07-02 08:30' },
    { id: 'U-002', name: 'אבי מנהל', username: 'manager', role: 'Manager', status: 'active', lastLogin: '2026-07-02 09:15' },
    { id: 'U-003', name: 'דניאל כהן', username: 'dispatcher1', role: 'Dispatcher', status: 'active', lastLogin: '2026-07-02 14:10' },
    { id: 'U-004', name: 'רונית לוי', username: 'dispatcher2', role: 'Dispatcher', status: 'active', lastLogin: '2026-07-02 15:00' },
    { id: 'U-005', name: 'משה קבלן', username: 'tech', role: 'Technician', status: 'active', lastLogin: '2026-07-01 10:20' },
    { id: 'U-006', name: 'יעל שגיא', username: 'yaels', role: 'Dispatcher', status: 'suspended', lastLogin: '2026-06-15 11:45' },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה? פעולה זו בלתי הפיכה.')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };
  
  const handleToggleStatus = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === 'active' ? 'suspended' : 'active' };
      }
      return user;
    }));
  };

  const getRoleBadge = (role) => {
    const roles = {
      Admin: 'bg-purple-100 text-purple-800 border-purple-200',
      Manager: 'bg-blue-100 text-blue-800 border-blue-200',
      Dispatcher: 'bg-slate-100 text-slate-800 border-slate-200',
      Technician: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold border ${roles[role]}`}>{role}</span>;
  };

  const filteredUsers = users.filter(user => 
    user.name.includes(searchTerm) || 
    user.username.includes(searchTerm) ||
    user.id.includes(searchTerm)
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans" dir="rtl">
      
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-2xl z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center border-b border-slate-700 pb-4 text-purple-400">
            SafeCross Core ⚙️
          </h1>
          <nav className="flex flex-col gap-3 text-slate-300">
            <button className="text-right text-white bg-slate-800 p-3 rounded font-medium transition shadow-sm border border-slate-700">
              👥 ניהול משתמשים
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 p-3 rounded transition">
              🔐 הגדרות אבטחה
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 p-3 rounded transition">
              📡 ניהול API וחיבורים
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 p-3 rounded transition">
              📜 לוג מערכת (Audit)
            </button>
          </nav>
        </div>
        
        <div className="flex flex-col gap-3">
            <div className="bg-slate-800 p-3 rounded text-sm text-center border border-slate-700 text-purple-300">
                👑 מחובר כ-Super Admin
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition font-bold shadow-md"
            >
                התנתק
            </button>
        </div>
      </aside>

      <main className="flex-1 p-8 flex flex-col overflow-y-auto">
        
        <header className="mb-8 flex justify-between items-center shrink-0 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">מסוף ניהול מערכת (Admin Console)</h2>
            <p className="text-slate-500 mt-2">ניהול הרשאות, משתמשים והגדרות ליבה של המערכת</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md font-bold transition flex items-center gap-2">
            <span>+</span> הוסף משתמש חדש
          </button>
        </header>

        <div className="flex flex-col gap-6 flex-1">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 mb-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-sm font-bold mb-1">סה"כ משתמשים רשומים</div>
                    <div className="text-3xl font-black text-slate-800">{users.length}</div>
                  </div>
                  <div className="text-4xl opacity-20">👥</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-sm font-bold mb-1">משתמשים פעילים</div>
                    <div className="text-3xl font-black text-green-600">
                        {users.filter(u => u.status === 'active').length}
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">✅</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-sm font-bold mb-1">מושהים / נעולים</div>
                    <div className="text-3xl font-black text-red-500">
                        {users.filter(u => u.status === 'suspended').length}
                    </div>
                  </div>
                  <div className="text-4xl opacity-20">🔒</div>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col flex-1 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                  <span>רשימת הרשאות ומשתמשים</span>
                  <input 
                      type="text" 
                      placeholder="חיפוש משתמש או מזהה..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="p-1.5 px-3 border border-slate-300 rounded text-sm outline-none focus:border-purple-500 w-64 font-normal"
                  />
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-right">
                      <thead className="bg-white border-b-2 border-slate-200 text-slate-500 text-sm">
                          <tr>
                              <th className="p-4 font-bold">מזהה</th>
                              <th className="p-4 font-bold">שם מלא</th>
                              <th className="p-4 font-bold">שם משתמש (Login)</th>
                              <th className="p-4 font-bold">תפקיד / הרשאה</th>
                              <th className="p-4 font-bold">התחברות אחרונה</th>
                              <th className="p-4 font-bold">סטטוס</th>
                              <th className="p-4 font-bold text-center">פעולות אדמין</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredUsers.map((user) => (
                              <tr key={user.id} className={`hover:bg-slate-50 transition ${user.status === 'suspended' ? 'bg-red-50/30' : ''}`}>
                                  <td className="p-4 font-mono text-sm text-slate-500">{user.id}</td>
                                  <td className="p-4 font-bold text-slate-800">{user.name}</td>
                                  <td className="p-4 text-slate-600 font-mono text-sm">{user.username}</td>
                                  <td className="p-4">{getRoleBadge(user.role)}</td>
                                  <td className="p-4 text-sm text-slate-500">{user.lastLogin}</td>
                                  <td className="p-4">
                                      {user.status === 'active' ? (
                                          <span className="text-green-600 font-bold text-xs flex items-center gap-1">🟢 פעיל</span>
                                      ) : (
                                          <span className="text-red-500 font-bold text-xs flex items-center gap-1">🔴 מושהה</span>
                                      )}
                                  </td>
                                  <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-3 text-sm">
                                          <button className="text-blue-600 hover:text-blue-800 font-bold transition">
                                              ערוך
                                          </button>
                                          <button 
                                              onClick={() => handleToggleStatus(user.id)}
                                              className={`${user.status === 'active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'} font-bold transition`}
                                          >
                                              {user.status === 'active' ? 'השהה' : 'הפעל'}
                                          </button>
                                          <button 
                                              onClick={() => handleDeleteUser(user.id)}
                                              className="text-red-600 hover:text-red-800 font-bold transition"
                                          >
                                              מחק
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {filteredUsers.length === 0 && (
                              <tr>
                                  <td colSpan="7" className="p-8 text-center text-slate-500">
                                      לא נמצאו משתמשים התואמים לחיפוש.
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

export default AdminDashboard;