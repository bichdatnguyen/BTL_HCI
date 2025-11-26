import { useNavigate } from "react-router-dom";
import { useProfile, Profile } from "@/contexts/ProfileContext";
import { ProfileCard } from "@/components/ProfileCard";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AVATAR_OPTIONS = ["🐶", "🐱", "🐰", "🐻", "🐼", "🐨", "🐯", "🦁"];

export default function ProfileSelection() {
  const navigate = useNavigate();
  const { profiles, selectedProfile, selectProfile, addProfile } = useProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🐶");

  const handleSelectProfile = (profile: Profile) => {
    selectProfile(profile);
    navigate("/");
  };

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      const newProfile: Profile = {
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

  return (
    <div
      className="min-h-screen bg-[#FCFAF6] flex flex-col items-center justify-center px-6 py-8"
      style={{ backgroundColor: "#FCFAF6" }}
    >
      <div className="w-full max-w-5xl">
        {/* Question */}
        <h1 className="text-5xl md:text-6xl font-bold text-foreground text-center mb-16">
          Ai đang học hôm nay?
        </h1>

        {/* Profile Cards Row */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={selectedProfile?.id === profile.id}
              onClick={() => handleSelectProfile(profile)}
            />
          ))}

          {/* Add Profile Card */}
          <ProfileCard
            profile={{
              id: "add",
              name: "Add",
              avatar: "",
              initials: "+",
            }}
            isAddButton={true}
            onClick={() => setIsAddDialogOpen(true)}
          />
        </div>
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddProfile}
                disabled={!newProfileName.trim()}
                className="flex-1"
              >
                Thêm bé
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
