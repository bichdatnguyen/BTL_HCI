import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BookCardProps {
  id: string;
  title: string;
  coverUrl?: string; // Chỉ cần ảnh bìa
  // Đã xóa author
  isFavorite?: boolean;
  isUpload?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onClick?: () => void;
}

export function BookCard({
  id,
  title,
  coverUrl,
  // Đã xóa author ở đây
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

  // Trường hợp là nút "Tải sách lên"
  if (isUpload) {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 w-40 h-64 bg-primary/10 border-2 border-dashed border-primary/30 rounded-3xl p-6 flex flex-col items-center justify-center text-primary hover:bg-primary/20 transition-colors shadow-sm"
      >
        <div className="text-5xl font-light mb-3">+</div>
        <p className="text-lg font-bold text-center leading-tight">
          Tải sách lên
        </p>
      </button>
    );
  }

  // Trường hợp là thẻ Sách hiển thị
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-40 cursor-pointer group flex flex-col gap-3"
    >
      {/* Khung chứa ảnh bìa */}
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">

        {/* Ảnh bìa sách */}
        <img
          src={coverUrl || "https://placehold.co/400x600?text=No+Image"}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Lớp phủ đen mờ khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Nút Thả tim */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
          aria-label={`${favorite ? "Remove from" : "Add to"} favorites`}
        >
          <Heart
            className={cn("w-4 h-4", favorite && "fill-current")}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Thông tin sách (Chỉ còn tên sách) */}
      <div className="text-center px-1">
        <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2" title={title}>
          {title}
        </h3>
      </div>
    </div>
  );
}