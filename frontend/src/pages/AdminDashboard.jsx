import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Dispatcher'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${apiUrl}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה? פעולה זו בלתי הפיכה.')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${apiUrl}/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setUsers(users.filter(user => user.id !== id && user._id !== id));
        } else {
          alert('שגיאה במחיקת המשתמש מול השרת.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          (user.id === id || user._id === id) ? { ...user, status: newStatus } : user
        ));
      } else {
        alert('שגיאה בעדכון סטטוס המשתמש מול השרת.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim().toLowerCase();
    const trimmedPassword = formData.password.trim();

    if (!trimmedName.includes(' ')) {
      alert('נא להזין שם מלא הכולל לפחות שתי שמות (שם פרטי ומשפחה)');
      return;
    }

    if (!trimmedUsername) {
      alert('נא למלא את שם המשתמש');
      return;
    }

    if (trimmedPassword.length < 6) {
      alert('הסיסמה שהאדמין הגדיר חייבת להכיל לפחות 6 תווים.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmedName,
          username: trimmedUsername,
          password: trimmedPassword,
          role: formData.role
        })
      });

      if (response.status === 400 || response.status === 409) {
        alert(`שם המשתמש "${trimmedUsername}" כבר תפוס במערכת! יש לבחור שם משתמש ייחודי.`);
        return;
      }

      if (response.ok) {
        const newUserFromDB = await response.json();
        setUsers([...users, newUserFromDB]);
        setFormData({ name: '', username: '', password: '', role: 'Dispatcher' });
        setIsModalOpen(false);
      } else {
        alert('אירעה שגיאה ביצירת המשתמש מול השרת.');
      }
      
    } catch (error) {
      console.error(error);
      alert('שגיאת תקשורת מול השרת.');
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      Admin: 'bg-purple-100 text-purple-800 border-purple-200',
      Manager: 'bg-blue-100 text-blue-800 border-blue-200',
      Dispatcher: 'bg-slate-100 text-slate-800 border-slate-200',
      Technician: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold border whitespace-nowrap ${roles[role] || 'bg-gray-100 text-gray-800'}`}>{role}</span>;
  };

  const filteredUsers = users.filter(user => 
    (user.name && user.name.includes(searchTerm)) || 
    (user.username && user.username.includes(searchTerm)) ||
    (user.id && user.id.includes(searchTerm)) ||
    (user._id && user._id.includes(searchTerm))
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans" dir="rtl">
      
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:p-6 flex flex-col md:justify-between shadow-2xl z-20 shrink-0 md:h-full">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-center border-b border-slate-700 pb-4 text-purple-400">
            SafeCross Core ⚙️
          </h1>
          <nav className="flex flex-row md:flex-col gap-2 md:gap-3 text-slate-300 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
            <button className="text-right text-white bg-slate-800 px-4 py-2 md:p-3 rounded font-medium transition shadow-sm border border-slate-700 text-sm md:text-base">
              👥 ניהול משתמשים
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

      <main className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto w-full relative">
        
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 border-b border-slate-200 pb-4 md:pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">מסוף ניהול מערכת (Admin)</h2>
            <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">ניהול הרשאות ומשתמשי המערכת</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 md:px-6 rounded-lg shadow-md font-bold transition flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center cursor-pointer"
          >
            <span>+</span> הוסף משתמש חדש
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
            <span className="text-slate-500 text-sm font-medium">טוען משתמשים מהשרת...</span>
          </div>
        ) : (
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
                      <div className="text-slate-500 text-xs md:text-sm font-bold mb-1">משתמשים מושהים</div>
                      <div className="text-2xl md:text-3xl font-black text-red-500">
                          {users.filter(u => u.status === 'suspended').length}
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl opacity-20">🔒</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span>רשימת משתמשים והרשאות</span>
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
                            {filteredUsers.map((user) => {
                                const userId = user._id || user.id;
                                return (
                                <tr key={userId} className={`hover:bg-slate-50 transition ${user.status === 'suspended' ? 'bg-red-50/30' : ''}`}>
                                    <td className="p-4 font-mono text-sm text-slate-500">{userId ? userId.substring(0, 8) + '...' : ''}</td>
                                    <td className="p-4 font-bold text-slate-800">{user.name}</td>
                                    <td className="p-4 text-slate-600 font-mono text-sm">{user.username}</td>
                                    <td className="p-4">{getRoleBadge(user.role)}</td>
                                    <td className="p-4 text-sm text-slate-500">{user.lastLogin || 'טרם התחבר'}</td>
                                    <td className="p-4">
                                        {user.status === 'active' ? (
                                            <span className="text-green-600 font-bold text-xs flex items-center gap-1 whitespace-nowrap">🟢 פעיל</span>
                                        ) : (
                                            <span className="text-red-500 font-bold text-xs flex items-center gap-1 whitespace-nowrap">🔴 מושהה</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-3 text-sm">
                                            <button 
                                                onClick={() => handleToggleStatus(userId, user.status)}
                                                className={`${user.status === 'active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'} font-bold transition whitespace-nowrap`}
                                            >
                                                {user.status === 'active' ? 'השהה' : 'הפעל'}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(userId)}
                                                className="text-red-600 hover:text-red-800 font-bold transition"
                                            >
                                                מחק
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
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
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-800">👤 יצירת משתמש חדש</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 font-bold text-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">שם מלא (לפחות שתי שמות)</label>
                <input 
                  type="text" 
                  placeholder="למשל: דוד לוי"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">שם משתמש (Login - ייחודי)</label>
                <input 
                  type="text" 
                  placeholder="למשל: david_l"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">סיסמה זמנית (לפחות 6 תווים)</label>
                <input 
                  type="password" 
                  placeholder="הקלד סיסמה למשתמש..."
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">תפקיד / הרשאה במערכת</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-purple-500 bg-white cursor-pointer"
                >
                  <option value="Dispatcher">מוקדן (Dispatcher)</option>
                  <option value="Manager">מנהל אזור (Manager)</option>
                  <option value="Technician">טכנאי (Technician)</option>
                  <option value="Admin">אדמין (Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                >
                  ביטול
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow transition cursor-pointer"
                >
                  צור משתמש
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;