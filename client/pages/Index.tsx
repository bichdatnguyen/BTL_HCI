import { useSetPageHeader } from "@/contexts/HeaderContext";
import { useProfile } from "@/contexts/ProfileContext";
import { ProgressSection } from "@/components/ProgressSection";
import { GamesSection } from "@/components/GamesSection";
import { LibrarySection } from "@/components/LibrarySection";

export default function Index() {
  const { selectedProfile } = useProfile();

  useSetPageHeader({
    title: "Xin chào! 👋",
    subtitle: `Hôm nay ${selectedProfile?.name} sẽ học gì?`,
    userName: selectedProfile?.initials || "T",
    streakCount: 5,
  });

  return (
    <div className="animate-fade-in">
      <ProgressSection />
      <GamesSection />
      <LibrarySection />
    </div>
  );
}
