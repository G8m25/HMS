import { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, X } from 'lucide-react';
import { appointmentAPI, doctorAPI } from '../services/ApiService';
import toast from 'react-hot-toast';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({ doctorId: '', appDate: '', reason: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let apptRes;
      if (user.role === 'PATIENT') {
        apptRes = await appointmentAPI.getByPatient(user.userId);
      } else if (user.role === 'DOCTOR') {
        apptRes = await appointmentAPI.getByDoctor();
      } else {
        apptRes = await appointmentAPI.getAll();
      }
      const docRes = await doctorAPI.getAll();
      setAppointments(apptRes.data);
      setDoctors(docRes.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.appDate) { toast.error('Doctor and date are required'); return; }
    setSubmitting(true);
    try {
      await appointmentAPI.book({ ...form, patientId: user.userId, doctorId: parseInt(form.doctorId) });
      toast.success('Appointment booked!');
      setShowForm(false);
      fetchData();
    } catch (err) {} finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      toast.success(`Appointment ${status.toLowerCase()}`);
      fetchData();
    } catch (err) {}
  };

  const handleCancel = async (id) => {
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled');
      fetchData();
    } catch (err) {}
  };

  const statusBadge = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        {user.role === 'PATIENT' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Book Appointment</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a doctor</option>
                  {doctors.filter(d => d.isApproved).map(d => (
                    <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input type="datetime-local" value={form.appDate} onChange={(e) => setForm({ ...form, appDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input type="text" placeholder="Reason for visit" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Patient ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Doctor ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Reason</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800">{appt.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{appt.patientId}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{appt.doctorId}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(appt.appDate).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{appt.reason || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge[appt.status]}`}>{appt.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(user.role === 'DOCTOR' || user.role === 'ADMIN') && appt.status === 'PENDING' && (
                      <button onClick={() => handleStatusUpdate(appt.id, 'CONFIRMED')} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">Confirm</button>
                    )}
                    {(user.role === 'DOCTOR' || user.role === 'ADMIN') && appt.status === 'CONFIRMED' && (
                      <button onClick={() => handleStatusUpdate(appt.id, 'COMPLETED')} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Complete</button>
                    )}
                    {(user.role === 'PATIENT' || user.role === 'ADMIN') && (appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                      <button onClick={() => handleCancel(appt.id)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <div className="text-center py-8 text-gray-500">No appointments found.</div>}
      </div>
    </div>
  );
}
