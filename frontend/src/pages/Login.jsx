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
    <div className="flex justify-center items-center h-screen bg-gray-100 font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">SafeCross 🚦</h2>
        <p className="text-gray-500 mb-6">מערכת ניהול צמתים חכמה</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="שם משתמש או אימייל"
            className="p-3 border border-gray-300 rounded text-right bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="סיסמה"
            className="p-3 border border-gray-300 rounded text-right bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition mt-2 shadow-md"
          >
            התחבר למערכת
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          עדיין אין לך חשבון?{' '}
          <span 
            onClick={() => navigate('/register')} 
            className="text-blue-600 font-bold cursor-pointer hover:underline"
          >
            הירשם כאן
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;