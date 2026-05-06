import { Users, Stethoscope, Calendar, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const cards = [
    { title: 'Doctors', icon: Stethoscope, link: '/doctors', color: 'bg-green-50 text-green-600', desc: 'View & manage doctors' },
    { title: 'Patients', icon: Users, link: '/patients', color: 'bg-blue-50 text-blue-600', desc: 'View & manage patients' },
    { title: 'Appointments', icon: Calendar, link: '/appointments', color: 'bg-yellow-50 text-yellow-600', desc: 'Book & track appointments' },
    { title: 'Billing', icon: Receipt, link: '/billing', color: 'bg-purple-50 text-purple-600', desc: 'Invoices & payments' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.username}</h1>
        <p className="text-gray-500 mt-1">Hospital Management System Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.title} to={card.link} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-800">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>

      {user.role === 'ADMIN' && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-800 mb-2">Admin Panel</h3>
          <p className="text-sm text-red-600">You have full access: approve doctors, manage patients, update billing, and control appointments.</p>
        </div>
      )}
      {user.role === 'DOCTOR' && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-800 mb-2">Doctor Panel</h3>
          <p className="text-sm text-green-600">Create your profile, manage appointments, and generate invoices for patients.</p>
        </div>
      )}
      {user.role === 'PATIENT' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Patient Panel</h3>
          <p className="text-sm text-blue-600">Create your profile, book appointments with doctors, and view your billing history.</p>
        </div>
      )}
    </div>
  );
}
