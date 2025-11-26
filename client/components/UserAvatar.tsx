import { User } from "lucide-react";

interface UserAvatarProps {
  initials?: string;
  avatar?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const emojiSizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};


export function UserAvatar({
  initials = "T",
  avatar,
  icon,
  size = "md",
}: UserAvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm`}
    >
      {avatar ? (
        <div className={emojiSizeMap[size]}>{avatar}</div>
      ) : icon ? (
        <div className={iconSizeMap[size]}>{icon}</div>
      ) : (
        initials
      )}
    </div>
  );
}
