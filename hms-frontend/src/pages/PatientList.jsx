import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Loader2, X } from 'lucide-react';
import { patientAPI } from '../services/ApiService';
import toast from 'react-hot-toast';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const emptyForm = { userId: user.userId, name: '', phone: '', gender: 'MALE', dateOfBirth: '', bloodGroup: '', address: '', emergencyContact: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      if (user.role === 'PATIENT') {
        const res = await patientAPI.getMyProfile();
        setPatients(res.data ? [res.data] : []);
      } else {
        const res = await patientAPI.getAll();
        setPatients(res.data);
      }
    } catch (err) {
      setPatients([]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.gender) { toast.error('Name and gender are required'); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await patientAPI.update(editing, form);
        toast.success('Patient updated');
      } else {
        await patientAPI.create(form);
        toast.success('Patient profile created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchPatients();
    } catch (err) {} finally { setSubmitting(false); }
  };

  const handleEdit = (patient) => {
    setForm({
      userId: patient.userId,
      name: patient.name,
      phone: patient.phone || '',
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth || '',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
    });
    setEditing(patient.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await patientAPI.delete(id);
      toast.success('Patient deleted');
      fetchPatients();
    } catch (err) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{user.role === 'PATIENT' ? 'My Profile' : 'Patients'}</h1>
        {user.role === 'PATIENT' && patients.length === 0 && (
          <button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Create Profile
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Patient' : 'Create Patient Profile'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              <input type="date" placeholder="Date of Birth" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Blood Group" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
              <input type="text" placeholder="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Gender</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Blood Group</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.gender}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.phone || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.bloodGroup || '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  {(user.role === 'PATIENT' || user.role === 'ADMIN') && (
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                  )}
                  {user.role === 'ADMIN' && (
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && <div className="text-center py-8 text-gray-500">No patients found.</div>}
      </div>
    </div>
  );
}
