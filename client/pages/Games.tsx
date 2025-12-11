import { Link } from "react-router-dom";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { DashboardCard } from "@/components/DashboardCard";
import { GAMES } from "@/data/games";

export default function Games() {
  useSetPageHeader({
    title: "Luyện tập",
    subtitle: "Chọn một trò chơi để bắt đầu học!",
  });

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            to={game.isComingSoon ? "#" : game.path}
            className={
              game.isComingSoon
                ? "pointer-events-none opacity-60"
                : "hover:shadow-lg transition-shadow"
            }
          >
            <DashboardCard className="flex flex-col items-center text-center h-full p-6">
              <div className="text-6xl mb-4">{game.emoji}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {game.name}
              </h3>
              <p className="text-sm text-muted-foreground flex-grow">
                {game.description}
              </p>

              {game.isComingSoon ? (
                <p className="text-xs text-muted-foreground mt-4 italic">
                  Sắp tới...
                </p>
              ) : (
                <div
                  className={`mt-4 inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    game.difficulty === "easy"
                      ? "bg-success text-success-foreground"
                      : game.difficulty === "medium"
                        ? "bg-warning text-warning-foreground"
                        : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {game.difficulty === "easy"
                    ? "Dễ"
                    : game.difficulty === "medium"
                      ? "Trung bình"
                      : "Khó"}
                </div>
              )}
            </DashboardCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
