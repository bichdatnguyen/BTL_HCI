import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { ArrowLeft } from "lucide-react";

// 1. Cập nhật Interface khớp với MongoDB
interface Book {
  _id: string;
  title: string;
  coverUrl: string;
  author: string;
}

export default function CategoryView() {
  const navigate = useNavigate();

  // Lưu ý: Trong App.tsx bạn nên đặt route là path="/category/:categoryName"
  // để lấy được tên tiếng Việt (vd: "Truyện Cổ Tích")
  const { categoryName } = useParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Hàm tự động chọn Icon dựa trên tên thể loại
  const getCategoryIcon = (name: string = "") => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("cổ tích")) return "✨";
    if (lowerName.includes("phiêu lưu")) return "🗺️";
    if (lowerName.includes("khoa học")) return "🔬";
    if (lowerName.includes("kỳ ảo")) return "🪄";
    return "📚";
  };

  const icon = getCategoryIcon(categoryName);

  // 3. Cập nhật Header
  useSetPageHeader({
    title: `${icon} ${categoryName}`,
    subtitle: `Khám phá các cuốn sách thuộc chủ đề ${categoryName}`,
    userName: "T",
    streakCount: parseInt(localStorage.getItem("currentStreak") || "0"),
  });

  // 4. Gọi API lấy sách thật
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // Encode URL để xử lý tiếng Việt (vd: Khoa học -> Khoa%20h%E1%BB%8Dc)
        const encodedCategory = encodeURIComponent(categoryName || "");

        const response = await fetch(`http://localhost:5000/api/books?category=${encodedCategory}`);
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Lỗi tải sách:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchBooks();
    }
  }, [categoryName]);

  return (
    <div className="p-6 md:p-10 animate-fade-in pb-20">

      {/* Nút Quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại</span>
      </button>

      {/* Hiển thị nội dung */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Đang tải sách...</div>
      ) : (
        <>
          {books.length > 0 ? (
            // GRID LAYOUT: Giống hệt ảnh bạn thích (5 cột)
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 justify-items-center">
              {books.map((book) => (
                <div key={book._id} className="w-full flex justify-center">
                  <BookCard
                    id={book._id}
                    title={book.title}
                    coverUrl={book.coverUrl}
                    onClick={() => navigate(`/read/${book._id}`)}
                  // author={book.author} // Bỏ comment nếu muốn hiện tác giả
                  />
                </div>
              ))}
            </div>
          ) : (
            // Giao diện trống
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-medium">Chưa có sách nào trong mục này</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}