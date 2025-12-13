// components/BookCategoryRow.tsx
import { useEffect, useState, useRef } from "react";
import { BookCard } from "./BookCard";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icon mũi tên

interface Book {
  _id: string;
  title: string;
  coverUrl: string;
  author: string;
}

interface BookCategoryRowProps {
  title: string;
  category: string;
  icon?: React.ReactNode;
}

export function BookCategoryRow({ title, category, icon }: BookCategoryRowProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Tạo Ref để điều khiển thanh cuộn
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. Hàm xử lý khi bấm nút mũi tên
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -400 : 400; // Khoảng cách trượt
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/books?category=${encodeURIComponent(category)}`);
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Lỗi tải sách:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [category]);

  if (!loading && books.length === 0) return null;

  return (
    <div className="mb-10 relative group">
      {/* Tiêu đề & Xem tất cả */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          {/* Badge số lượng sách */}
          {!loading && (
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {books.length}
            </span>
          )}
        </div>
        <Link
          to={`/category/${category}`}
          className="text-sm text-green-600 font-semibold hover:underline flex items-center"
        >
          Xem tất cả ›
        </Link>
      </div>

      {/* Container chứa sách và nút điều hướng */}
      <div className="relative px-2">

        {/* 3. Nút Mũi Tên Trái (Chỉ hiện khi hover vào vùng sách) */}
        {!loading && books.length > 4 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white -ml-2"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* 4. Danh sách sách (Đã thay scrollbar-hide bằng style tùy chỉnh) */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 px-2 pb-6 scroll-smooth snap-x snap-mandatory scrollbar-thin"
        >
          {loading ? (
            // Skeleton Loading (Hiệu ứng khi đang tải)
            [...Array(5)].map((_, i) => (
              <div key={i} className="w-[160px] flex-shrink-0 animate-pulse">
                <div className="bg-gray-200 h-56 rounded-xl mb-2"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
              </div>
            ))
          ) : (
            books.map((book) => (
              <div key={book._id} className="w-[160px] flex-shrink-0 snap-start transition-transform hover:-translate-y-1 duration-300">
                <BookCard
                  id={book._id}
                  title={book.title}
                  coverUrl={book.coverUrl}
                  onClick={() => navigate(`/read/${book._id}`)}
                />
              </div>
            ))
          )}
        </div>

        {/* 5. Nút Mũi Tên Phải */}
        {!loading && books.length > 4 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white -mr-2"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}
      </div>

      {/* 6. CSS Tùy chỉnh thanh cuộn */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </div>
  );
}