import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Plus, 
  Minus, 
  KeyRound, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export interface AuthSwitchProps {
  className?: string;
  initialCount?: number;
}

export const Component: React.FC<AuthSwitchProps> = ({ className, initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-5 p-6 rounded-2xl bg-slate_dark-300/80 border border-tech_blue/30 shadow-2xl backdrop-blur-xl max-w-md w-full mx-auto text-white",
        className
      )}
    >
      {/* Header with Lucide Icons and Brand Palette */}
      <div className="flex items-center justify-between w-full pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-tech_orange/20 border border-tech_orange/40 flex items-center justify-center text-tech_orange">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Better Auth Gateway</h3>
            <p className="text-[11px] text-slate-400 font-mono">crm-1-peach.vercel.app/api/auth</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tech_blue/20 border border-tech_blue/40 text-[11px] font-mono text-tech_blue-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active</span>
        </div>
      </div>

      {/* Auth Mode Switcher Tab */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate_dark-400/80 border border-white/10 w-full text-xs font-semibold">
        <button
          type="button"
          onClick={() => setAuthMode("signin")}
          className={cn(
            "flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-150 cursor-pointer",
            authMode === "signin"
              ? "bg-tech_orange text-white shadow-md shadow-tech_orange/30 font-bold"
              : "text-slate-300 hover:text-white"
          )}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => setAuthMode("signup")}
          className={cn(
            "flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-150 cursor-pointer",
            authMode === "signup"
              ? "bg-tech_blue text-white shadow-md shadow-tech_blue/30 font-bold"
              : "text-slate-300 hover:text-white"
          )}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </button>
      </div>

      {/* Interactive Value Display */}
      <div className="flex flex-col items-center gap-1 py-3 text-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-tech_orange" />
          <span>Session Quota / Multi-Device Agents</span>
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight font-mono">
          {count}
        </h2>
        <p className="text-[11px] text-slate-400">
          {count === 0 ? "Default agent connection limit" : `${count} active seats allocated`}
        </p>
      </div>

      {/* Counter Controls with Lucide Icons */}
      <div className="flex items-center justify-center gap-3 w-full">
        <button 
          type="button"
          onClick={() => setCount((prev) => Math.max(0, prev - 1))}
          className="w-12 h-12 rounded-xl bg-slate_dark-400 hover:bg-slate_dark-500 border border-white/15 hover:border-tech_orange/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          aria-label="Decrease seat quota"
        >
          <Minus className="w-4 h-4 text-tech_orange" />
        </button>

        <a
          href="https://crm-1-peach.vercel.app/api/auth"
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-center text-white bg-gradient-to-r from-tech_orange to-tech_orange-600 hover:from-tech_orange-600 hover:to-tech_orange shadow-lg shadow-tech_orange/25 border border-white/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Connect via Better Auth</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>

        <button 
          type="button"
          onClick={() => setCount((prev) => prev + 1)}
          className="w-12 h-12 rounded-xl bg-slate_dark-400 hover:bg-slate_dark-500 border border-white/15 hover:border-tech_blue/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          aria-label="Increase seat quota"
        >
          <Plus className="w-4 h-4 text-tech_blue-700" />
        </button>
      </div>
    </div>
  );
};

export default Component;
