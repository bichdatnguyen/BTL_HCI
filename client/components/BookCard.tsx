import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BookCardProps {
  id: string;
  title: string;
  emoji: string;
  isFavorite?: boolean;
  isUpload?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onClick?: () => void;
}

export function BookCard({
  id,
  title,
  emoji,
  isFavorite = false,
  isUpload = false,
  onFavoriteToggle,
  onClick,
}: BookCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    onFavoriteToggle?.(id);
  };

  if (isUpload) {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 w-40 h-56 bg-primary rounded-3xl p-6 flex flex-col items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
      >
        <div className="text-5xl font-bold mb-3">+</div>
        <p className="text-lg font-bold text-center leading-tight">
          Tải sách lên
        </p>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-40 cursor-pointer group"
    >
      <div className="relative bg-card rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow h-56 flex items-center justify-center mb-4">
        <div className="text-6xl">{emoji}</div>
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 text-warning hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
          aria-label={`${favorite ? "Remove from" : "Add to"} favorites`}
        >
          <Heart
            className={cn("w-5 h-5", favorite && "fill-current")}
            aria-hidden="true"
          />
        </button>
      </div>
      <h3 className="text-base font-bold text-foreground text-center leading-tight line-clamp-2">
        {title}
      </h3>
    </div>
  );
}
