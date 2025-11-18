import { useState, useEffect } from "react"; // Thêm useEffect nếu muốn đồng bộ
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

  // 1. Tạo state mới để quản lý số hiển thị, khởi tạo bằng giá trị prop truyền vào
  const [displayStreak, setDisplayStreak] = useState(streakCount);

  // (Tùy chọn) Nếu component cha cập nhật streakCount mới, cập nhật lại state hiển thị
  useEffect(() => {
    setDisplayStreak(streakCount);
  }, [streakCount]);

  const handleCheckIn = () => {
    // Ngăn chặn click nhiều lần nếu đã điểm danh
    if (isCheckedIn) return;

    setIsCheckedIn(true);

    // 2. Tăng giá trị hiển thị lên 1
    setDisplayStreak((prev) => prev + 1);

    // Gọi hàm callback để báo cho component cha (nếu cần lưu vào database)
    onCheckIn?.();
  };

  return (
    <header className="bg-background border-b border-border fixed top-0 right-0 left-32 z-40 shadow-sm">
      <div className="h-20 px-8 flex items-center justify-end">
        <div className="flex items-center gap-6">
          <UserAvatar initials={userName} size="md" />

          {/* 3. Sử dụng displayStreak thay vì streakCount */}
          <StreakBadge count={displayStreak} />

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
            <span>{isCheckedIn ? "Đã điểm danh" : "Điểm danh"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}