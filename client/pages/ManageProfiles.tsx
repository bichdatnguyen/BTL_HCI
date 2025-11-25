import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AVATAR_OPTIONS = ["🐶", "🐱", "🐰", "🐻", "🐨", "🐯", "🦁"];

export default function ManageProfiles() {
  const navigate = useNavigate();
  const { selectedProfile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: selectedProfile?.name || "",
    avatar: selectedProfile?.avatar || "🐶",
    birthday: selectedProfile?.birthday || "",
  });

  useSetPageHeader({
    title: "Hồ sơ của tớ",
    subtitle: "",
    userName: selectedProfile?.initials || "T",
    userAvatar: selectedProfile?.avatar,
    streakCount: 5,
  });

  // Sync form data when profile updates
  useEffect(() => {
    if (selectedProfile) {
      setFormData({
        name: selectedProfile.name || "",
        avatar: selectedProfile.avatar || "🐶",
        birthday: selectedProfile.birthday || "",
      });
    }
  }, [selectedProfile?.id]);

  const handleAvatarSelect = (avatar: string) => {
    setFormData({ ...formData, avatar });
    setIsAvatarPickerOpen(false);
  };

  const handleSave = () => {
    if (selectedProfile) {
      const updatedProfile = {
        ...selectedProfile,
        name: formData.name,
        avatar: formData.avatar,
        birthday: formData.birthday,
        initials: formData.name.charAt(0).toUpperCase(),
      };
      updateProfile(updatedProfile);


      // Dispatch custom event to notify other components about profile update
      const event = new CustomEvent('user-updated', {
        detail: { profile: updatedProfile }
      });
      window.dispatchEvent(event);

      toast({
        title: "Thành công!",
        description: "Hồ sơ của bạn đã được cập nhật.",
      });
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center py-12">
      {/* Main Card */}
      <div className="w-full max-w-md bg-card rounded-3xl shadow-lg p-8">
        {/* Avatar Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-muted rounded-full mb-4 text-6xl">
            {formData.avatar}
          </div>
          <button
            onClick={() => setIsAvatarPickerOpen(true)}
            className="text-primary font-semibold hover:opacity-80 transition-opacity"
          >
            Đổi ảnh đại diện
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tên của tớ
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-background rounded-2xl px-6 py-3 text-lg font-medium text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Nhập tên của tớ"
            />
          </div>

          {/* Birthday Field */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Ngày sinh nhật
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) =>
                setFormData({ ...formData, birthday: e.target.value })
              }
              className="w-full bg-background rounded-2xl px-6 py-3 text-lg font-medium text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Username Field (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={selectedProfile?.username || "bi_bi_2015"}
              disabled
              className="w-full bg-muted rounded-2xl px-6 py-3 text-lg font-medium text-muted-foreground border border-border cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-8">
          <Button
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-bold text-lg"
          >
            Lưu thay đổi
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10 py-3 rounded-2xl font-bold text-lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Avatar Picker Dialog */}
      <Dialog open={isAvatarPickerOpen} onOpenChange={setIsAvatarPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Chọn ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarSelect(avatar)}
                className={`p-6 text-4xl rounded-2xl border-2 transition-all ${formData.avatar === avatar
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary"
                  }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
