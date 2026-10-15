import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../utils/api.js';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegister && !formData.username.trim()) {
      setError('Please enter your name or username.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(
          formData.username.trim(),
          formData.email.trim(),
          formData.password
        );

        setSuccessMsg('Account created successfully! Signing you in...');

        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 800);
      } else {
        const res = await api.login(
          formData.email.trim(),
          formData.password
        );

        setSuccessMsg('Logged in successfully!');

        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(
        err.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'block w-full rounded-xl border border-violet-100 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400 caret-violet-700 opacity-100 transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-900/50 p-4 backdrop-blur-sm">
      <div className="relative my-auto w-full max-w-md overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl shadow-violet-950/10 sm:p-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-violet-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-100/70 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-stone-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-700">
            <Lock className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-bold text-stone-800">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            {isRegister
              ? 'Register to save and organize your air drawings'
              : 'Sign in to access your saved hand drawings and cloud history'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="relative mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="relative mb-4 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-violet-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-4">
          {isRegister && (
            <div>
              <label
                htmlFor="auth-username"
                className="mb-1.5 block text-xs font-medium text-stone-700"
              >
                Username / Display Name
              </label>

              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  id="auth-username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  placeholder="Your name"
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClass}
                  style={{
                    color: '#292524',
                    WebkitTextFillColor: '#292524',
                    backgroundColor: '#ffffff',
                    opacity: 1,
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-xs font-medium text-stone-700"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

              <input
                id="auth-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                style={{
                  color: '#292524',
                  WebkitTextFillColor: '#292524',
                  backgroundColor: '#ffffff',
                  opacity: 1,
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-xs font-medium text-stone-700"
            >
              Password (min 6 characters)
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={6}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass} pr-12`}
                style={{
                  color: '#292524',
                  WebkitTextFillColor: '#292524',
                  backgroundColor: '#ffffff',
                  opacity: 1,
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-500 transition hover:bg-violet-50 hover:text-violet-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Processing...</span>
              </span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative mt-5 border-t border-violet-100 pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="cursor-pointer text-xs text-stone-600 transition-colors hover:text-violet-700"
          >
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <strong className="font-semibold text-violet-700 underline">
                  Sign in
                </strong>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <strong className="font-semibold text-violet-700 underline">
                  Create one
                </strong>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}