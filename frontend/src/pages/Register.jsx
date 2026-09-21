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
    // רקע גרדיאנט כהה ומודרני - זהה לעמוד ההתחברות
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 font-sans" dir="rtl">
      
      {/* כרטיס אפקט זכוכית (Glassmorphism) */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] w-full max-w-md">
        
        {/* אזור הלוגו */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 shadow-inner">
             <span className="text-3xl">🚦</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">SafeCross</h2>
          <p className="text-blue-200 text-sm font-medium">יצירת חשבון מפעיל חדש</p>
        </div>

        {/* הודעת הצלחה מותאמת לעיצוב הכהה */}
        {message ? (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-xl mb-4 font-medium text-center backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            {message}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="שם משתמש (באנגלית בלבד)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="כתובת אימייל"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="סיסמה"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="אימות סיסמה"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] transition-all duration-300"
            >
              הירשם
            </button>
          </form>
        )}

        {/* כפתור חזרה המותאם לעיצוב הכהה */}
        <div className="mt-6 text-sm text-center text-gray-400">
          כבר יש לך חשבון?{' '}
          <span 
            onClick={() => navigate('/')} 
            className="text-blue-400 font-bold cursor-pointer hover:text-blue-300 hover:underline transition-colors"
          >
            חזור להתחברות
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;