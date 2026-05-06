import { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle, Trash2, Plus, Loader2, X } from 'lucide-react';
import { doctorAPI } from '../services/ApiService';
import toast from 'react-hot-toast';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    userId: user.userId,
    name: '',
    specialization: '',
    phone: '',
    email: '',
    experienceYears: 0,
    consultationFee: 0,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getAll();
      setDoctors(res.data);
    } catch (err) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialization || !form.consultationFee) {
      toast.error('Please fill required fields');
      return;
    }
    setSubmitting(true);
    try {
      await doctorAPI.create(form);
      toast.success('Doctor profile created! Awaiting admin approval.');
      setShowForm(false);
      fetchDoctors();
    } catch (err) {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await doctorAPI.approve(id);
      toast.success('Doctor approved!');
      fetchDoctors();
    } catch (err) {
      // handled by interceptor
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await doctorAPI.delete(id);
      toast.success('Doctor deleted');
      fetchDoctors();
    } catch (err) {
      // handled by interceptor
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctors</h1>
        {user.role === 'DOCTOR' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Create Profile
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Doctor Profile</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Specialization *" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Experience (years)" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Consultation Fee *" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${doctor.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {doctor.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <p>Fee: <span className="font-medium">${doctor.consultationFee}</span></p>
              <p>Experience: {doctor.experienceYears} years</p>
              {doctor.phone && <p>Phone: {doctor.phone}</p>}
            </div>
            {user.role === 'ADMIN' && (
              <div className="mt-4 flex gap-2">
                {!doctor.isApproved && (
                  <button onClick={() => handleApprove(doctor.id)} className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
                <button onClick={() => handleDelete(doctor.id)} className="flex items-center gap-1 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12 text-gray-500">No doctors found.</div>
      )}
    </div>
  );
}
