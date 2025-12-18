import { useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import { useProfile } from "@/contexts/ProfileContext";

interface AvatarMenuProps {
  initials?: string;
  avatar?: string;
  userName?: string;
}

export function AvatarMenu({ initials = "T", avatar, userName = "T" }: AvatarMenuProps) {
  const navigate = useNavigate();
  const { selectedProfile } = useProfile();
  const [displayAvatar, setDisplayAvatar] = useState(avatar || selectedProfile?.avatar);

  // Listen for user-updated events to sync avatar across components
  useEffect(() => {
    const handleUserUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedProfile = customEvent.detail?.profile;
      if (updatedProfile?.avatar) {
        setDisplayAvatar(updatedProfile.avatar);
      }
    };

    window.addEventListener('user-updated', handleUserUpdated);
    return () => window.removeEventListener('user-updated', handleUserUpdated);
  }, []);

  // Update display avatar when props change
  useEffect(() => {
    if (avatar) {
      setDisplayAvatar(avatar);
    } else if (selectedProfile?.avatar) {
      setDisplayAvatar(selectedProfile.avatar);
    }
  }, [avatar, selectedProfile?.avatar]);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleSettings = () => {
    navigate("/manage-profiles");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-full flex items-center gap-2 group">
          <UserAvatar initials={initials} avatar={displayAvatar} size="md" />
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Personal Settings */}
        <DropdownMenuItem
          onClick={handleSettings}
          className="cursor-pointer gap-2"
        >
          <Settings className="w-4 h-4" />
          <span>Cài đặt cá nhân</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}