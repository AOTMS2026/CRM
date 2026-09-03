import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  IoFlash, 
  IoCheckmarkCircle, 
  IoArrowForward, 
  IoSparkles, 
  IoMailOutline 
} from 'react-icons/io5';

export default function CTASection() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data) => {
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="signup" className="py-20 relative overflow-hidden bg-slate-950 text-white border-t border-emerald-500/20">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/90 p-8 sm:p-14 border border-amber-500/40 shadow-2xl relative overflow-hidden text-center">
          
          {/* Luminous Glow Streaks */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-extrabold text-emerald-300 tracking-wider uppercase mb-6 shadow-md">
            <IoSparkles className="text-sm text-amber-400" /> INSTANT DEPLOYMENT IN 60 SECONDS
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto mb-6 leading-tight">
            Ready To Turn WhatsApp Into Your <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Highest Converting</span> Channel?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Join fast-growing companies using AOTMS CRM to automate 24/7 customer support, log daily calling updates, and send Meta-compliant broadcasts.
          </p>

          {/* Email Signup Form */}
          <form 
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 items-stretch justify-center mb-6"
          >
            <div className="relative flex-1">
              <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="email"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="Enter your corporate work email..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 text-white placeholder:text-slate-400 text-sm border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors font-sans shadow-md"
              />
              {errors.email && (
                <p className="text-xs text-rose-400 text-left mt-1 ml-1 font-bold">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 shadow-xl shadow-emerald-500/25 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <IoFlash className="text-base" />
              <span>Get Free Access</span>
              <IoArrowForward className="text-xs" />
            </button>
          </form>

          {submitted && (
            <div className="p-3.5 mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono animate-in fade-in">
              🎉 Welcome aboard! Check your inbox for your 14-day free trial workspace invite.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-emerald-400 text-base" /> 14-Day Free Trial
            </span>
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-emerald-400 text-base" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-emerald-400 text-base" /> Meta Verified Cloud API
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
