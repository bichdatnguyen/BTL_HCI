import { Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BookCardProps {
  id: string;
  title: string;
  coverUrl?: string;
  status?: "pending" | "approved";
  isFavorite?: boolean;
  isUpload?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onClick?: () => void;
  onFileUpload?: (file: File) => void;
  onDelete?: (id: string) => void;
}

export function BookCard({
  id,
  title,
  coverUrl,
  status,
  isFavorite = false,
  isUpload = false,
  onFavoriteToggle,
  onClick,
  onFileUpload,
  onDelete,
}: BookCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    onFavoriteToggle?.(id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Chỉ hiện menu nếu KHÔNG phải nút upload và CÓ hàm xóa
    if (isUpload || !onDelete) return;

    e.preventDefault(); // Chặn menu mặc định của trình duyệt
    e.stopPropagation();

    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const closeMenu = () => setShowMenu(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc muốn xóa sách "${title}" không?`)) {
      onDelete?.(id);
    }
    closeMenu();
  };

  // --- TRƯỜNG HỢP NÚT UPLOAD ---
  if (isUpload) {
    return (
      <div className="relative">
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

  // --- TRƯỜNG HỢP THẺ SÁCH HIỂN THỊ ---
  return (
    <>
      {/* Lớp phủ vô hình để đóng menu khi click ra ngoài */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={closeMenu}
          onContextMenu={(e) => { e.preventDefault(); closeMenu(); }}
        />
      )}

      {/* MENU CONTEXT (Hiện khi chuột phải) */}
      {showMenu && (
        <div
          className="fixed z-50 bg-white shadow-xl border border-gray-200 rounded-lg py-1 w-36 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Xóa sách
          </button>
        </div>
      )}

      {/* THẺ SÁCH CHÍNH (Đã gộp lại làm một) */}
      <div
        onClick={onClick}
        onContextMenu={handleContextMenu} // 👉 Sự kiện chuột phải nằm ở đây
        className={cn(
          "flex-shrink-0 w-40 cursor-pointer group flex flex-col gap-3 transition-opacity select-none",
          status === 'pending' ? "opacity-80" : ""
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

          {/* Badge Đang duyệt */}
          {status === 'pending' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="bg-yellow-400 text-yellow-950 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-yellow-200">
                Đang duyệt ⏳
              </span>
            </div>
          )}

          {/* Lớp phủ đen mờ khi hover */}
          {status !== 'pending' && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          )}

          {/* Nút Thả tim */}
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
    </>
  );
}