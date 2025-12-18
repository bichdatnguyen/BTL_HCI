import { useEffect, useState, useRef } from "react";
import { BookCard } from "./BookCard";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, favRes] = await Promise.all([
          fetch(`http://localhost:5000/api/books?category=${encodeURIComponent(category)}`),
          userId ? fetch(`http://localhost:5000/api/users/${userId}/favorites`) : Promise.resolve(null)
        ]);

        const booksData = await booksRes.json();
        setBooks(booksData);

        if (favRes && favRes.ok) {
          const favData = await favRes.json();
          const favIds = favData.map((book: any) => book._id);
          setFavorites(favIds);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, userId]);

  const handleToggleFavorite = async (bookId: string) => {
    if (!userId) {
      toast.error("Bạn cần đăng nhập để lưu sách yêu thích!");
      return;
    }
    const isCurrentlyFav = favorites.includes(bookId);
    let newFavs;
    if (isCurrentlyFav) {
      newFavs = favorites.filter(id => id !== bookId);
    } else {
      newFavs = [...favorites, bookId];
    }
    setFavorites(newFavs);

    try {
      await fetch("http://localhost:5000/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId }),
      });
    } catch (error) {
      console.error("Lỗi lưu tim:", error);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && books.length === 0) return null;

  return (
    <div className="mb-10 relative group">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          {!loading && (
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {books.length}
            </span>
          )}
        </div>
        <Link to={`/category/${category}`} className="text-sm text-green-600 font-semibold hover:underline flex items-center">
          Xem tất cả ›
        </Link>
      </div>

      <div className="relative px-2">
        {!loading && books.length > 4 && (
          <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* 🔴 THAY ĐỔI QUAN TRỌNG: 
            Sử dụng 'overflow-x-scroll' thay vì 'overflow-x-auto'.
            Điều này ÉP BUỘC thanh cuộn phải hiện ra, kể cả khi sách ít.
        */}
        <div ref={scrollRef} className="flex overflow-x-scroll gap-4 px-2 pb-6 scroll-smooth snap-x snap-mandatory scrollbar-force">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="w-[160px] flex-shrink-0 animate-pulse">
                <div className="bg-gray-200 h-56 rounded-xl mb-2"></div>
              </div>
            ))
          ) : (
            books.map((book) => (
              <div key={book._id} className="w-[160px] flex-shrink-0 snap-start transition-transform hover:-translate-y-1 duration-300">
                <BookCard
                  id={book._id}
                  title={book.title}
                  coverUrl={book.coverUrl}
                  isFavorite={favorites.includes(book._id)}
                  onFavoriteToggle={() => handleToggleFavorite(book._id)}
                  onClick={() => navigate(`/read/${book._id}`)}
                />
              </div>
            ))
          )}
        </div>

        {!loading && books.length > 4 && (
          <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white -mr-2">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}
      </div>

      {/* CSS: Ép màu thanh cuộn thật đậm để bạn nhìn thấy */}
      <style>{`
        .scrollbar-force::-webkit-scrollbar {
          height: 10px;
        }
        
        /* 1. SỬA MÀU NỀN ĐƯỜNG RAY: Chuyển từ #a3a3a3 sang #f1f1f1 (xám rất nhạt) */
        .scrollbar-force::-webkit-scrollbar-track {
          background: #a3a3a3; 
          border-radius: 4px;
        }

        /* 2. THANH KÉO: Giữ màu đậm để nổi bật */
        .scrollbar-force::-webkit-scrollbar-thumb {
          background-color: #a3a3a3; /* Màu xám đậm */
          border-radius: 20px;
          border: 2px solid transparent; 
          background-clip: content-box;
        }

        .scrollbar-force::-webkit-scrollbar-thumb:hover {
          background-color: #737373; /* Đậm hơn khi di chuột vào */
        }
      `}</style>
    </div>
  );
}