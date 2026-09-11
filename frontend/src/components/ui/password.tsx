"use client";

import React, { useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export default function Password({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "h-11 pr-10 bg-slate-50 focus-visible:ring-violet-500 dark:bg-slate-900",
          className,
        )}
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
      >
        {visible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.958 9.958 0 012.175-5.5M6.1 6.1A9.955 9.955 0 0112 5c5.523 0 10 4.477 10 10 0 1.07-.163 2.1-.462 3.062M3 3l18 18"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
