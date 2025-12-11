import { Heart, Trash2, Upload } from "lucide-react";
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
    if (isUpload || !onDelete) return;
    e.preventDefault();
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
      <div className="relative group/upload"> {/* Đặt tên nhóm riêng là /upload */}
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
        <div
          onClick={onClick}
          className="flex-shrink-0 w-40 aspect-[3/4] bg-green-50 border-2 border-dashed border-green-300 rounded-3xl p-6 flex flex-col items-center justify-center text-green-600 hover:bg-green-100 hover:border-green-500 transition-all shadow-sm cursor-pointer"
        >
          {/* Chỉ active khi hover đúng vào thẻ upload này */}
          <div className="bg-white p-3 rounded-full mb-3 shadow-sm group-hover/upload:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-center leading-tight">
            Tải sách lên
          </p>
        </div>
      </div>
    );
  }

  // --- TRƯỜNG HỢP THẺ SÁCH BÌNH THƯỜNG ---
  return (
    <>
      {/* Lớp phủ đóng menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={closeMenu}
          onContextMenu={(e) => { e.preventDefault(); closeMenu(); }}
        />
      )}

      {/* Context Menu */}
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

      {/* THẺ SÁCH CHÍNH */}
      <div
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={cn(
          // 👇 QUAN TRỌNG: Đổi 'group' thành 'group/book' để định danh riêng cho thẻ sách này
          "flex-shrink-0 w-40 cursor-pointer group/book flex flex-col gap-3 transition-opacity select-none relative",
          status === 'pending' ? "opacity-80" : ""
        )}
      >
        {/* Khung Ảnh */}
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-md bg-gray-100 hover:shadow-xl transition-all duration-300 group-hover/book:-translate-y-1">

          {/* Ảnh bìa */}
          <img
            src={coverUrl || "https://placehold.co/400x600?text=No+Image"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/book:scale-105"
          />

          {/* Badge Đang duyệt */}
          {status === 'pending' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <span className="bg-yellow-400 text-yellow-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-yellow-200 animate-pulse">
                Đang duyệt...
              </span>
            </div>
          )}

          {/* Lớp phủ đen mờ khi hover (Chỉ hiện khi hover đúng quyển sách này) */}
          {status !== 'pending' && (
            <div className="absolute inset-0 bg-black/0 group-hover/book:bg-black/10 transition-colors duration-300" />
          )}

          {/* --- NÚT TIM --- */}
          {status !== 'pending' && (
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "absolute top-3 right-3 p-2 rounded-full shadow-sm z-20 transition-all duration-300 hover:scale-110 active:scale-90",

                // 👇 LOGIC QUAN TRỌNG ĐÃ SỬA:
                // Sử dụng 'group-hover/book' thay vì 'group-hover' thường.
                // Điều này đảm bảo nó chỉ nghe lệnh từ thẻ sách (group/book), 
                // bỏ qua lệnh từ hàng sách bên ngoài.
                favorite
                  ? "bg-red-50 text-red-500 opacity-100"
                  : "bg-white/90 text-gray-400 opacity-0 group-hover/book:opacity-100 hover:text-red-500"
              )}
            >
              <Heart
                className={cn("w-5 h-5", favorite && "fill-current")}
              />
            </button>
          )}
        </div>

        {/* Tên sách */}
        <div className="px-1">
          <h3 className="text-base font-bold text-gray-800 leading-tight line-clamp-2 group-hover/book:text-green-700 transition-colors" title={title}>
            {title}
          </h3>
        </div>
      </div>
    </>
  );
}