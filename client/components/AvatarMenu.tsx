import { useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronDown } from "lucide-react";
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
  userName?: string;
}

export function AvatarMenu({ initials = "T", userName = "T" }: AvatarMenuProps) {
  const navigate = useNavigate();
  const { profiles, selectedProfile, selectProfile } = useProfile();

  const handleLogout = () => {
    navigate("/login");
  };

  const handleSelectProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      selectProfile(profile);
    }
  };

  const otherProfiles = profiles.filter((p) => p.id !== selectedProfile?.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-full flex items-center gap-2 group">
          <UserAvatar initials={selectedProfile?.initials || initials} size="md" />
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Current Profile */}
        {selectedProfile && (
          <>
            <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Hồ sơ hiện tại
            </div>
            <div className="px-2 py-2 flex items-center gap-3 bg-muted/30 rounded-md mb-2">
              <span className="text-xl">{selectedProfile.avatar}</span>
              <span className="font-semibold text-foreground">
                {selectedProfile.name}
              </span>
            </div>
            <DropdownMenuSeparator className="my-2" />
          </>
        )}

        {/* Other Profiles */}
        {otherProfiles.length > 0 && (
          <>
            <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Chuyển đổi hồ sơ
            </div>
            {otherProfiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                className="cursor-pointer gap-3 py-2"
              >
                <span className="text-lg">{profile.avatar}</span>
                <span className="font-medium">{profile.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-2" />
          </>
        )}

        {/* Manage Profiles */}
        <DropdownMenuItem
          onClick={() => navigate("/manage-profiles")}
          className="cursor-pointer gap-2"
        >
          <Settings className="w-4 h-4" />
          <span>Quản lý hồ sơ</span>
        </DropdownMenuItem>

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
