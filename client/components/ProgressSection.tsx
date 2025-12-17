import { useEffect, useState } from "react";
import { DashboardCard, DashboardSection } from "./DashboardCard";
import { Trophy } from "lucide-react";

interface ProgressItem {
  id: string;
  title: string;
  progress: number;
  color: "green" | "blue" | "purple";
  displayValue?: string;
}

const colorMap = {
  green: "bg-success",
  blue: "bg-accent",
  purple: "bg-primary",
};

export function ProgressSection() {
  const [items, setItems] = useState<ProgressItem[]>([
    {
      id: "reading",
      title: "Đọc hôm nay",
      progress: 0,
      color: "green",
      displayValue: "0 phút",
    },
    {
      id: "games",
      title: "Trò chơi hoàn thành",
      progress: 0,
      color: "blue",
      displayValue: "0/3 game",
    },
    {
      id: "streak",
      title: "Chuỗi 7 ngày",
      progress: 0,
      color: "purple",
      displayValue: "0 ngày",
    },
  ]);

  useEffect(() => {
    const fetchAllProgress = async () => {
      const userId = localStorage.getItem("userId");

      // 1. STREAK
      const savedStreak = localStorage.getItem("currentStreak");
      const streakCount = savedStreak ? parseInt(savedStreak) : 0;
      // Kẹp giá trị trong khoảng 0-100%
      const streakPercent = Math.min(Math.round((streakCount / 7) * 100), 100);
      const streakDisplay = `${streakCount}/7 ngày`;

      let readPercent = 0;
      let readDisplay = "0 phút";
      let gamePercent = 0;
      let gameDisplay = "0/3 game";

      // 2. API Đọc & Game
      if (userId) {
        try {
          const res = await fetch(`http://localhost:5000/api/users/progress/${userId}`);
          if (res.ok) {
            const data = await res.json();

            // --- XỬ LÝ ĐỌC SÁCH ---
            const readGoal = 900; // 15 phút
            // Dùng Math.min(..., 100) để không bao giờ vượt quá 100%
            readPercent = Math.min(Math.round((data.readSeconds / readGoal) * 100), 100);

            const currentMin = Math.floor(data.readSeconds / 60);
            const goalMin = Math.floor(readGoal / 60);
            readDisplay = `${currentMin}/${goalMin} phút`;

            // --- XỬ LÝ GAME ---
            const gameGoal = 3;
            // 1. Tính phần trăm hiển thị (Max 100%)
            gamePercent = Math.min(Math.round((data.gamesCount / gameGoal) * 100), 100);

            // 2. 🔥 SỬA QUAN TRỌNG: Giới hạn số hiển thị (Max là gameGoal)
            // Nếu data bị lỗi là 13, thì chỉ hiện 3/3 thôi
            const displayCount = data.gamesCount > gameGoal ? gameGoal : data.gamesCount;
            gameDisplay = `${displayCount}/${gameGoal} game`;
          }
        } catch (error) {
          console.error("Lỗi lấy tiến độ:", error);
        }
      }

      setItems([
        {
          id: "reading",
          title: "Đọc hôm nay",
          progress: readPercent,
          color: "green",
          displayValue: readDisplay,
        },
        {
          id: "games",
          title: "Trò chơi hoàn thành",
          progress: gamePercent,
          color: "blue",
          displayValue: gameDisplay,
        },
        {
          id: "streak",
          title: "Chuỗi 7 ngày",
          progress: streakPercent,
          color: "purple",
          displayValue: streakDisplay,
        },
      ]);
    };

    fetchAllProgress();
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

            <div className="w-full bg-muted rounded-full h-4 overflow-hidden mb-3">
              <div
                className={`h-full ${colorMap[item.color]} transition-all duration-1000 ease-out`}
                style={{ width: `${item.progress}%` }}
                role="progressbar"
                aria-label={`${item.title}: ${item.progress}%`}
              />
            </div>

            <p className="text-base font-semibold text-foreground">
              {item.displayValue}
            </p>
          </DashboardCard>
        ))}
      </div>
    </DashboardSection>
  );
}