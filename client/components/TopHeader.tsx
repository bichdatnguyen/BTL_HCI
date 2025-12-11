import { useState } from "react";
import { Check } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { StreakBadge } from "./StreakBadge";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  userName?: string;
  streakCount?: number;
  onCheckIn?: () => void;
}

export function TopHeader({
  userName = "T",
  streakCount = 5,
  onCheckIn,
}: TopHeaderProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    onCheckIn?.();
  };

  return (
    <header className="bg-background border-b border-border fixed top-0 right-0 left-32 z-40 shadow-sm">
      <div className="h-20 px-8 flex items-center justify-end">
        {/* User Profile Area */}
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <UserAvatar initials={userName} size="md" />

          {/* Streak Badge */}
          <StreakBadge count={streakCount} />

          {/* Check-in Button */}
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            className={cn(
              "px-6 py-2 rounded-full font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2",
              isCheckedIn
                ? "bg-warning text-foreground hover:opacity-90 focus:ring-warning disabled:cursor-default"
                : "bg-muted text-muted-foreground hover:opacity-90 focus:ring-primary disabled:opacity-50"
            )}
            aria-label={isCheckedIn ? "Checked in" : "Check in daily"}
          >
            {isCheckedIn && <Check className="w-4 h-4" aria-hidden="true" />}


          </button>
        </div>
      </div>
    </header>
  );
}
