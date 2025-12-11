import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BookCardProps {
  id: string;
  title: string;
  coverUrl?: string;
  // author?: string; // (Đã bỏ theo yêu cầu cũ)
  isFavorite?: boolean;
  isUpload?: boolean;

  // 👉 THÊM DÒNG NÀY: Để nhận biết trạng thái sách
  status?: "pending" | "approved";

  onFavoriteToggle?: (id: string) => void;
  // Sửa onClick để nhận file nếu là nút upload (tuỳ chọn) hoặc void
  onClick?: () => void;
  onFileUpload?: (file: File) => void;
}

export function BookCard({
  id,
  title,
  coverUrl,
  status, // 👉 Nhận biến status vào đây
  isFavorite = false,
  isUpload = false,
  onFavoriteToggle,
  onClick,
  onFileUpload,
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
      <div className="relative">
        {/* Input file ẩn để click vào là mở chọn file */}
        {onFileUpload && (
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
          />
        )}
        <button
          onClick={onClick}
          className="flex-shrink-0 w-40 h-64 bg-primary/10 border-2 border-dashed border-primary/30 rounded-3xl p-6 flex flex-col items-center justify-center text-primary hover:bg-primary/20 transition-colors shadow-sm"
        >
          <div className="text-5xl font-light mb-3">+</div>
          <p className="text-lg font-bold text-center leading-tight">
            Tải sách lên
          </p>
        </button>
      </div>
    );
  }

  // Trường hợp là thẻ Sách hiển thị
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-40 cursor-pointer group flex flex-col gap-3 transition-opacity",
        status === 'pending' ? "opacity-80" : "" // Làm mờ nhẹ nếu đang duyệt
      )}
    >
      {/* Khung chứa ảnh bìa */}
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">

        {/* Ảnh bìa sách */}
        <img
          src={coverUrl || "https://placehold.co/400x600?text=No+Image"}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* 👉 LOGIC HIỂN THỊ BADGE ĐANG DUYỆT */}
        {status === 'pending' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-yellow-400 text-yellow-950 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-yellow-200">
              Đang duyệt ⏳
            </span>
          </div>
        )}

        {/* Lớp phủ đen mờ khi hover (Chỉ hiện nếu KHÔNG phải đang duyệt) */}
        {status !== 'pending' && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        )}

        {/* Nút Thả tim (Ẩn khi đang duyệt) */}
        {status !== 'pending' && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20"
            aria-label={`${favorite ? "Remove from" : "Add to"} favorites`}
          >
            <Heart
              className={cn("w-4 h-4", favorite && "fill-current")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Thông tin sách */}
      <div className="text-center px-1">
        <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2" title={title}>
          {title}
        </h3>
      </div>
    </div>
  );
}