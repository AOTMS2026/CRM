import React from 'react';
import { 
  IoMegaphoneOutline, 
  IoGitNetworkOutline, 
  IoPeopleOutline, 
  IoSearchOutline, 
  IoCloudUploadOutline, 
  IoCodeSlashOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

export default function FeaturesSection() {
  const features = [
    {
      icon: <IoMegaphoneOutline className="text-2xl text-burnt_peach" />,
      title: 'Broadcast Campaigns with Anti-Ban Pacing',
      description: 'Send thousands of targeted announcements, festival offers, and newsletters. Our queue paces deliveries with human-like delays so your account stays 100% safe.',
      color: 'from-burnt_peach/20 to-transparent',
      borderColor: 'group-hover:border-burnt_peach/70',
      badge: 'High Conversion'
    },
    {
      icon: <IoGitNetworkOutline className="text-2xl text-tan" />,
      title: 'Automated Drip Sequences & Follow-Ups',
      description: 'Nurture cold leads automatically. Trigger custom multi-day message sequences when a lead scans your QR code, visits your store, or leaves an abandoned cart.',
      color: 'from-tan/20 to-transparent',
      borderColor: 'group-hover:border-tan/70',
      badge: 'Set & Forget'
    },
    {
      icon: <IoPeopleOutline className="text-2xl text-muted_teal" />,
      title: 'Multi-Agent Shared Team Inbox',
      description: 'Allow multiple sales and support reps to reply from the same WhatsApp number simultaneously. Assign tags, transfer chats, and write internal notes.',
      color: 'from-muted_teal/20 to-transparent',
      borderColor: 'group-hover:border-muted_teal/70',
      badge: 'Collaboration'
    },
    {
      icon: <IoSearchOutline className="text-2xl text-tan-900" />,
      title: 'Sub-20ms Meilisearch Engine',
      description: 'Never lose a lead or customer address. Search through millions of messages, contact tags, and invoices with typo-tolerant sub-second search speeds.',
      color: 'from-tan-900/15 to-transparent',
      borderColor: 'group-hover:border-tan-900/70',
      badge: 'Sub-Second'
    },
    {
      icon: <IoCloudUploadOutline className="text-2xl text-burnt_peach-400" />,
      title: 'Cloud Media & Voice Note Pipeline',
      description: 'Send dynamic PDF invoices, product image carousels, and realistic voice note audio files (.ogg) stored securely on AWS S3 / Cloudflare R2 via Boto3.',
      color: 'from-burnt_peach-400/20 to-transparent',
      borderColor: 'group-hover:border-burnt_peach-400/70',
      badge: 'S3 / Boto3'
    },
    {
      icon: <IoCodeSlashOutline className="text-2xl text-muted_teal-600" />,
      title: 'GraphQL, REST & Webhook Triggers',
      description: 'Seamlessly plug AutoMachine into Shopify, WooCommerce, PostgreSQL, or Zapier. Auto-trigger WhatsApp messages whenever an order is placed or payment succeeds.',
      color: 'from-muted_teal-600/20 to-transparent',
      borderColor: 'group-hover:border-muted_teal-600/70',
      badge: 'Developer API'
    }
  ];

  return (
    <section id="features" className="py-24 bg-prussian_blue-100 relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full nova-pill text-xs font-bold text-muted_teal tracking-wide uppercase">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-tan-900 tracking-tight">
            Everything You Need To Run An <span className="gradient-text-teal">Enterprise WhatsApp Business</span>
          </h2>
          <p className="text-base sm:text-lg text-tan-800 leading-relaxed font-normal">
            Say goodbye to clunky spreadsheet trackers and unofficial tools that risk your phone number getting banned.
          </p>
        </div>

        {/* Feature Grid with Nova Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className={`rounded-2xl nova-card p-8 border border-muted_teal/20 relative group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${f.borderColor} overflow-hidden`}
            >
              {/* Top ambient corner glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${f.color} rounded-bl-full blur-xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-deep_space_blue/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 border border-white/10">
                      {f.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full nova-pill text-tan-800">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-tan-900 mb-3 group-hover:text-tan transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-sm text-tan-800 leading-relaxed font-normal">
                    {f.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-muted_teal/15 flex items-center gap-1.5 text-xs text-muted_teal font-semibold font-mono">
                  <IoCheckmarkCircleOutline className="text-sm" /> Available in all plans
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
