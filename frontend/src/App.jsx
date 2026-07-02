import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard'; // ייבוא המסך החדש

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* נתיב אדמין */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        <Route path="/technician" element={<TechnicianDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;