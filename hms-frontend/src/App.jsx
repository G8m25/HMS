import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorList from './pages/DoctorList';
import PatientList from './pages/PatientList';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/doctors" element={<PrivateRoute><RoleRoute allowedRoles={['DOCTOR', 'ADMIN']}><Layout><DoctorList /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/patients" element={<PrivateRoute><RoleRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}><Layout><PatientList /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><RoleRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}><Layout><Appointments /></Layout></RoleRoute></PrivateRoute>} />
        <Route path="/billing" element={<PrivateRoute><RoleRoute allowedRoles={['PATIENT', 'ADMIN', 'EMPLOYEE']}><Layout><Billing /></Layout></RoleRoute></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default App;
