import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Search, User, Truck, Clock, MapPin, Phone } from 'lucide-react';
import { getRoleSession, setCurrentUserSession } from '../utils/session';
const API_BASE = 'https://mealgo-production.up.railway.app';

export const api = {
  get: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`);
    return handleResponse(res);
  },

  post: async (url: string, body: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  patch: async (url: string, body?: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  delete: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }

  return res.text();
}
interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerPhone?: string | null;
  items: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  orderTime: string;
  estimatedDelivery?: string | null;
  deliveryAddress: string;
  driver?: string | null;
  paymentMethod: string;
}

interface DriverOption {
  id: string;
  name: string;
  phone?: string | null;
  availability: string;
  vehicleType?: string | null;
}

type StatusFilter = 'all' | 'active' | 'history' | Order['status'];

export default function RestaurantOrders() {
  const fallbackRestaurantId = '77777777-7777-7777-7777-777777777771';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverSelections, setDriverSelections] = useState<Record<string, string>>({});
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = getRoleSession('restaurant');
    if (!user) {
      setRestaurantId(fallbackRestaurantId);
      return;
    }
    setCurrentUserSession(user);
    setRestaurantId(user.restaurantId || fallbackRestaurantId);
  }, []);

  const fetchOrders = async () => {
    if (!restaurantId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('status', statusFilter);

      const response = await fetch(`${API_BASE}/api/restaurants/${restaurantId}/orders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 250);
    return () => clearTimeout(t);
  }, [restaurantId, searchQuery, statusFilter]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('${API_BASE}/api/drivers/available');
        if (!response.ok) return;
        const data = await response.json();
        setDrivers(data);
        if (data.length > 0) {
          setSelectedDriverId(data[0].id);
          setDriverSelections((current) => {
            const next = { ...current };
            for (const order of orders) {
              if (!next[order.id]) next[order.id] = data[0].id;
            }
            return next;
          });
        }
      } catch {
        setDrivers([]);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    if (drivers.length === 0) return;
    setDriverSelections((current) => {
      const next = { ...current };
      for (const order of orders) {
        if (!next[order.id]) next[order.id] = drivers[0].id;
      }
      return next;
    });
  }, [orders, drivers]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }), [orders]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'preparing':
        return 'bg-blue-100 text-blue-700';
      case 'ready':
        return 'bg-purple-100 text-purple-700';
      case 'delivering':
        return 'bg-orange-100 text-orange-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const getPrimaryAction = (status: Order['status']) => {
    if (status === 'pending') return { label: 'Start Preparing', nextStatus: 'preparing' as Order['status'] };
    if (status === 'preparing') return { label: 'Send To Delivery', nextStatus: 'delivering' as Order['status'] };
    if (status === 'ready') return { label: 'Send To Delivery', nextStatus: 'delivering' as Order['status'] };
    if (status === 'delivering') return { label: 'Mark Delivered', nextStatus: 'delivered' as Order['status'] };
    return null;
  };

  const updateOrderStatus = async (orderId: string, nextStatus: Order['status']) => {
    if (!restaurantId) return;

    try {
      setSavingOrderId(orderId);
      const response = await fetch(`${API_BASE}/api/restaurants/${restaurantId}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const rawText = await response.text();
      const payload = rawText
        ? (() => {
            try {
              return JSON.parse(rawText);
            } catch {
              return { message: rawText };
            }
          })()
        : {};
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to update order status');
      }

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: payload.status } : order))
      );
      setSelectedOrder((current) => (current && current.id === orderId ? { ...current, status: payload.status } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setSavingOrderId(null);
    }
  };

  const assignDriver = async (orderId: string, driverIdOverride?: string) => {
    const driverId = driverIdOverride || selectedDriverId;
    if (!restaurantId || !driverId) return;

    try {
      setAssigningOrderId(orderId);
      const response = await fetch(`${API_BASE}/api/restaurants/${restaurantId}/orders/${orderId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to assign driver');
      }

      const driver = drivers.find((item) => item.id === driverId);
      localStorage.setItem('mealgo_last_requested_driver_id', driverId);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, driver: driver?.name || order.driver } : order))
      );
      setSelectedOrder((current) =>
        current && current.id === orderId ? { ...current, driver: driver?.name || current.driver } : current
      );
      setError(null);
      setSuccessMessage(`Request sent to ${driver?.name || 'driver'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setAssigningOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="restaurant" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Restaurant Orders</h1>
          <p className="text-gray-600">{stats.total} orders found</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Total</div>
            <div className="text-2xl">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Pending</div>
            <div className="text-2xl text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Preparing</div>
            <div className="text-2xl text-blue-600">{stats.preparing}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Delivering</div>
            <div className="text-2xl text-orange-600">{stats.delivering}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Delivered</div>
            <div className="text-2xl text-green-600">{stats.delivered}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Cancelled</div>
            <div className="text-2xl text-red-600">{stats.cancelled}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID or customer..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#e95322]"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {['active', 'history', 'all', 'pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusFilter)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-[#e95322] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">{error}</div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6">{successMessage}</div>
        )}

        {isLoading && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 mb-6">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Customer</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Items</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Driver Request</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Time</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${index === orders.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="text-[#e95322]">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fef2ef] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#e95322]" />
                        </div>
                        <div>
                          <div>{order.customer}</div>
                          <div className="text-xs text-gray-500">{order.customerPhone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{order.items} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-[240px] space-y-2">
                        <div className="text-sm text-gray-500">
                          Current: <span className="text-gray-800">{order.driver || 'Unassigned'}</span>
                        </div>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && drivers.length > 0 ? (
                          <>
                            <select
                              value={driverSelections[order.id] || ''}
                              onChange={(e) =>
                                setDriverSelections((current) => ({
                                  ...current,
                                  [order.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#e95322]"
                            >
                              {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.name} - {driver.availability}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => assignDriver(order.id, driverSelections[order.id] || drivers[0]?.id)}
                              disabled={assigningOrderId === order.id}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                            >
                              {assigningOrderId === order.id ? 'Sending...' : 'Send Request To Driver'}
                            </button>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400">Driver request unavailable</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(order.orderTime)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPrimaryAction(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, getPrimaryAction(order.status)!.nextStatus)}
                            disabled={savingOrderId === order.id}
                            className="px-4 py-2 bg-[#e95322] text-white rounded-lg hover:bg-[#d14719] transition-colors text-sm disabled:opacity-50"
                          >
                            {savingOrderId === order.id ? 'Updating...' : getPrimaryAction(order.status)!.label}
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={savingOrderId === order.id}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && orders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  X
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Order Number</div>
                  <div className="text-xl text-[#e95322]">{selectedOrder.orderNumber}</div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <div className="text-sm text-gray-600">Customer</div>
                  </div>
                  <div className="text-sm">{selectedOrder.customer}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {selectedOrder.customerPhone || 'No phone'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                  <div className="text-sm">Ordered: {formatDateTime(selectedOrder.orderTime)}</div>
                  <div className="text-xs text-gray-500">
                    ETA: {selectedOrder.estimatedDelivery ? formatDateTime(selectedOrder.estimatedDelivery) : '-'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <div className="text-sm text-gray-600">Delivery Address</div>
                  </div>
                  <div className="text-sm">{selectedOrder.deliveryAddress}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-gray-600" />
                    <div className="text-sm text-gray-600">Driver</div>
                  </div>
                  <div className="text-sm">{selectedOrder.driver || 'Not assigned'}</div>
                  <div className="text-xs text-gray-500">Payment: {selectedOrder.paymentMethod}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-3">Assign Driver</div>
                {drivers.length === 0 ? (
                  <div className="text-sm text-gray-500">No registered drivers yet.</div>
                ) : (
                  <div className="flex gap-3">
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:border-[#e95322]"
                    >
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.availability}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignDriver(selectedOrder.id, selectedDriverId)}
                      disabled={assigningOrderId === selectedOrder.id}
                      className="px-5 py-3 bg-[#e95322] text-white rounded-xl hover:bg-[#d14719] transition-colors disabled:opacity-50"
                    >
                      {assigningOrderId === selectedOrder.id ? 'Sending...' : 'Assign Driver'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              {getPrimaryAction(selectedOrder.status) && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, getPrimaryAction(selectedOrder.status)!.nextStatus)}
                  disabled={savingOrderId === selectedOrder.id}
                  className="flex-1 py-3 bg-[#e95322] text-white rounded-xl hover:bg-[#d14719] transition-colors disabled:opacity-50"
                >
                  {savingOrderId === selectedOrder.id ? 'Updating...' : getPrimaryAction(selectedOrder.status)!.label}
                </button>
              )}
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  disabled={savingOrderId === selectedOrder.id}
                  className="px-5 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
