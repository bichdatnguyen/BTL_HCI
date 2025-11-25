import { cn } from "@/lib/utils";
import { Profile } from "@/contexts/ProfileContext";

interface ProfileCardProps {
  profile: Profile;
  isSelected?: boolean;
  onClick?: () => void;
  isAddButton?: boolean;
}

export function ProfileCard({
  profile,
  isSelected = false,
  onClick,
  isAddButton = false,
}: ProfileCardProps) {
  if (isAddButton) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-32 h-40 rounded-2xl border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-2 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <span className="text-4xl font-light text-muted-foreground">+</span>
        <span className="text-sm font-semibold text-muted-foreground text-center px-2">
          Thêm bé mới
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-32 h-40 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected
          ? "bg-primary/10 border-2 border-primary shadow-md"
          : "bg-card border-2 border-border hover:border-primary hover:shadow-md"
      )}
    >
      <div className="text-5xl">{profile.avatar}</div>
      <span className="text-lg font-bold text-foreground">{profile.name}</span>
    </button>
  );
}
