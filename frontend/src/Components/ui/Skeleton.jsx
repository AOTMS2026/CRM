import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

// Skeleton loader for Templates Studio Grid items
export function SkeletonTemplateCard() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for Live WhatsApp Contacts List
export function SkeletonContactItem() {
  return (
    <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-3 w-full">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-14 rounded-md shrink-0" />
    </div>
  );
}

// Skeleton loader for WhatsApp Chat Messages
export function SkeletonMessageBubble({ isIncoming = false }) {
  return (
    <div className={`flex flex-col ${isIncoming ? 'items-start' : 'items-end'}`}>
      <div className={`p-3.5 rounded-2xl w-64 space-y-2 border ${
        isIncoming ? 'bg-white border-slate-200' : 'bg-emerald-100/50 border-emerald-200'
      }`}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex justify-end pt-1">
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
