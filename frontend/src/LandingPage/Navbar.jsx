import React, { useState, useEffect, useRef } from 'react';
import AuthSwitch from '@/components/ui/auth-switch';
import { 
  IoChevronDown, 
  IoMenuOutline, 
  IoCloseOutline,
  IoArrowForward,
  IoChatbubblesOutline,
  IoGitNetworkOutline,
  IoShieldCheckmarkOutline,
  IoStatsChartOutline
} from 'react-icons/io5';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menu) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { 
      name: 'Solutions', 
      href: '#solutions',
      hasDropdown: true,
      items: [
        { 
          title: 'D2C & eCommerce', 
          desc: 'Automate abandoned carts, COD verification, and order tracking.',
          icon: <IoChatbubblesOutline className="text-tech_orange text-lg" />,
          href: '#features'
        },
        { 
          title: 'Customer Support', 
          desc: 'Shared multi-agent team inbox with instant AI auto-replies.',
          icon: <IoShieldCheckmarkOutline className="text-tech_blue-600 text-lg" />,
          href: '#about'
        },
        { 
          title: 'Marketing & Broadcasts', 
          desc: 'Personalized broadcast campaigns with zero-ban rate limiting.',
          icon: <IoGitNetworkOutline className="text-tech_orange-600 text-lg" />,
          href: '#workflow'
        },
        { 
          title: 'High-Volume Enterprise', 
          desc: 'Dedicated proxies, custom SLA, and direct CRM webhooks.',
          icon: <IoStatsChartOutline className="text-tech_blue-700 text-lg" />,
          href: '#pricing'
        }
      ]
    },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Resources', href: '#resources' },
    { name: 'Partners', href: '#partners' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'calm-nav calm-nav-scrolled py-4' 
          : 'calm-nav py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo - Native Transparent PNG (Slightly Increased Size) */}
          <a href="#" className="flex items-center group py-1">
            <img 
              src="/logo.png" 
              alt="Academy of Tech Masters" 
              className="h-9 sm:h-11 md:h-12 w-auto object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-[1.02]" 
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div 
                    key={link.name} 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter('solutions')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors duration-150 ${
                        activeDropdown === 'solutions' 
                          ? 'text-white bg-slate_dark-400' 
                          : 'text-slate-200 hover:text-white hover:bg-slate_dark-400/60'
                      }`}
                    >
                      <span>{link.name}</span>
                      <IoChevronDown 
                        className={`text-xs text-tech_blue-700 transition-transform duration-200 ${
                          activeDropdown === 'solutions' ? 'rotate-180 text-tech_orange' : ''
                        }`} 
                      />
                    </button>

                    {/* Solutions Dropdown Menu */}
                    {activeDropdown === 'solutions' && (
                      <div className="absolute top-full left-0 w-84 mt-2.5 p-2.5 rounded-2xl bg-slate_dark-300/95 backdrop-blur-xl border border-tech_blue/30 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="grid grid-cols-1 gap-1.5">
                          {link.items.map((item, idx) => (
                            <a
                              key={idx}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className="p-3 rounded-xl hover:bg-slate_dark-400/80 flex items-start gap-3.5 transition-colors group"
                            >
                              <div className="p-2.5 rounded-lg bg-slate_dark-400/90 border border-tech_blue/20 group-hover:border-tech_orange/50 transition-colors">
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white group-hover:text-tech_orange transition-colors">
                                  {item.title}
                                </div>
                                <div className="text-xs text-slate-300 leading-normal mt-0.5">
                                  {item.desc}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2.5 rounded-lg text-[15px] font-medium text-slate-200 hover:text-white hover:bg-slate_dark-400/60 transition-colors duration-150"
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Desktop Right Actions: Login + Book a Demo */}
          <div className="hidden lg:flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2.5 text-[15px] font-medium text-slate-200 hover:text-tech_orange transition-colors duration-150 cursor-pointer"
            >
              Login
            </button>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-5.5 py-3 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-tech_orange to-tech_orange-600 hover:from-tech_orange-600 hover:to-tech_orange shadow-md shadow-tech_orange/25 border border-tech_orange-400/40 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Book a Demo</span>
              <IoArrowForward className="text-sm" />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate_dark-400 border border-tech_blue/30 text-white hover:text-tech_orange transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <IoCloseOutline className="text-2xl" />
              ) : (
                <IoMenuOutline className="text-2xl" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-slate_dark-300/95 backdrop-blur-xl border border-tech_blue/30 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-100 hover:text-tech_orange hover:bg-slate_dark-400/60 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate_dark-500 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAuthModal(true);
                }}
                className="w-full py-2 rounded-lg text-center text-sm font-medium text-slate-200 hover:text-tech_orange hover:bg-slate_dark-400/50 transition-colors cursor-pointer"
              >
                Login
              </button>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white bg-gradient-to-r from-tech_orange to-tech_orange-600 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-tech_orange/25"
              >
                <span>Book a Demo</span>
                <IoArrowForward className="text-xs" />
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Better Auth Live Interactive Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-md w-full">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-slate_dark-400 border border-white/20 text-white flex items-center justify-center hover:bg-slate_dark-500 hover:text-tech_orange transition-colors cursor-pointer shadow-lg"
              aria-label="Close modal"
            >
              <IoCloseOutline className="text-xl" />
            </button>
            <AuthSwitch onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
