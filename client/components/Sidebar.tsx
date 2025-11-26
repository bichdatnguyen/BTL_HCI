import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    label: "Trang chủ",
    path: "/",
    icon: Home,
  },
  {
    label: "Luyện tập",
    path: "/games",
    icon: Gamepad2,
  },
  {
    label: "Thư viện",
    path: "/library",
    icon: BookOpen,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-32 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-8 gap-8">
      {/* Branding/Logo area */}
      <div className="text-3xl font-bold text-sidebar-primary">📖</div>

      {/* Navigation items */}
      <nav className="flex flex-col gap-6 flex-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 no-underline",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sidebar-ring",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-12 h-12" aria-hidden="true" />
              <span className="text-xs font-semibold text-center leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom spacing */}
      <div className="h-8" />
    </aside>
  );
}
