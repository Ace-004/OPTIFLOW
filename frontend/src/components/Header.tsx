// 'use client';

import Link from "next/link";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-indigo-600">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
            OptiFlow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            How it Works
          </a>
          {/* <a
              href="#testimonials"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Testimonials
            </a> */}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            >
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
