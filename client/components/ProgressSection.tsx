import { DashboardCard, DashboardSection } from "./DashboardCard";
import { Trophy } from "lucide-react";

interface ProgressItem {
  id: string;
  title: string;
  progress: number;
  color: "green" | "blue" | "purple";
}

const progressItems: ProgressItem[] = [
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
    progress: 5,
    color: "purple",
  },
];

const colorMap = {
  green: "bg-success",
  blue: "bg-accent",
  purple: "bg-primary",
};

export function ProgressSection() {
  return (
    <DashboardSection title="📊 Tiến độ của tôi" className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {progressItems.map((item) => (
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
                className={`h-full ${colorMap[item.color]} transition-all duration-500`}
                style={{ width: `${item.progress}%` }}
                role="progressbar"
                aria-valuenow={item.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.title}: ${item.progress}%`}
              />
            </div>

            <p className="text-base font-semibold text-foreground">
              {item.progress}%
            </p>
          </DashboardCard>
        ))}
      </div>
    </DashboardSection>
  );
}
