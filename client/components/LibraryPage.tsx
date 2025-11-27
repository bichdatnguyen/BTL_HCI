import { useState, useEffect } from "react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { SearchBar } from "./SearchBar"; // Giữ nguyên search bar cũ của bạn
import { BookCard } from "@/components/BookCard";
import { BookCategoryRow } from "@/components/BookCategoryRow"; // Import component hàng sách mới
import { Link, useNavigate } from "react-router-dom";

// Định nghĩa kiểu dữ liệu sách
interface Book {
  _id: string; // MongoDB dùng _id thay vì id
  title: string;
  coverUrl: string;
  author: string;
  userId?: string;
}

export function LibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // State cho sách cá nhân
  const [personalBooks, setPersonalBooks] = useState<Book[]>([]);
  const [loadingPersonal, setLoadingPersonal] = useState(true);

  // Lấy UserID từ localStorage
  const userId = localStorage.getItem("userId");

  useSetPageHeader({
    title: "📚 Thư viện",
    subtitle: "Khám phá và đọc những cuốn sách tuyệt vời",
    userName: "T", // Bạn có thể lấy tên thật từ API profile nếu muốn
    streakCount: parseInt(localStorage.getItem("currentStreak") || "0"),
  });

  // 1. GỌI API LẤY SÁCH CÁ NHÂN
  useEffect(() => {
    const fetchPersonalBooks = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/my-books?userId=${userId}`);
        const data = await response.json();
        setPersonalBooks(data);
      } catch (error) {
        console.error("Lỗi lấy sách cá nhân:", error);
      } finally {
        setLoadingPersonal(false);
      }
    };
    fetchPersonalBooks();
  }, [userId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Logic search có thể mở rộng sau (gọi API search)
  };

  return (
    <div className="animate-fade-in p-6 pb-20">
      {/* Search Bar */}
      <SearchBar placeholder="Tìm kiếm sách..." onSearch={handleSearch} />

      {/* --- PHẦN 1: THƯ VIỆN CÁ NHÂN (Gọi API riêng) --- */}
      <div className="mb-10 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📖</span>
          <h2 className="text-2xl font-bold text-foreground">Thư viện cá nhân</h2>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {/* Nút Tải Sách Lên (Luôn hiện đầu tiên) */}
          <BookCard
            id="upload-btn"
            title="Tải sách"
            isUpload={true}
            onClick={() => console.log("Mở modal upload...")}
          />

          {/* Danh sách sách cá nhân từ API */}
          {personalBooks.map((book) => (
            <div key={book._id}>
              <BookCard
                id={book._id}
                title={book.title}
                coverUrl={book.coverUrl}
                onClick={() => navigate(`/read/${book._id}`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- PHẦN 2: KHÁM PHÁ SÁCH HỆ THỐNG (Dùng Component tái sử dụng) --- */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          🌟 Khám phá Sách
        </h2>

        {/* Gọi Component BookCategoryRow - Nó sẽ tự gọi API bên trong */}

        <BookCategoryRow
          title="✨ Truyện Cổ Tích"
          category="Truyện Cổ Tích"
          icon=""
        />

        <BookCategoryRow
          title="🗺️ Phiêu Lưu"
          category="Phiêu Lưu"
          icon=""
        />

        <BookCategoryRow
          title="🔬 Khoa Học"
          category="Khoa học"
          icon=""
        />

        <BookCategoryRow
          title="🪄 Kỳ Ảo"
          category="Kì ảo"
          icon=""
        />
      </div>
    </div>
  );
}