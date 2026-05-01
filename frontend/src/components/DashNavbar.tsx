"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LuMenu as Menu, LuMoon as Moon, LuSun as Sun } from "react-icons/lu";
import { useTheme } from "@/context/ThemeContext";

interface DashNavbarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onMenuClick?: () => void;
}

const DashNavbar = ({
  userName = "John Doe",
  userEmail = "john@example.com",
  userAvatar,
  onMenuClick,
}: DashNavbarProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.05)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMenuClick}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              OptiFlow
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Workspace
          </p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            Focus dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-3 rounded-lg p-1.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-linear-to-br from-violet-600 to-indigo-600 text-sm text-white">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashNavbar;
