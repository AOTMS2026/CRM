import React from 'react';
import GradientWaves from './GradientWaves';
import { 
  IoFlashOutline, 
  IoPlayCircleOutline, 
  IoArrowForward, 
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoPulseOutline
} from 'react-icons/io5';

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[750px] overflow-hidden bg-slate_dark">
      {/* Full-Screen Interactive 3D WebGL Wave Background */}
      <div className="absolute inset-0 w-full h-full">
        <GradientWaves
          horizonColor="#5227FF"
          waveColor="#FF9FFC"
          crestColor="#FFFFFF"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1}
          opacity={1}
          mouseInteraction
          parallaxStrength={0.5}
          grain
          grainIntensity={0.05}
        />
      </div>

      {/* Atmospheric Vignette & Contrast Overlay */}
      <div className="absolute inset-0 bg-slate_dark/45 backdrop-brightness-95 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate_dark via-slate_dark/80 to-transparent pointer-events-none" />

      {/* Middle Center Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 lg:px-8 pointer-events-none pt-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate_dark-300/80 border border-white/20 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-xl pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-tech_orange animate-pulse" />
            <span className="text-white font-bold tracking-wide">ENTERPRISE WHATSAPP CRM</span>
            <span className="text-white/40">•</span>
            <span className="text-slate-300 font-mono">Company Edition</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-lg">
            The Modern WhatsApp CRM Built For{' '}
            <span className="gradient-text-peach font-black">Fast-Growing Companies.</span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-md">
            Unify your company's customer conversations, automate sales pipelines, assign chats to multi-agent teams, and close deals faster directly on WhatsApp.
          </p>

          {/* Middle Center Clean & Neat Two Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            {/* Primary Action Button */}
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm tracking-wide text-white bg-tech_orange hover:bg-tech_orange-600 shadow-2xl shadow-tech_orange/40 hover:shadow-tech_orange/60 hover:-translate-y-0.5 active:translate-y-0 border border-white/30 transition-all duration-200 group"
            >
              <IoFlashOutline className="text-base group-hover:scale-110 transition-transform" />
              <span>Book a Demo</span>
              <IoArrowForward className="text-xs group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Secondary Action Button */}
            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm tracking-wide text-white bg-slate_dark-300/70 hover:bg-slate_dark-300/95 backdrop-blur-xl border border-white/25 hover:border-white/50 shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <IoPlayCircleOutline className="text-xl text-tech_orange" />
              <span>Explore Platform</span>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <IoCheckmarkCircleOutline className="text-tech_orange text-sm" /> 3.8x Deal Velocity
            </span>
            <span className="flex items-center gap-1.5">
              <IoPulseOutline className="text-emerald-400 text-sm" /> &lt; 45s Response SLA
            </span>
            <span className="flex items-center gap-1.5">
              <IoShieldCheckmarkOutline className="text-sky-400 text-sm" /> Zero-Ban Account Protection
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
