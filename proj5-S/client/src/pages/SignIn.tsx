import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { setCurrentUserSession } from '../utils/session';

type SignInRole = 'customer' | 'admin' | 'restaurant' | 'driver';

// 🔥 حطي هنا رابط الباك اند بتاعك
const BASE_URL = 'mealgo-production.up.railway.app';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState<SignInRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showTwoFA, setShowTwoFA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

  const [pendingCredentials, setPendingCredentials] = useState<any>(null);

  // ========================
  // Role from navigation
  // ========================
  useEffect(() => {
    const state = location.state as { selectedRole?: SignInRole };
    if (state?.selectedRole) setSelectedRole(state.selectedRole);
  }, [location.state]);

  // ========================
  // SIGN IN
  // ========================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedRole) {
      setError('Please select a role first');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // 2FA
      if (data.twoFactorRequired) {
        setPendingCredentials(data);
        setShowTwoFA(true);
        return;
      }

      // success login
      setCurrentUserSession(data);

      redirectByRole(data.role);

    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 2FA
  // ========================
  const handleTwoFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingCredentials?.id,
          code: twoFACode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid code');
        return;
      }

      setCurrentUserSession(data);
      redirectByRole(data.role);

    } catch {
      setError('Verification failed');
    }
  };

  // ========================
  // Redirect helper
  // ========================
  const redirectByRole = (role: SignInRole) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'restaurant':
        navigate('/restaurant/dashboard');
        break;
      case 'driver':
        navigate('/driver/dashboard');
        break;
      default:
        navigate('/order');
    }
  };

  // ========================
  // Google Login
  // ========================
  const handleGoogleSignIn = () => {
    if (!selectedRole) return setError('Select role first');

    window.location.href =
      `${BASE_URL}/auth/google/start?mode=signin&role=${selectedRole}`;
  };

  // ========================
  // UI
  // ========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="w-full max-w-md p-6">

        {/* back */}
        <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-2">
          <ArrowLeft /> Back
        </button>

        <h1 className="text-3xl mb-2">Login</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
            {error}
          </div>
        )}

        {/* ROLE */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['customer','restaurant','driver','admin'] as SignInRole[]).map(r => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`p-2 border rounded ${
                selectedRole === r ? 'bg-orange-500 text-white' : ''
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 2FA */}
        {showTwoFA ? (
          <form onSubmit={handleTwoFA} className="space-y-3">
            <input
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              placeholder="6-digit code"
              className="w-full p-2 border"
            />

            <button className="w-full bg-green-500 text-white p-2">
              Verify
            </button>
          </form>
        ) : (

          /* LOGIN */
          <form onSubmit={handleSignIn} className="space-y-3">

            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border"
            />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm"
            >
              toggle password
            </button>

            <button
              disabled={loading}
              className="w-full bg-orange-500 text-white p-2"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full border p-2 mt-2"
            >
              Google Sign In
            </button>

          </form>
        )}

      </div>
    </div>
  );
}