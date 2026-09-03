import React from 'react';
import { 
  Users, 
  Target, 
  BookUser,
  Briefcase, 
  PhoneCall, 
  MessageSquare, 
  Send,
  CheckSquare, 
  CreditCard, 
  Settings,
  Plug
} from 'lucide-react';
import { IoLogoInstagram as Instagram } from 'react-icons/io5';

export const navTabs = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Plug},
  { id: 'contacts', label: 'Contacts', icon: BookUser, badge: 'Meta & Excel' },
  { id: 'leads', label: 'Leads & Pipeline', icon: Target },
  { id: 'whatsapp-blast', label: 'WhatsApp Blast', icon: Send, badge: 'Meta Engine' },
  { id: 'employees', label: 'Employees', icon: Briefcase },
  { id: 'ai-calling', label: 'AI Calling', icon: PhoneCall },
  { id: 'whatsapp', label: 'Whatsapp_Messages', icon: MessageSquare},
  { id: 'todos', label: 'Todo List', icon: CheckSquare },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'pay-sip', label: 'Pay_SIP', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function MiniNavbar({ activeTab, setActiveTab }) {
  return (
    <div className="border-b border-slate-200 pt-2 flex items-center gap-7 overflow-x-auto scrollbar-none">
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative ${
              isActive
                ? 'text-sky-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                isActive 
                  ? 'bg-sky-100 text-sky-700 border border-sky-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
