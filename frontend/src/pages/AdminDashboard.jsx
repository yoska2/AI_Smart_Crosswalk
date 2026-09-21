import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);

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
    return <span className={`px-2 py-1 rounded text-xs font-bold border whitespace-nowrap ${roles[role]}`}>{role}</span>;
  };

  const filteredUsers = users.filter(user => 
    user.name.includes(searchTerm) || 
    user.username.includes(searchTerm) ||
    user.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans" dir="rtl">
      
      {/* תפריט צד מותאם למובייל */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:p-6 flex flex-col md:justify-between shadow-2xl z-20 shrink-0 md:h-full">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-center border-b border-slate-700 pb-4 text-purple-400">
            SafeCross Core ⚙️
          </h1>
          <nav className="flex flex-row md:flex-col gap-2 md:gap-3 text-slate-300 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
            <button className="text-right text-white bg-slate-800 px-4 py-2 md:p-3 rounded font-medium transition shadow-sm border border-slate-700 text-sm md:text-base">
              👥 ניהול משתמשים
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 px-4 py-2 md:p-3 rounded transition text-sm md:text-base">
              🔐 הגדרות אבטחה
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 px-4 py-2 md:p-3 rounded transition text-sm md:text-base">
              📡 ניהול API וחיבורים
            </button>
            <button className="text-right hover:text-white hover:bg-slate-800 px-4 py-2 md:p-3 rounded transition text-sm md:text-base">
              📜 לוג מערכת (Audit)
            </button>
          </nav>
        </div>
        
        <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-stretch gap-3 mt-4 md:mt-0">
            <div className="bg-slate-800 px-3 py-2 md:p-3 rounded text-xs md:text-sm text-center border border-slate-700 text-purple-300">
                👑 Super Admin
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition font-bold shadow-md text-sm md:text-base"
            >
                התנתק
            </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto w-full">
        
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 border-b border-slate-200 pb-4 md:pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">מסוף ניהול מערכת (Admin)</h2>
            <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">ניהול הרשאות, משתמשים והגדרות ליבה</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 md:px-6 rounded-lg shadow-md font-bold transition flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center">
            <span>+</span> הוסף משתמש חדש
          </button>
        </header>

        <div className="flex flex-col gap-4 md:gap-6 flex-1">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 shrink-0 mb-2 md:mb-4">
              <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-xs md:text-sm font-bold mb-1">סה"כ משתמשים רשומים</div>
                    <div className="text-2xl md:text-3xl font-black text-slate-800">{users.length}</div>
                  </div>
                  <div className="text-3xl md:text-4xl opacity-20">👥</div>
              </div>
              <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-xs md:text-sm font-bold mb-1">משתמשים פעילים</div>
                    <div className="text-2xl md:text-3xl font-black text-green-600">
                        {users.filter(u => u.status === 'active').length}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl opacity-20">✅</div>
              </div>
              <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-xs md:text-sm font-bold mb-1">מושהים / נעולים</div>
                    <div className="text-2xl md:text-3xl font-black text-red-500">
                        {users.filter(u => u.status === 'suspended').length}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl opacity-20">🔒</div>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col flex-1 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <span>רשימת הרשאות ומשתמשים</span>
                  <input 
                      type="text" 
                      placeholder="חיפוש משתמש או מזהה..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="p-2 px-3 border border-slate-300 rounded text-sm outline-none focus:border-purple-500 w-full sm:w-64 font-normal"
                  />
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[800px]">
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
                                          <span className="text-green-600 font-bold text-xs flex items-center gap-1 whitespace-nowrap">🟢 פעיל</span>
                                      ) : (
                                          <span className="text-red-500 font-bold text-xs flex items-center gap-1 whitespace-nowrap">🔴 מושהה</span>
                                      )}
                                  </td>
                                  <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-3 text-sm">
                                          <button className="text-blue-600 hover:text-blue-800 font-bold transition">
                                              ערוך
                                          </button>
                                          <button 
                                              onClick={() => handleToggleStatus(user.id)}
                                              className={`${user.status === 'active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'} font-bold transition whitespace-nowrap`}
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