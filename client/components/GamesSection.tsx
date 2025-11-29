import { DashboardCard, DashboardSection } from "./DashboardCard";
import { Link } from "react-router-dom";
import { NEWEST_GAMES } from "@/data/games";

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
    <DashboardSection title="Trò chơi mới" className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {NEWEST_GAMES.map((game) => (
          <Link key={game.id} to={game.path}>
            <DashboardCard className="h-full hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center p-6">
                <div className="text-6xl mb-4">{game.emoji}</div>
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
            </DashboardCard>
          </Link>
        ))}
      </div>
    </DashboardSection>
  );
}
