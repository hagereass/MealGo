import { useState } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Save, Bell, DollarSign, Truck, Globe, Shield, Mail } from 'lucide-react';
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
export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'MealGo',
    platformEmail: 'support@mealgo.com',
    platformPhone: '+1 234 567 8900',
    currency: 'USD',
    timezone: 'America/New_York',
    
    // Commission Settings
    restaurantCommission: 15,
    deliveryCommission: 10,
    
    // Delivery Settings
    baseDeliveryFee: 2.99,
    deliveryFeePerKm: 0.50,
    maxDeliveryRadius: 10,
    
    // Order Settings
    minOrderAmount: 10,
    serviceFee: 0.99,
    taxRate: 8,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-1">Settings</h1>
              <p className="text-gray-600">Configure platform settings</p>
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#e95322] text-white rounded-xl hover:bg-[#d14719] transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 max-w-5xl">
          {/* General Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl">General Settings</h2>
                <p className="text-sm text-gray-600">Basic platform configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.platformEmail}
                  onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Support Phone</label>
                <input
                  type="tel"
                  value={settings.platformPhone}
                  onChange={(e) => setSettings({ ...settings, platformPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>IDR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl">Commission & Fees</h2>
                <p className="text-sm text-gray-600">Platform revenue configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Restaurant Commission (%)</label>
                <input
                  type="number"
                  value={settings.restaurantCommission}
                  onChange={(e) => setSettings({ ...settings, restaurantCommission: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Driver Commission (%)</label>
                <input
                  type="number"
                  value={settings.deliveryCommission}
                  onChange={(e) => setSettings({ ...settings, deliveryCommission: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Service Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.serviceFee}
                  onChange={(e) => setSettings({ ...settings, serviceFee: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl">Delivery Settings</h2>
                <p className="text-sm text-gray-600">Configure delivery parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Base Delivery Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.baseDeliveryFee}
                  onChange={(e) => setSettings({ ...settings, baseDeliveryFee: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Fee Per Km ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.deliveryFeePerKm}
                  onChange={(e) => setSettings({ ...settings, deliveryFeePerKm: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Max Delivery Radius (km)</label>
                <input
                  type="number"
                  value={settings.maxDeliveryRadius}
                  onChange={(e) => setSettings({ ...settings, maxDeliveryRadius: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Min Order Amount ($)</label>
                <input
                  type="number"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minOrderAmount: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl">Notifications</h2>
                <p className="text-sm text-gray-600">Manage notification preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm">Email Notifications</div>
                    <div className="text-xs text-gray-500">Send email alerts to users</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-[#e95322] focus:ring-[#e95322]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm">Push Notifications</div>
                    <div className="text-xs text-gray-500">Send push notifications to mobile apps</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-[#e95322] focus:ring-[#e95322]"
                />
              </label>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl">Security</h2>
                <p className="text-sm text-gray-600">Platform security settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                <div>
                  <div className="text-sm">Two-Factor Authentication</div>
                  <div className="text-xs text-gray-500">Require 2FA for admin access</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                  className="rounded border-gray-300 text-[#e95322] focus:ring-[#e95322]"
                />
              </label>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


