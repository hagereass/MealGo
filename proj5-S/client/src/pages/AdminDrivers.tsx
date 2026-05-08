import { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Search, Plus, MapPin, Star, Edit, Trash2, Check, X, Bike, TrendingUp } from 'lucide-react';

const API_BASE = 'https://mealgo-production.up.railway.app';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  joinedDate: string;
  deliveries: number;
  rating: number;
  earnings: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  currentLocation?: string;
  availability: 'available' | 'busy' | 'offline';
}

export default function AdminDrivers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Driver['status']>('all');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('status', statusFilter);

      const response = await fetch(`${API_BASE}/api/admin/drivers?${params.toString()}`);

      if (!response.ok) throw new Error('Failed to fetch drivers');

      const data = await response.json();
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchDrivers, 250);
    return () => clearTimeout(t);
  }, [searchQuery, statusFilter]);

  const handleApprove = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/admin/drivers/${id}/approve`, {
      method: 'PATCH',
    });

    if (!res.ok) return alert('Failed to approve');
    fetchDrivers();
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const res = await fetch(`${API_BASE}/api/admin/drivers/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) return alert('Failed to reject');
    fetchDrivers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const res = await fetch(`${API_BASE}/api/admin/drivers/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) return alert('Failed to delete');
    fetchDrivers();
  };

  const toggleStatus = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/admin/drivers/${id}/toggle-status`, {
      method: 'PATCH',
    });

    if (!res.ok) return alert('Failed to update status');
    fetchDrivers();
  };

  const handleCreateDriver = async () => {
    const name = prompt('Driver name');
    if (!name) return;

    const email = prompt('Driver email');
    if (!email) return;

    const phone = prompt('Phone number');
    if (!phone) return;

    const vehicleType = prompt('Vehicle type') || 'Motorcycle';
    const vehicleNumber = prompt('Vehicle number');
    if (!vehicleNumber) return;

    const res = await fetch(`${API_BASE}/api/admin/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        vehicleType,
        vehicleNumber,
        status: 'pending',
      }),
    });

    if (!res.ok) return alert('Failed to create driver');
    fetchDrivers();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between mb-6">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drivers..."
            className="border p-2 rounded"
          />

          <button
            onClick={handleCreateDriver}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Add Driver
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid gap-4">
          {drivers.map((d) => (
            <div key={d.id} className="bg-white p-4 rounded shadow">
              <h3>{d.name}</h3>
              <p>{d.email}</p>

              <div className="flex gap-2 mt-2">
                <button onClick={() => handleApprove(d.id)}>Approve</button>
                <button onClick={() => handleReject(d.id)}>Reject</button>
                <button onClick={() => toggleStatus(d.id)}>Toggle</button>
                <button onClick={() => handleDelete(d.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}