import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Activity, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const roleColor = {
    ADMIN: 'bg-red-100 text-red-700',
    DOCTOR: 'bg-green-100 text-green-700',
    PATIENT: 'bg-blue-100 text-blue-700',
    EMPLOYEE: 'bg-yellow-100 text-yellow-700',
  };

  const navLinks = {
    ADMIN: [
      { to: '/doctors', label: 'Doctors' },
      { to: '/patients', label: 'Patients' },
      { to: '/appointments', label: 'Appointments' },
      { to: '/billing', label: 'Billing' },
    ],
    DOCTOR: [
      { to: '/doctors', label: 'Doctors' },
      { to: '/patients', label: 'Patients' },
      { to: '/appointments', label: 'Appointments' },
    ],
    PATIENT: [
      { to: '/patients', label: 'My Profile' },
      { to: '/appointments', label: 'Appointments' },
      { to: '/billing', label: 'Billing' },
    ],
    EMPLOYEE: [
      { to: '/billing', label: 'Billing' },
    ],
  };

  const links = navLinks[user.role] || [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">HMS</span>
        </Link>

        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="text-gray-600 hover:text-blue-600 text-sm font-medium">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{user.username}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[user.role] || 'bg-gray-100 text-gray-700'}`}>
              {user.role}
            </span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
