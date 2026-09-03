"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-base outline-none transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 sm:text-sm [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-3.5 sm:h-8 text-xs font-bold",
        icon: "size-9 sm:size-8",
        "icon-lg": "size-10 sm:size-9",
        "icon-sm": "size-8 sm:size-7",
        "icon-xl": "size-11 sm:size-10",
        "icon-xs": "size-7 rounded-md sm:size-6",
        lg: "h-10 px-4 sm:h-9 text-xs font-extrabold",
        sm: "h-8 gap-1.5 px-3 sm:h-7 text-xs font-bold",
        xl: "h-11 px-5 text-sm font-black",
        xs: "h-7 gap-1 rounded-md px-2 text-xs",
      },
      variant: {
        default:
          "border-emerald-600 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:scale-98",
        destructive:
          "border-rose-600 bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:scale-98",
        "destructive-outline":
          "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 border",
        ghost:
          "border-transparent text-slate-700 hover:bg-slate-100",
        link: "border-transparent text-sky-600 underline-offset-4 hover:underline",
        outline:
          "border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-50 border font-bold",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold",
      },
    },
  }
);

function Button({ className, variant, size, render, ...props }) {
  const typeValue = render ? undefined : "button";

  const defaultProps = {
    className: cn(buttonVariants({ className, size, variant })),
    "data-slot": "button",
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps(defaultProps, props),
    render,
  });
}

export { Button, buttonVariants };
