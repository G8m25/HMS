import { useState, useEffect } from 'react';
import { Receipt, Plus, Loader2, X } from 'lucide-react';
import { billingAPI, appointmentAPI } from '../services/ApiService';
import toast from 'react-hot-toast';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({ appointmentId: '', totalAmount: '', tax: '0', paymentMethod: 'CASH' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user.role === 'PATIENT') {
        const res = await billingAPI.getMyInvoices();
        setInvoices(res.data);
      } else {
        const res = await billingAPI.getAll();
        setInvoices(res.data);
        if (user.role === 'ADMIN') {
          const apptRes = await appointmentAPI.getAll();
          setAppointments(apptRes.data);
        }
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.appointmentId || !form.totalAmount) { toast.error('Appointment and amount are required'); return; }
    setSubmitting(true);
    try {
      const selectedAppt = appointments.find(a => a.id === parseInt(form.appointmentId));
      await billingAPI.create({
        appointmentId: parseInt(form.appointmentId),
        patientId: selectedAppt ? selectedAppt.patientId : null,
        totalAmount: parseFloat(form.totalAmount),
        tax: parseFloat(form.tax),
        paymentMethod: form.paymentMethod,
      });
      toast.success('Invoice created');
      setShowForm(false);
      fetchData();
    } catch (err) {} finally { setSubmitting(false); }
  };

  const handleMarkPaid = async (id) => {
    try {
      await billingAPI.markPaid(id);
      toast.success('Invoice marked as paid');
      fetchData();
    } catch (err) {}
  };

  const handlePay = async (id) => {
    try {
      await billingAPI.payInvoice(id, 'CARD');
      toast.success('Payment successful!');
      fetchData();
    } catch (err) {}
  };

  const paymentBadge = {
    PAID: 'bg-green-100 text-green-700',
    UNPAID: 'bg-red-100 text-red-700',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
        {user.role === 'ADMIN' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Invoice</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment</label>
                <select value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select appointment</option>
                  {appointments.filter(a => a.status === 'COMPLETED').map(a => (
                    <option key={a.id} value={a.id}>#{a.id} - Patient {a.patientId} (Dr {a.doctorId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input type="number" step="0.01" placeholder="0.00" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                <input type="number" step="0.01" placeholder="0.00" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="INSURANCE">Insurance</option>
                </select>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Invoice #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Appointment</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tax</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Method</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">#{inv.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">Appt #{inv.appointmentId}</td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">${inv.totalAmount}</td>
                <td className="px-4 py-3 text-sm text-gray-600">${inv.tax}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{inv.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentBadge[inv.paymentStatus]}`}>{inv.paymentStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {user.role === 'PATIENT' && inv.paymentStatus === 'UNPAID' && (
                      <button onClick={() => handlePay(inv.id)} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">Pay with Card</button>
                    )}
                    {(user.role === 'ADMIN' || user.role === 'EMPLOYEE') && inv.paymentStatus !== 'PAID' && (
                      <button onClick={() => handleMarkPaid(inv.id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Mark Paid</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <div className="text-center py-8 text-gray-500">No invoices found.</div>}
      </div>
    </div>
  );
}