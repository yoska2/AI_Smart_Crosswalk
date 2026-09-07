import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("הסיסמאות אינן תואמות, אנא נסה שוב.");
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      setMessage("הרשמתך בוצעה בהצלחה! אנא בדוק את תיבת המייל שלך כדי לאמת את החשבון.");
      
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      alert("שגיאה בתהליך ההרשמה. אנא נסה שוב.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">SafeCross 🚦</h2>
        <p className="text-gray-500 mb-6">יצירת חשבון מפעיל חדש</p>

        {message ? (
          <div className="bg-green-100 text-green-800 border border-green-300 p-4 rounded mb-4 font-medium">
            {message}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="שם משתמש (באנגלית בלבד)"
              className="p-3 border border-gray-300 rounded text-right bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="כתובת אימייל"
              className="p-3 border border-gray-300 rounded text-right bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none text-left direction-ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <input
              type="password"
              placeholder="אימות סיסמה"
              className="p-3 border border-gray-300 rounded text-right bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition mt-2 shadow-md"
            >
              הירשם
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-gray-600">
          כבר יש לך חשבון?{' '}
          <span 
            onClick={() => navigate('/')} 
            className="text-blue-600 font-bold cursor-pointer hover:underline"
          >
            חזור להתחברות
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;