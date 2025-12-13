// components/CarouselRow.tsx
import { Link } from "react-router-dom";
import { BookCard } from "./BookCard";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Book {
  id: string;
  _id?: string;
  title: string;
  coverUrl?: string;
  emoji?: string;
  isFavorite?: boolean;
  status?: "pending" | "approved";
}

interface CarouselRowProps {
  title: string;
  books: Book[];
  pendingBooks?: Book[];
  showUploadCard?: boolean;
  onUploadClick?: () => void;
  onFileUpload?: (file: File) => void;
  onBookClick?: (bookId: string) => void;
  isFixedWidth?: boolean;
  categoryId?: string;
  onDeleteBook?: (bookId: string) => void;
}

export function CarouselRow({
  title,
  books,
  pendingBooks = [],
  showUploadCard = false,
  onUploadClick,
  onBookClick,
  isFixedWidth = false,
  categoryId,
  onDeleteBook,
}: CarouselRowProps) {
  const displayBooks = isFixedWidth ? books.slice(0, 5) : books;
  const hasMoreBooks = isFixedWidth && books.length > 5;
  const allBooks = [...pendingBooks, ...displayBooks];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hàm cuộn sang trái/phải khi bấm nút mũi tên
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="mb-10 relative group">
      {/* Tiêu đề & Link xem tất cả */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {allBooks.length}
          </span>
        </h2>
        {categoryId && (
          <Link
            to={`/category/${categoryId}`}
            className="text-green-600 text-sm font-semibold hover:underline flex items-center gap-1"
          >
            Xem tất cả
          </Link>
        )}
      </div>

      {/* Container chính */}
      <div className="relative">

        {/* Nút Scroll Trái (Chỉ hiện khi không phải FixedWidth) */}
        {!isFixedWidth && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 -ml-4 hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Danh sách sách (Thanh trượt) */}
        <div
          ref={scrollRef}
          className={
            isFixedWidth
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
              : "flex gap-5 overflow-x-auto pb-6 px-2 scroll-smooth snap-x snap-mandatory scrollbar-thin"
          }
        >
          {/* Nút Upload */}
          {showUploadCard && (
            <div className="flex-shrink-0 snap-start">
              <BookCard
                id="upload"
                title="Tải sách lên"
                isUpload={true}
                onClick={onUploadClick}
              />
            </div>
          )}

          {/* Render sách */}
          {allBooks.map((book) => {
            const realId = book._id || book.id;
            return (
              <div key={realId} className={isFixedWidth ? "" : "flex-shrink-0 w-40 snap-start"}>
                <BookCard
                  id={realId}
                  title={book.title}
                  coverUrl={book.coverUrl || book.emoji}
                  status={book.status}
                  onClick={() => {
                    if (book.status !== "pending" && onBookClick) {
                      onBookClick(realId);
                    }
                  }}
                  onDelete={onDeleteBook}
                />
              </div>
            );
          })}
        </div>

        {/* Nút Scroll Phải */}
        {!isFixedWidth && (
          <button
            onClick={() => scroll("right")}
            // 👇 Đã xóa "opacity-0 group-hover:opacity-100" và thêm "bg-white"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-md border border-gray-100 -mr-5 hover:bg-gray-50 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        )}
      </div>

      {/* CSS Tùy chỉnh thanh cuộn cho đẹp hơn */}
      <style>{`
        /* Tạo thanh cuộn mỏng đẹp */
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px; /* Chiều cao */
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1; /* Màu nền nhẹ cho đường ray */
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #c1c1c1; /* 👇 Đổi màu xám đậm hơn để dễ thấy */
          border-radius: 20px;
          border: 2px solid transparent; /* Tạo khoảng hở cho đẹp */
          background-clip: content-box;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #a8a8a8; /* Đậm hơn nữa khi di chuột vào */
        }
      `}</style>
    </section>
  );
}