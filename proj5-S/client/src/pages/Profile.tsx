import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { User, MapPin, Mail, Lock, Save, Package, Clock, Wallet, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';
import { useWalletCoupons } from '../hooks/useWallet';
import { getPasswordIssues, isPasswordStrong, passwordRequirements } from '../utils/passwordRules';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { walletAddress, coupons, connectWallet, loadUserCoupons, setWalletAddress, setCoupons, disconnectWallet } = useWalletCoupons();
  const [walletInput, setWalletInput] = useState('');
  const storedUser = localStorage.getItem('currentUser');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userRole: 'customer' | 'driver' | 'restaurant' | null = parsedUser?.role || null;

  // clear wallet state if role changes away from customer
  useEffect(() => {
    if (userRole !== 'customer') {
      setWalletAddress('');
      setWalletInput('');
      setCoupons([]);
    }
  }, [userRole, setWalletAddress, setCoupons]);

  // whenever walletAddress updates (e.g. after connect), populate input
  useEffect(() => {
    if (walletAddress && walletInput === '') {
      setWalletInput(walletAddress);
    }
  }, [walletAddress]);
  const [profile, setProfile] = useState({
    name: parsedUser?.name || 'John Doe',
    email: parsedUser?.email || 'john.doe@example.com',
    phone: parsedUser?.phone || '+1 234 567 8900',
    address: parsedUser?.address || 'Jl. Soekarno Hatta 15A M',
    city: parsedUser?.city || 'New York, NY 10001',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const passwordIssues = getPasswordIssues(profile.newPassword);
  const passwordIsStrong = isPasswordStrong(profile.newPassword);
  const passwordsMatch = profile.confirmPassword.length > 0 && profile.newPassword === profile.confirmPassword;

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const resetPasswordForm = (clearFeedback = true) => {
    setProfile((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    setIsCurrentPasswordVerified(false);
    if (clearFeedback) {
      setPasswordError('');
      setPasswordSuccess('');
    }
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleVerifyCurrentPassword = async () => {
    if (!parsedUser?.id) {
      setPasswordError('User session not found. Please sign in again.');
      return;
    }

    if (!profile.currentPassword) {
      setPasswordError('Enter your current password first');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('');
    setIsVerifyingPassword(true);

    try {
      const response = await fetch('/api/auth/verify-current-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parsedUser.id,
          currentPassword: profile.currentPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPasswordError(data.message || 'Current password is incorrect');
        return;
      }

      setIsCurrentPasswordVerified(true);
      setPasswordSuccess('Current password verified. You can enter a new password now.');
    } catch {
      setPasswordError('Failed to verify current password. Please try again.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!parsedUser?.id) {
      setPasswordError('User session not found. Please sign in again.');
      return;
    }

    if (!isCurrentPasswordVerified) {
      setPasswordError('Verify your current password first');
      return;
    }

    if (!passwordIsStrong) {
      setPasswordError(`Password must include: ${passwordIssues.join(', ')}`);
      return;
    }

    if (profile.newPassword !== profile.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('');
    setIsUpdatingPassword(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parsedUser.id,
          currentPassword: profile.currentPassword,
          newPassword: profile.newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPasswordError(data.message || 'Failed to update password');
        return;
      }

      resetPasswordForm(false);
      setPasswordSuccess('Password updated successfully.');
    } catch {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const orderStats = {
    total: 24,
    thisMonth: 8,
    totalSpent: 1247.50
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="customer" isLoggedIn={true} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">My Profile</h1>
          <p className="text-xl text-gray-600">Manage your account settings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#e95322] to-[#ff6b35] rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4">
                  {profile.name.charAt(0)}
                </div>
                <h2 className="text-2xl mb-1">{profile.name}</h2>
                <p className="text-gray-600 mb-4">{profile.email}</p>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full bg-[#fef2ef] text-[#e95322] py-3 rounded-xl hover:bg-[#ffdecf] transition-colors"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#e95322]" />
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="text-xl">{orderStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="text-xl">{orderStats.thisMonth}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="text-xl text-[#e95322]">${orderStats.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Wallet and Coupons */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#e95322]" />
                Wallet & Coupons
              </h3>
              {/* only show for customer role */}
              {userRole === 'customer' ? (
                <>
                  <input
                    type="text"
                    placeholder="Enter your wallet address"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                  />
                  {!walletAddress ? (
                    <button
                      onClick={async () => {
                        const addr = await connectWallet();
                        if (walletInput && addr && addr.toLowerCase() !== walletInput.toLowerCase()) {
                          alert('MetaMask address does not match entered address');
                        }
                      }}
                      className="w-full bg-[#e95322] text-white py-3 rounded-xl hover:bg-[#d84315] transition-colors"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-4">Connected: {walletAddress}</p>
                      <h4 className="text-md mb-2">Your NFT Coupons:</h4>
                      {coupons.length === 0 ? (
                        <p className="text-gray-500">No coupons found.</p>
                      ) : (
                        <div className="space-y-2">
                          {coupons.map((coupon) => (
                            <div key={coupon.id} className="bg-gray-50 p-3 rounded-lg">
                              <p><strong>ID:</strong> {coupon.nft_token_id || 'n/a'}</p>
                              <p><strong>Code:</strong> {coupon.code}</p>
                              <p><strong>Discount:</strong> {coupon.discount_value}%</p>
                              <p><strong>Type:</strong> {coupon.discount_type}</p>
                              <p><strong>Valid Until:</strong> {new Date(coupon.valid_until).toLocaleDateString()}</p>
                              {coupon.onChainOwner && (
                                <p className="text-xs text-gray-500">
                                  Owner: {coupon.onChainOwner === 'error' ? 'error' : coupon.onChainOwner}
                                </p>
                              )}
                              {coupon.ownerMatch === false && (
                                <p className="text-xs text-red-500">
                                  ⚠️ Token not owned by connected wallet
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => disconnectWallet()}
                        className="mt-4 w-full px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Wallet area is available only for customers.</p>
              )}
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl mb-6">Personal Information</h3>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#e95322]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322] disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#e95322]" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322] disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322] disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#e95322]" />
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322] disabled:bg-gray-50 disabled:text-gray-500 mb-3"
                  />
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322] disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="w-full bg-[#e95322] text-white py-4 rounded-xl hover:bg-[#d14719] transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
              <h3 className="text-2xl mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-[#e95322]" />
                Change Password
              </h3>

              <form autoComplete="off" className="space-y-4">
                <input
                  type="text"
                  name="fake-profile-username"
                  autoComplete="username"
                  tabIndex={-1}
                  className="hidden"
                  aria-hidden="true"
                />
                <input
                  type="password"
                  name="fake-profile-current-password"
                  autoComplete="current-password"
                  tabIndex={-1}
                  className="hidden"
                  aria-hidden="true"
                />
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="profile-current-password-field"
                      value={profile.currentPassword}
                      onChange={(e) => {
                        setProfile({ ...profile, currentPassword: e.target.value });
                        setIsCurrentPasswordVerified(false);
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="w-full px-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                      placeholder="Enter current password"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {passwordSuccess}
                  </div>
                )}

                {!isCurrentPasswordVerified ? (
                  <button
                    type="button"
                    onClick={handleVerifyCurrentPassword}
                    disabled={isVerifyingPassword || !profile.currentPassword}
                    className="w-full bg-[#e95322] text-white py-3 rounded-xl hover:bg-[#d14719] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isVerifyingPassword ? 'Verifying...' : 'Verify Current Password'}
                  </button>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="profile-new-password-field"
                          value={profile.newPassword}
                          onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                          className="w-full px-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          data-lpignore="true"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Your password must include:</p>
                      <div className="space-y-2">
                        {passwordRequirements.map((requirement) => {
                          const met = requirement.test(profile.newPassword);
                          const Icon = met ? CheckCircle2 : Circle;
                          return (
                            <div key={requirement.key} className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
                              <Icon className="w-4 h-4" />
                              <span>{requirement.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="profile-confirm-password-field"
                          value={profile.confirmPassword}
                          onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                          className="w-full px-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e95322]"
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          data-lpignore="true"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {profile.confirmPassword && (
                        <p className={`mt-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match yet'}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={resetPasswordForm}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword || !passwordIsStrong || (profile.confirmPassword.length > 0 && !passwordsMatch)}
                        className="flex-1 bg-[#e95322] text-white py-3 rounded-xl hover:bg-[#d14719] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
