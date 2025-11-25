import { Link } from "react-router-dom";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { DashboardCard } from "@/components/DashboardCard";

const games = [
  {
    id: "matching",
    name: "Ghép Từ",
    emoji: "🎯",
    description: "Ghép từ với hình ảnh",
    path: "/games/matching",
  },
  {
    id: "spelling",
    name: "Chính tả",
    emoji: "✏️",
    description: "Học cách viết đúng",
    path: "#",
  },
  {
    id: "story",
    name: "Truyện Tương Tác",
    emoji: "📖",
    description: "Đọc và chọn câu chuyện",
    path: "#",
  },
  {
    id: "word-search",
    name: "Tìm Từ",
    emoji: "🔍",
    description: "Tìm từ ẩn trong lưới",
    path: "/games/word-search",
  },
];

export default function Games() {
  useSetPageHeader({
    title: "🎮 Luyện tập",
    subtitle: "Chọn một trò chơi để bắt đầu học!",
    userName: "T",
    streakCount: 5,
  });

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {games.map((game) => (
          <Link
            key={game.id}
            to={game.path}
            className={game.path === "#" ? "pointer-events-none opacity-60" : ""}
          >
            <DashboardCard className="flex flex-col items-center text-center h-full">
              <div className="text-5xl mb-4">{game.emoji}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {game.name}
              </h3>
              <p className="text-sm text-muted-foreground flex-grow">
                {game.description}
              </p>
              {game.path === "#" && (
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Sắp tới...
                </p>
              )}
            </DashboardCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
