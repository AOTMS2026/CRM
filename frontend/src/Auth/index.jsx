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
  EyeOff,
  ChevronDown
} from 'lucide-react';

export default function AuthPage({ defaultMode = 'signin' }) {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || defaultMode;
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordValue = watch('password');

  const onSubmit = async (formData) => {
    setLoading(true);
    setServerMessage(null);

    // Dynamic endpoint (Local Node.js Express vs Cloud)
    const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
      ? 'http://localhost:5000'
      : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

    try {
      if (isSignUp) {
        // Validation: Confirm password
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match. Please re-enter.");
        }

        // Real Sign Up directly saving into backend + issuing 7-day JWT
        const response = await fetch(`${API_BASE}/api/auth/sign-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            phone: formData.phone,
            role: formData.role || 'employee'
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || result.detail || 'Registration failed');
        }

        // Store 7-day JWT Token and user profile
        if (result.token) {
          localStorage.setItem('crm_token', result.token);
          localStorage.setItem('crm_user', JSON.stringify(result.user));
          window.dispatchEvent(new Event('auth-change'));
        }

        const userRole = result.user?.role?.toLowerCase() || 'employee';
        setServerMessage({
          type: 'success',
          text: `Account created successfully! Redirecting to ${userRole.toUpperCase()} Panel...`
        });
        setTimeout(() => navigate(`/dashboard?panel=${userRole}`), 1200);
      } else {
        // Real Sign In directly verifying from backend + issuing 7-day JWT
        const response = await fetch(`${API_BASE}/api/auth/sign-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || result.detail || 'Invalid email or password');
        }

        if (result.token) {
          localStorage.setItem('crm_token', result.token);
          localStorage.setItem('crm_user', JSON.stringify(result.user));
          window.dispatchEvent(new Event('auth-change'));
        }

        const userRole = result.user?.role?.toLowerCase() || 'employee';
        setServerMessage({
          type: 'success',
          text: `Signed in successfully! Welcome to ${userRole.toUpperCase()} Panel, ${result.user?.name || ''}!`
        });
        setTimeout(() => navigate(`/dashboard?panel=${userRole}`), 1200);
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-tech_blue/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-tech_orange/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Back to Home Navigation Button */}
      <div className={`w-full mb-6 flex items-center justify-between transition-all duration-300 ${isSignUp ? 'max-w-2xl' : 'max-w-md'}`}>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-tech_orange transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Landing Page</span>
        </Link>

      
      </div>

      {/* Main Authentication Card */}
      <div className={`w-full bg-slate_dark-300/90 border border-tech_blue/35 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative transition-all duration-300 ${isSignUp ? 'max-w-2xl' : 'max-w-md'}`}>
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-block mb-1">
            <img 
              src="/logo.png" 
              alt="Academy of Tech Masters" 
              className="h-10 sm:h-12 mx-auto w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isSignUp ? 'Create Company Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-300">
            {isSignUp 
              ? 'Start your enterprise trial on the WhatsApp Automation CRM.' 
              : 'Sign in to access your company dashboard and live chat inbox.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate_dark-400/90 border border-white/10 mb-6 text-sm font-bold max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setServerMessage(null); }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all cursor-pointer ${
              !isSignUp 
                ? 'bg-tech_orange text-white shadow-md shadow-tech_orange/30 font-extrabold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsSignUp(true); setServerMessage(null); }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all cursor-pointer ${
              isSignUp 
                ? 'bg-tech_blue text-white shadow-md shadow-tech_blue/30 font-extrabold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </button>
        </div>

        {/* Status Notification Message */}
        {serverMessage && (
          <div className={`mb-5 p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2 animate-in fade-in ${
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
          
          {/* SIGN UP: 2-COLUMN LAYOUT */}
          {isSignUp ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* COLUMN 1: Profile & Company Details */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name (String) <span className="text-tech_orange">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={50}
                      placeholder="e.g. Vikram Sharma"
                      {...register('fullName', { 
                        required: 'Full Name is required',
                        minLength: { value: 3, message: 'Must be at least 3 characters' },
                        maxLength: { value: 50, message: 'Maximum 50 characters allowed' },
                        pattern: {
                          value: /^[a-zA-Z\s]{3,50}$/,
                          message: 'Only letters and spaces allowed (no numbers)'
                        }
                      })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_blue focus:ring-1 focus:ring-tech_blue transition-all"
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    System Role <span className="text-tech_orange">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      {...register('role')}
                      defaultValue="admin"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate_dark-400/90 border border-white/10 text-xs text-white focus:outline-none focus:border-tech_blue focus:ring-1 focus:ring-tech_blue transition-all appearance-none cursor-pointer font-bold"
                    >
                      <option value="admin" className="bg-slate_dark-300 text-white font-semibold">
                        🛡️ Admin (Full Control Panel)
                      </option>
                      <option value="manager" className="bg-slate_dark-300 text-white font-semibold">
                        💼 Manager (Leads & Blasts Panel)
                      </option>
                      <option value="employee" className="bg-slate_dark-300 text-white font-semibold">
                        👤 Employee (Chat & Tasks Panel)
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp Number (+91 10-Digit) <span className="text-tech_orange">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      maxLength={14}
                      placeholder="+91 98765 43210"
                      {...register('phone', { 
                        required: 'WhatsApp phone number is required',
                        maxLength: { value: 14, message: 'Maximum 10-digit phone (+91)' },
                        pattern: {
                          value: /^(?:\+91[\s-]?)?[6789]\d{9}$/,
                          message: 'Must be a valid 10-digit Indian number (+91 9876543210)'
                        }
                      })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_blue focus:ring-1 focus:ring-tech_blue transition-all"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              {/* COLUMN 2: Account Credentials */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Work Email <span className="text-tech_orange">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      maxLength={80}
                      placeholder="you@company.com"
                      {...register('email', { 
                        required: 'Work email is required',
                        maxLength: { value: 80, message: 'Email cannot exceed 80 characters' },
                        pattern: { 
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, 
                          message: 'Enter a valid corporate email (e.g. name@company.com)' 
                        }
                      })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password (8+ chars, A-Z, 0-9, symbol) <span className="text-tech_orange">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      maxLength={64}
                      placeholder="••••••••••••"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        maxLength: { value: 64, message: 'Password cannot exceed 64 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_\-+=])[A-Za-z\d@$!%*?&#^~_\-+=]{8,}$/,
                          message: 'Include uppercase, lowercase, number, and special character'
                        }
                      })}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm Password <span className="text-tech_orange">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      maxLength={64}
                      placeholder="••••••••••••"
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: (val) => val === passwordValue || 'Passwords do not match'
                      })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

            </div>
          ) : (
            /* SIGN IN: SINGLE COLUMN LAYOUT */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Work Email <span className="text-tech_orange">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    maxLength={80}
                    placeholder="you@company.com"
                    {...register('email', { 
                      required: 'Email address is required',
                      maxLength: { value: 80, message: 'Email cannot exceed 80 characters' },
                      pattern: { 
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, 
                        message: 'Enter a valid email address' 
                      }
                    })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password <span className="text-tech_orange">*</span>
                  </label>
                  <a href="#forgot" className="text-[11px] text-tech_orange hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={64}
                    placeholder="••••••••••••"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      maxLength: { value: 64, message: 'Password cannot exceed 64 characters' }
                    })}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate_dark-400/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tech_orange focus:ring-1 focus:ring-tech_orange transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-tech_orange to-tech_orange-600 hover:from-tech_orange-600 hover:to-tech_orange shadow-lg shadow-tech_orange/30 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 mt-5"
          >
            {loading ? (
              <span className="animate-pulse font-mono">Authenticating...</span>
            ) : isSignUp ? (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                <span>Create Company Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" />
                <span>Sign In to CRM</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Toggle Note */}
        <div className="mt-6 text-center text-sm text-slate-300 pt-4 border-t border-white/10">
          {isSignUp ? (
            <p>
              Already have an enterprise account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsSignUp(false); setServerMessage(null); }}
                className="text-tech_orange font-bold hover:underline cursor-pointer"
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
                className="text-tech_blue-700 font-bold hover:underline cursor-pointer"
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
