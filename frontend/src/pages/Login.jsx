import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token";
      
      localStorage.setItem('token', mockToken);
      
      const lowerUser = username.toLowerCase();
      
      if (lowerUser === 'admin') {
        navigate('/admin');
      } else if (lowerUser === 'manager') {
        navigate('/manager');
      } else if (lowerUser === 'tech') {
        navigate('/technician');
      } else {
        navigate('/dispatcher');
      }

    } catch (error) {
      alert("שגיאה בהתחברות. אנא נסה שוב.");
    }
  };

  return (
    // רקע גרדיאנט כהה ומודרני
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 font-sans" dir="rtl">
      
      {/* כרטיס אפקט זכוכית (Glassmorphism) */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] w-full max-w-md">
        
        {/* אזור הלוגו */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-5 shadow-inner">
             <span className="text-3xl">🚦</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">SafeCross</h2>
          <p className="text-blue-200 text-sm font-medium">מערכת ניהול צמתים חכמה</p>
        </div>

        {/* טופס התחברות */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">שם משתמש או אימייל</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
              placeholder="admin@safecross.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">סיסמה</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] transition-all duration-300"
          >
            התחבר למערכת
          </button>
        </form>

        {/* כפתור הרשמה המותאם לעיצוב הכהה */}
        <div className="mt-8 text-sm text-center text-gray-400">
          עדיין אין לך חשבון?{' '}
          <span 
            onClick={() => navigate('/register')} 
            className="text-blue-400 font-bold cursor-pointer hover:text-blue-300 hover:underline transition-colors"
          >
            הירשם כאן
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;