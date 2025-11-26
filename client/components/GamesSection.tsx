import { DashboardCard, DashboardSection } from "./DashboardCard";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

interface Game {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

const games: Game[] = [
  {
    id: "matching",
    name: "Ghép Từ",
    emoji: "🎯",
    description: "Ghép từ với hình ảnh",
    difficulty: "easy",
  },
  {
    id: "spelling",
    name: "Chính tả",
    emoji: "✏️",
    description: "Học cách viết đúng",
    difficulty: "medium",
  },
  {
    id: "story",
    name: "Truyện Tương Tác",
    emoji: "📖",
    description: "Đọc và chọn câu chuyện",
    difficulty: "easy",
  },
  {
    id: "word-search",
    name: "Tìm Từ",
    emoji: "🔍",
    description: "Tìm từ ẩn trong lưới",
    difficulty: "medium",
  },
];

const difficultyLabels = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const difficultyColors = {
  easy: "bg-success text-success-foreground",
  medium: "bg-warning text-warning-foreground",
  hard: "bg-destructive text-destructive-foreground",
};

export function GamesSection() {
  return (
    <DashboardSection title="🎮 Trò chơi mới" className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {games.map((game) => {
          let gameUrl: string | null = null;
          if (game.id === "matching") {
            gameUrl = "/games/matching";
          } else if (game.id === "word-search") {
            gameUrl = "/games/word-search";
          }

          const content = (
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl mb-4">{game.emoji}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {game.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                {game.description}
              </p>
              <div
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  difficultyColors[game.difficulty]
                }`}
              >
                {difficultyLabels[game.difficulty]}
              </div>
            </div>
          );

          return gameUrl ? (
            <Link key={game.id} to={gameUrl}>
              <DashboardCard className="h-full">{content}</DashboardCard>
            </Link>
          ) : (
            <DashboardCard key={game.id} className="h-full">
              {content}
            </DashboardCard>
          );
        })}
      </div>
    </DashboardSection>
  );
}
