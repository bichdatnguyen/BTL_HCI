import { AvatarMenu } from "./AvatarMenu";
import { StreakBadge } from "./StreakBadge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userAvatar?: string;
  streakCount?: number;
}

export function PageHeader({
  title,
  subtitle,
  userName = "T",
  userAvatar,
  streakCount = 0,
}: PageHeaderProps) {

  return (
    <div className="flex items-center justify-between gap-8">
      {/* Left: Title and Subtitle */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>

      {/* Right: User Profile Area */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Avatar with Dropdown Menu */}
        <AvatarMenu initials={userName} avatar={userAvatar} userName={userName} />

        {/* Streak Badge */}
        <StreakBadge count={streakCount} />
      </div>
    </div>
  );
}