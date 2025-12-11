import { useState, useEffect } from "react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { SearchBar } from "./SearchBar";
import { CarouselRow } from "@/components/CarouselRow";
import { BookCategoryRow } from "@/components/BookCategoryRow";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Book {
  _id?: string;
  id: string;
  title: string;
  coverUrl: string;
  author?: string;
  status?: "pending" | "approved";
}

export function LibraryPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState("");

  const [personalBooks, setPersonalBooks] = useState<Book[]>([]);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);

  const userId = localStorage.getItem("userId");
  // Lấy thêm username để gửi cho Admin biết ai upload
  const username = localStorage.getItem("username_login") || "User";

  useSetPageHeader({
    title: "📚 Thư viện",
    subtitle: "Khám phá và đọc những cuốn sách tuyệt vời",
    userName: "T",
    streakCount: parseInt(localStorage.getItem("currentStreak") || "0"),
  });

  // 1. Gọi API lấy sách cá nhân thật
  useEffect(() => {
    const fetchPersonalBooks = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/my-books?userId=${userId}`);
        const data = await response.json();
        // Lọc: Chỉ hiển thị sách đã duyệt (approved) vào list chính
        // (Sách pending ta sẽ xử lý riêng nếu muốn load lại từ DB, 
        // nhưng hiện tại ta dùng state pendingBooks để hiện tạm thời)
        const approvedBooks = data.filter((b: any) => b.status === 'approved' || !b.status);
        setPersonalBooks(approvedBooks);
      } catch (error) {
        console.error("Lỗi lấy sách cá nhân:", error);
      }
    };
    fetchPersonalBooks();
  }, [userId]);

  // 2. SỬA ĐOẠN NÀY: Hàm Upload Thật (Gọi API)
  const handleFileUpload = async (file: File) => {
    if (!userId) {
      toast.error("Bạn cần đăng nhập để tải sách!");
      return;
    }

    const fileName = file.name.replace(/\.pdf$|\.docx?$/i, "");

    try {
      // Gọi API gửi sách lên Server
      const response = await fetch("http://localhost:5000/api/my-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fileName,
          userId: userId,
          uploadedBy: username, // Gửi tên người upload
          // coverUrl: mặc định server sẽ tự điền
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Server trả về cuốn sách mới (có id và status: pending)
        // Ta thêm nó vào danh sách chờ để hiện lên giao diện ngay lập tức
        setPendingBooks((prev) => [data.book, ...prev]);

        toast.success("Tải lên thành công! Sách đang chờ Admin duyệt.");
      } else {
        toast.error("Lỗi khi gửi sách lên server.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối đến server.");
    }
  };

  // Hàm click vào nút Upload
  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/read/${bookId}`);
  };

  return (
    <div className="animate-fade-in p-6 pb-20">
      <SearchBar placeholder="Tìm kiếm sách..." onSearch={setSearchQuery} />

      <CarouselRow
        title="📖 Thư viện cá nhân"
        books={personalBooks}
        pendingBooks={pendingBooks}
        showUploadCard={true}
        onUploadClick={handleUploadClick}
        onBookClick={handleBookClick}
        isFixedWidth={false}
      />

      <div className="mb-4">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          🌟 Khám phá Sách
        </h2>
        <BookCategoryRow title="✨ Truyện Cổ Tích" category="Truyện Cổ Tích" icon="" />
        <BookCategoryRow title="🗺️ Phiêu Lưu" category="Phiêu Lưu" icon="" />
        <BookCategoryRow title="🔬 Khoa Học" category="Khoa học" icon="" />
        <BookCategoryRow title="🪄 Kỳ Ảo" category="Kì ảo" icon="" />
      </div>
    </div>
  );
}