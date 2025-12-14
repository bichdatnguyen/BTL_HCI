import { useEffect, useState, useRef } from "react";
import { BookCard } from "./BookCard";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner"; // Nhớ cài thư viện sonner hoặc dùng alert thay thế

interface Book {
  _id: string; // Lưu ý: Backend trả về _id
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
  const [favorites, setFavorites] = useState<string[]>([]); // Lưu danh sách ID sách đã thích
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Tải sách và Danh sách yêu thích cùng lúc
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

          // ===> ĐOẠN QUAN TRỌNG CẦN SỬA Ở ĐÂY <===
          // Vì API giờ trả về mảng Object (Full thông tin), 
          // ta cần dùng .map() để lọc lấy riêng mảng ID ra thôi.
          const favIds = favData.map((book: any) => book._id);

          setFavorites(favIds); // Lưu mảng ID: ["abc...", "xyz..."]
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, userId]);

  // 2. Hàm xử lý khi bấm vào trái tim
  const handleToggleFavorite = async (bookId: string) => {
    if (!userId) {
      toast.error("Bạn cần đăng nhập để lưu sách yêu thích!");
      return;
    }

    // Cập nhật giao diện NGAY LẬP TỨC (Optimistic UI) để cảm giác nhanh hơn
    const isCurrentlyFav = favorites.includes(bookId);
    let newFavs;
    if (isCurrentlyFav) {
      newFavs = favorites.filter(id => id !== bookId); // Bỏ tim
    } else {
      newFavs = [...favorites, bookId]; // Thêm tim
    }
    setFavorites(newFavs);

    // Gọi API để lưu xuống server
    try {
      await fetch("http://localhost:5000/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId }),
      });
      // Nếu API lỗi thì có thể revert lại state ở đây nếu muốn chặt chẽ
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

        <div ref={scrollRef} className="flex overflow-x-auto gap-4 px-2 pb-6 scroll-smooth snap-x snap-mandatory scrollbar-thin">
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
                  // QUAN TRỌNG: Kiểm tra xem ID sách này có trong danh sách favorites không
                  isFavorite={favorites.includes(book._id)}

                  // Truyền hàm xử lý vào
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

      {/* Giữ nguyên phần style scrollbar cũ của bạn ở đây */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #d1d5db; }
      `}</style>
    </div>
  );
}