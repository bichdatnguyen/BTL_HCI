import { createContext, useContext, useState, ReactNode } from "react";

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  birthday?: string;
  username?: string;
}

interface ProfileContextType {
  profiles: Profile[];
  selectedProfile: Profile | null;
  selectProfile: (profile: Profile) => void;
  addProfile: (profile: Profile) => void;
  removeProfile: (id: string) => void;
  updateProfile: (profile: Profile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Minh",
    avatar: "🐶",
    initials: "M",
  },
  {
    id: "2",
    name: "Lan",
    avatar: "🐱",
    initials: "L",
  },
  {
    id: "3",
    name: "Huy",
    avatar: "🐰",
    initials: "H",
  },
];

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    DEFAULT_PROFILES[0]
  );

  const selectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  const addProfile = (profile: Profile) => {
    setProfiles([...profiles, profile]);
  };

  const removeProfile = (id: string) => {
    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);
    if (selectedProfile?.id === id && filtered.length > 0) {
      setSelectedProfile(filtered[0]);
    }
  };

  const updateProfile = (updatedProfile: Profile) => {
    setProfiles(profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)));
    if (selectedProfile?.id === updatedProfile.id) {
      setSelectedProfile(updatedProfile);
    }
  };


  return (
    <ProfileContext.Provider
      value={{ profiles, selectedProfile, selectProfile, addProfile, removeProfile, updateProfile }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
