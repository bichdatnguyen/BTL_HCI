import { useEffect, useState } from "react";
import { DashboardCard, DashboardSection } from "./DashboardCard";
import { Trophy } from "lucide-react";

interface ProgressItem {
  id: string;
  title: string;
  progress: number;
  color: "green" | "blue" | "purple";
  displayValue?: string; // Thêm trường này để hiển thị chữ "1 ngày" thay vì "14%"
}

const colorMap = {
  green: "bg-success",
  blue: "bg-accent",
  purple: "bg-primary",
};

export function ProgressSection() {
  // 1. Chuyển progressItems thành State để có thể cập nhật động
  const [items, setItems] = useState<ProgressItem[]>([
    {
      id: "reading",
      title: "Đọc hôm nay",
      progress: 65,
      color: "green",
    },
    {
      id: "games",
      title: "Trò chơi hoàn thành",
      progress: 42,
      color: "blue",
    },
    {
      id: "streak",
      title: "Chuỗi 7 ngày",
      progress: 0, // Mặc định là 0, sẽ cập nhật ngay khi trang web tải xong
      color: "purple",
      displayValue: "0 ngày",
    },
  ]);

  // 2. Dùng useEffect để lấy dữ liệu Streak thật từ bộ nhớ
  useEffect(() => {
    // Lấy số streak đang lưu trong máy
    const savedStreak = localStorage.getItem("currentStreak");
    const streakCount = savedStreak ? parseInt(savedStreak) : 0;

    // Tính toán phần trăm cho thanh tiến độ (Mục tiêu là 7 ngày)
    // Ví dụ: 1 ngày = 14%, 3 ngày = 42%, 7 ngày = 100%
    const percentage = Math.min(Math.round((streakCount / 7) * 100), 100);

    // Cập nhật lại danh sách items
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === "streak") {
          return {
            ...item,
            progress: percentage, // Cập nhật độ dài thanh màu
            displayValue: `${streakCount}/7 ngày`, // Cập nhật dòng chữ hiển thị
          };
        }
        return item;
      })
    );
  }, []);

  return (
    <DashboardSection title="📊 Tiến độ của tôi" className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <DashboardCard key={item.id}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              {item.id === "streak" && (
                <Trophy className="w-6 h-6 text-warning" aria-hidden="true" />
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden mb-3">
              <div
                className={`h-full ${colorMap[item.color]} transition-all duration-1000 ease-out`} // Thêm hiệu ứng chạy mượt
                style={{ width: `${item.progress}%` }}
                role="progressbar"
                aria-valuenow={item.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.title}: ${item.progress}%`}
              />
            </div>

            {/* Hiển thị số liệu: Ưu tiên displayValue nếu có */}
            <p className="text-base font-semibold text-foreground">
              {item.displayValue ? item.displayValue : `${item.progress}%`}
            </p>
          </DashboardCard>
        ))}
      </div>
    </DashboardSection>
  );
}