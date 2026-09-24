import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const systemUsers = [
    { username: 'admin', password: '123456', role: 'admin', path: '/admin' },
    { username: 'manager', password: '123456', role: 'manager', path: '/manager' },
    { username: 'tech', password: '123456', role: 'technician', path: '/technician' },
    { username: 'dispatcher', password: '123456', role: 'dispatcher', path: '/dispatcher' },
    { username: 'david_1', password: '123456', role: 'dispatcher', path: '/dispatcher' } 
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    
    const trimmedUser = username.trim().toLowerCase();

    const englishOnlyRegex = /^[a-z0-9_]+$/;
    if (!englishOnlyRegex.test(trimmedUser)) {
      alert('שם המשתמש חייב להיות באנגלית בלבד (ללא עברית או רווחים).');
      return;
    }

    if (password.length < 6) {
      alert('הסיסמה חייבת להכיל לפחות 6 תווים או מספרים.');
      return;
    }

    const foundUser = systemUsers.find(u => u.username === trimmedUser);

    if (!foundUser) {
      alert('שם המשתמש אינו קיים במערכת.');
      return;
    }

    if (foundUser.password !== password) {
      alert('הסיסמה שגויה. אנא נסה שוב.');
      return;
    }

    try {
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token";
      localStorage.setItem('token', mockToken);
      
      navigate(foundUser.path);

    } catch (error) {
      alert("שגיאה בהתחברות. אנא נסה שוב.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 font-sans" dir="rtl">
      
      <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] w-full max-w-md">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-5 shadow-inner">
             <span className="text-3xl">🚦</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">SafeCross</h2>
          <p className="text-blue-200 text-sm font-medium">מערכת ניהול צמתים חכמה</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">שם משתמש (אנגלית בלבד)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left font-mono"
              placeholder="הקלד שם משתמש"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">סיסמה (לפחות 6 תווים)</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left font-mono"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] transition-all duration-300 cursor-pointer"
          >
            התחבר למערכת
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;