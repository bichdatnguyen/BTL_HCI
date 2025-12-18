import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { selectedProfile } = useProfile();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm px-8 md:px-16 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">📖</div>
            <h1 className="text-2xl font-bold text-foreground">Trang Quản Trị</h1>
          </div>

          {/* Right: Avatar and Logout */}
          <div className="flex items-center gap-4">
            <UserAvatar
              initials={selectedProfile?.initials || "AD"}
              avatar={selectedProfile?.avatar}
              size="md"
            />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 font-bold px-4 py-2 h-auto"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
