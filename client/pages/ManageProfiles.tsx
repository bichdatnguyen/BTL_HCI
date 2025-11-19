import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AVATAR_OPTIONS = ["🐶", "🐱", "🐰", "🐻", "🐼", "🐨", "🐯", "🦁"];

export default function ManageProfiles() {
  const navigate = useNavigate();
  const { profiles, selectedProfile, addProfile, removeProfile } = useProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🐶");

  useSetPageHeader({
    title: "Quản lý hồ sơ",
    subtitle: "Quản lý hồ sơ của các bé",
    userName: selectedProfile?.initials || "T",
    streakCount: 5,
  });

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      const newProfile = {
        id: Date.now().toString(),
        name: newProfileName,
        avatar: selectedAvatar,
        initials: newProfileName.charAt(0).toUpperCase(),
      };
      addProfile(newProfile);
      setNewProfileName("");
      setSelectedAvatar("🐶");
      setIsAddDialogOpen(false);
    }
  };

  const handleRemoveProfile = (id: string) => {
    if (profiles.length > 1) {
      removeProfile(id);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-card rounded-2xl border-2 border-border p-6 flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{profile.avatar}</div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {profile.name}
                </h3>
                {profile.id === selectedProfile?.id && (
                  <p className="text-sm text-primary font-semibold">
                    Đang hoạt động
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => handleRemoveProfile(profile.id)}
              disabled={profiles.length === 1}
              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Delete ${profile.name}`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Profile Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm hồ sơ mới
        </Button>
      </div>

      {/* Add Profile Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Thêm bé mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tên bé
              </label>
              <Input
                placeholder="Nhập tên bé"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Chọn hình đại diện
              </label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`p-4 text-3xl rounded-lg border-2 transition-all ${
                      selectedAvatar === avatar
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddProfile}
              disabled={!newProfileName.trim()}
            >
              Thêm bé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
