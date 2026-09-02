import React from 'react';
import { 
  IoLogoWhatsapp, 
  IoLogoGithub, 
  IoLogoTwitter, 
  IoLogoLinkedin, 
  IoHeart 
} from 'react-icons/io5';

export default function Footer() {
  return (
    <footer className="bg-prussian_blue-100 border-t border-deep_space_blue/50 pt-16 pb-12 text-tan-800 text-sm relative">
      
      {/* Nova Top Laser Beam */}
      <div className="nova-beam absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-muted_teal/15">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-burnt_peach to-tan flex items-center justify-center shadow-md shadow-burnt_peach/25 border border-white/20">
                <IoLogoWhatsapp className="text-prussian_blue-100 text-xl" />
              </div>
              <span className="text-xl font-extrabold text-tan-900 tracking-tight">
                AutoMachine <span className="text-burnt_peach font-black">.io</span>
              </span>
            </div>

            <p className="text-sm text-tan-800 max-w-sm leading-relaxed font-normal">
              Enterprise-grade WhatsApp automation, multi-agent AI chatbots, and zero-ban broadcast engine built on FastAPI, Redis, Meilisearch, and React.
            </p>

            {/* Nova System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full nova-pill text-xs font-mono font-semibold text-muted_teal">
              <span className="w-2 h-2 rounded-full bg-muted_teal nova-led" />
              <span>All Systems Operational (99.98% Uptime)</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-xl nova-pill hover:bg-burnt_peach hover:text-prussian_blue-100 text-tan flex items-center justify-center transition-colors">
                <IoLogoGithub className="text-lg" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl nova-pill hover:bg-burnt_peach hover:text-prussian_blue-100 text-tan flex items-center justify-center transition-colors">
                <IoLogoTwitter className="text-lg" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl nova-pill hover:bg-burnt_peach hover:text-prussian_blue-100 text-tan flex items-center justify-center transition-colors">
                <IoLogoLinkedin className="text-lg" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-tan-900">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-tan transition-colors">Core Features</a></li>
              <li><a href="#simulator" className="hover:text-tan transition-colors">Live Simulator</a></li>
              <li><a href="#workflow" className="hover:text-tan transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-tan transition-colors">SaaS Pricing</a></li>
              <li><a href="#faq" className="hover:text-tan transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Architecture Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-tan-900">
              Architecture
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-muted_teal transition-colors">FastAPI Async Engine</a></li>
              <li><a href="#" className="hover:text-muted_teal transition-colors">Strawberry GraphQL</a></li>
              <li><a href="#" className="hover:text-muted_teal transition-colors">Redis Leaky Bucket</a></li>
              <li><a href="#" className="hover:text-muted_teal transition-colors">Meilisearch Index</a></li>
              <li><a href="#" className="hover:text-muted_teal transition-colors">Boto3 S3 Pipelines</a></li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-tan-900">
              Compliance
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-tan-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-tan-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-tan-900 transition-colors">Anti-Spam Guarantee</a></li>
              <li><a href="#" className="hover:text-tan-900 transition-colors">GDPR & Meta Compliance</a></li>
              <li><a href="#" className="hover:text-tan-900 transition-colors">Security Overview</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-tan-800/70 font-mono">
          <p>© {new Date().getFullYear()} AutoMachine AI SaaS • Nova Visual Architecture</p>
          <div className="flex items-center gap-1.5 text-tan-800">
            <span>Crafted with</span>
            <IoHeart className="text-burnt_peach text-xs inline" />
            <span>using React 19, Tailwind v4 & Python FastAPI</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
