// components/BookCategoryRow.tsx
import { useEffect, useState } from "react";
import { BookCard } from "./BookCard"; // Import thẻ sách có sẵn của bạn
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
interface Book {
  _id: string;
  title: string;
  coverUrl: string;
  author: string;
}

interface BookCategoryRowProps {
  title: string;    // Tên hiển thị (VD: "Truyện Cổ Tích")
  category: string; // Tên trong Database để lọc (VD: "Truyện Cổ Tích")
  icon?: React.ReactNode; // Icon đầu dòng (nếu có)
}

export function BookCategoryRow({ title, category, icon }: BookCategoryRowProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Gọi API lọc theo category
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

  // Nếu đang tải hoặc không có sách thì không hiện gì (hoặc hiện loading)
  if (!loading && books.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Tiêu đề Hàng + Nút Xem tất cả */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <Link
          to={`/category/${category}`}
          className="text-sm text-green-600 font-semibold hover:underline"
        >
          Xem tất cả ›
        </Link>
      </div>

      {/* Danh sách sách (Scroll ngang) */}
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          books.map((book) => (
            <div key={book._id} className="w-[160px] flex-shrink-0">
              <BookCard
                id={book._id}
                title={book.title}
                coverUrl={book.coverUrl}
                onClick={() => navigate(`/read/${book._id}`)}
              // Thêm các props khác nếu BookCard của bạn yêu cầu
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}