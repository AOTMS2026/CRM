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
    console.log('Lead submitted:', data);
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="signup" className="py-20 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-theme-glow opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="rounded-3xl nova-card p-8 sm:p-14 border border-burnt_peach/40 shadow-2xl relative overflow-hidden text-center">
          
          {/* Ambient light streak */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-burnt_peach/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-muted_teal/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full nova-pill text-xs font-mono font-bold text-tan tracking-wider uppercase mb-6">
            <IoSparkles className="text-xs text-burnt_peach" /> Instant Deployment In 60 Seconds
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-tan-900 tracking-tight max-w-3xl mx-auto mb-6">
            Ready To Turn WhatsApp Into Your <span className="gradient-text-peach">Highest Converting</span> Channel?
          </h2>

          <p className="text-base sm:text-lg text-tan-800 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Join forward-thinking businesses using AutoMachine to automate 24/7 customer support, recover abandoned carts, and send zero-ban broadcasts.
          </p>

          {/* Form */}
          <form 
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 items-stretch justify-center mb-6"
          >
            <div className="relative flex-1">
              <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-tan-800 text-lg" />
              <input
                type="email"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="Enter your work email..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-prussian_blue-200 text-tan-900 placeholder:text-tan-800/60 text-sm border border-deep_space_blue focus:outline-none focus:border-burnt_peach transition-colors font-sans"
              />
              {errors.email && (
                <p className="text-xs text-rose-400 text-left mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="nova-btn-shimmer px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-prussian_blue-100 bg-gradient-to-r from-burnt_peach to-burnt_peach-400 hover:from-burnt_peach-400 hover:to-burnt_peach shadow-lg shadow-burnt_peach/30 border-t border-white/30 transition-all flex items-center justify-center gap-2"
            >
              <IoFlash className="text-base" />
              <span>Get Free Access</span>
              <IoArrowForward className="text-xs" />
            </button>
          </form>

          {submitted && (
            <div className="p-3 mb-4 rounded-xl bg-muted_teal/20 border border-muted_teal/40 text-muted_teal text-xs font-bold font-mono animate-in fade-in">
              🎉 Welcome aboard! Check your inbox for your 14-day free trial invite.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-tan-800 font-mono">
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-muted_teal text-sm" /> 14-Day Free Trial
            </span>
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-muted_teal text-sm" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircle className="text-muted_teal text-sm" /> 2-Minute Setup
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
