import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Building2, 
  Phone, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function AuthPage({ defaultMode = 'signin' }) {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || defaultMode;
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    setLoading(true);
    setServerMessage(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://crm-fee1.onrender.com";

    try {
      if (isSignUp) {
        // Real Sign Up directly inserting into Neon PostgreSQL
        const response = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            phone: formData.phone
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || 'Registration failed');
        }

        // Store session token and user profile
        if (result.token) {
          localStorage.setItem('better_auth_token', result.token);
          localStorage.setItem('crm_user', JSON.stringify(result.user));
        }

        setServerMessage({
          type: 'success',
          text: `Account created in Neon Database! Welcome, ${result.user?.name || 'Admin'}!`
        });
        setTimeout(() => navigate('/'), 2000);
      } else {
        // Real Sign In directly validating from Neon PostgreSQL
        const response = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || 'Invalid email or password');
        }

        if (result.token) {
          localStorage.setItem('better_auth_token', result.token);
          localStorage.setItem('crm_user', JSON.stringify(result.user));
        }

        setServerMessage({
          type: 'success',
          text: `Authenticated with Neon Database! Welcome back, ${result.user?.name || ''}!`
        });
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setServerMessage({
        type: 'error',
        text: err.message || 'Authentication error. Please check your credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate_dark text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-radial-theme-glow">
      {/* Background Dot Matrix Pattern */}
      <div className="absolute inset-0 nova-grid-bg opacity-40 pointer-events-none -z-10" />

      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tech_blue/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-tech_orange/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Back to Home Navigation Button */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-tech_orange transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Landing Page</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate_dark-300/80 border border-white/10 text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Better Auth 256-bit</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate_dark-300/90 border border-tech_blue/35 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-block mb-1">
            <img 
              src="/logo.png" 
              alt="Academy of Tech Masters" 
              className="h-9 sm:h-10 mx-auto w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? 'Create Company Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp 
              ? 'Start your 14-day free trial on the Enterprise WhatsApp CRM.' 
              : 'Sign in to access your company dashboard and live chat inbox.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate_dark-400/90 border border-white/10 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setServerMessage(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
              !isSignUp 
                ? 'bg-tech_orange text-white shadow-md shadow-tech_orange/30 font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsSignUp(true); setServerMessage(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
              isSignUp 
                ? 'bg-tech_blue text-white shadow-md shadow-tech_blue/30 font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Status Notification Message */}
        {serverMessage && (
          <div className={`mb-5 p-3 rounded-xl border text-xs font-mono flex items-start gap-2 animate-in fade-in ${
            serverMessage.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            {serverMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{serverMessage.text}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Sign Up Fields: Full Name & Company */}
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-tech_orange">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    {...register('fullName', { required: isSignUp ? 'Full name is required' : false })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_blue focus:ring-1 focus:ring-tech_blue transition-all"
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Company Name <span className="text-tech_orange">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Apex Global Technologies"
                    {...register('companyName', { required: isSignUp ? 'Company name is required' : false })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_blue focus:ring-1 focus:ring-tech_blue transition-all"
                  />
                </div>
                {errors.companyName && <p className="text-[11px] text-rose-400 mt-1">{errors.companyName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  WhatsApp Business Phone <span className="text-tech_orange">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register('phone', { required: isSignUp ? 'Phone number is required for WhatsApp sync' : false })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_blue focus:ring-1 focus:ring-tech_blue transition-all"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone.message}</p>}
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Work Email <span className="text-tech_orange">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@company.com"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' }
                })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password <span className="text-tech_orange">*</span>
              </label>
              {!isSignUp && (
                <a href="#forgot" className="text-[11px] text-tech_orange hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Must be at least 6 characters' }
                })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-tech_orange to-tech_orange-600 hover:from-tech_orange-600 hover:to-tech_orange shadow-lg shadow-tech_orange/30 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 mt-2"
          >
            {loading ? (
              <span className="animate-pulse font-mono">Connecting to Better Auth...</span>
            ) : isSignUp ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Company Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to CRM</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Toggle Note */}
        <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-white/10">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsSignUp(false); setServerMessage(null); }}
                className="text-tech_orange font-semibold hover:underline cursor-pointer"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p>
              Don't have an enterprise account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsSignUp(true); setServerMessage(null); }}
                className="text-tech_blue-700 font-semibold hover:underline cursor-pointer"
              >
                Register for Free Trial
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
