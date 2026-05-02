"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LuLayoutDashboard as LayoutDashboard,
  LuSquareCheckBig as CheckSquare,
  LuCalendar as Calendar,
  LuChartColumn as BarChart3,
  LuSettings as Settings,
  LuSparkles as Sparkles,
  LuZap as Zap,
  LuLogOut as LogOut,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuX as X,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

const Sidebar = ({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const showCompact = collapsed && !mobileOpen;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white shadow-[6px_0_24px_rgba(15,23,42,0.05)] transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 dark:shadow-[6px_0_24px_rgba(2,6,23,0.45)]",
          "w-72 -translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0",
          showCompact && "lg:w-16",
          !showCompact && "lg:w-64",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          {!showCompact && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-indigo-600">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                OptiFlow
              </span>
            </Link>
          )}
          {showCompact && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-indigo-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onCloseMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute -right-3 top-20 z-50 hidden rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:inline-flex"
          onClick={onToggle}
        >
          {showCompact ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-violet-300",
                pathname === item.href &&
                  "bg-violet-50 text-violet-700 dark:bg-slate-900 dark:text-violet-300",
                showCompact && "lg:justify-center lg:px-2",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!showCompact && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="space-y-1 border-t border-slate-200 px-3 py-4 dark:border-slate-800">
          <Link
            href="/dashboard/settings"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
              pathname === "/dashboard/settings" &&
                "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100",
              showCompact && "lg:justify-center lg:px-2",
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!showCompact && (
              <span className="font-medium text-sm">Settings</span>
            )}
          </Link>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30",
              showCompact && "lg:justify-center lg:px-2",
            )}
            onClick={() => {
              logout();
              router.push("/");
              onCloseMobile?.();
            }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!showCompact && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
