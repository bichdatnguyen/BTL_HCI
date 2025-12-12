import { useState, useEffect } from "react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { SearchBar } from "./SearchBar";
import { CarouselRow } from "@/components/CarouselRow";
import { BookCategoryRow } from "@/components/BookCategoryRow";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookCard } from "./BookCard";
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
  const [systemBooks, setSystemBooks] = useState<Book[]>([]);     // Sách hệ thống (MỚI)
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const userId = localStorage.getItem("userId");
  // Lấy thêm username để gửi cho Admin biết ai upload
  const username = localStorage.getItem("username_login") || "User";
  const allBooks = [...personalBooks, ...systemBooks];
  // 1. Hàm gọi API Xóa
  const handleDeleteBook = async (bookId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/my-books/${bookId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // Gửi userId để xác thực
      });

      if (response.ok) {
        // Cập nhật giao diện: Loại bỏ sách vừa xóa khỏi danh sách
        setPersonalBooks((prev) => prev.filter((b) => b.id !== bookId && b._id !== bookId));
        toast.success("Đã xóa sách khỏi thư viện.");
      } else {
        toast.error("Lỗi khi xóa sách.");
      }
    } catch (error) {
      console.error("Lỗi xóa:", error);
      toast.error("Không thể kết nối server.");
    }
  };

  useSetPageHeader({
    title: "📚 Thư viện",
    subtitle: "Khám phá và đọc những cuốn sách tuyệt vời",
    userName: "T",
    streakCount: parseInt(localStorage.getItem("currentStreak") || "0"),
  });

  // 1. Gọi API lấy sách cá nhân thật
  // 1. Gọi API lấy sách cá nhân thật (Cả approved và pending)
  useEffect(() => {
    const fetchPersonalBooks = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/my-books?userId=${userId}`);
        const data = await response.json();

        // 👉 THÊM DÒNG NÀY ĐỂ KIỂM TRA DỮ LIỆU (F12 -> Console)
        console.log("Sách lấy về từ server:", data);

        // 👉 SỬA BỘ LỌC: Chấp nhận sách "approved" HOẶC sách không có status (sách cũ)
        const approved = data.filter((b: any) => b.status === 'approved' || !b.status);
        setPersonalBooks(approved);

        const pending = data.filter((b: any) => b.status === 'pending');
        setPendingBooks(pending);

      } catch (error) {
        console.error("Lỗi lấy sách cá nhân:", error);
      }
    };
    fetchPersonalBooks();
  }, [userId]);

  useEffect(() => {
    const fetchSystemBooks = async () => {
      try {
        // Gọi API lấy toàn bộ sách hệ thống (không lọc category)
        const response = await fetch("http://localhost:5000/api/books");
        const data = await response.json();
        setSystemBooks(data);
      } catch (error) {
        console.error("Lỗi lấy sách hệ thống:", error);
      }
    };
    fetchSystemBooks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks([]);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const results = allBooks.filter((book) =>
        book.title.toLowerCase().includes(query) ||
        (book.author && book.author.toLowerCase().includes(query))
      );
      setFilteredBooks(results);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // 2. SỬA ĐOẠN NÀY: Hàm Upload Thật (Gọi API)
  const handleFileUpload = async (file: File) => {
    if (!userId) return;

    // Tạo FormData để đóng gói file và dữ liệu
    const formData = new FormData();
    // Tên file bỏ đuôi mở rộng để làm tiêu đề
    const fileName = file.name.replace(/\.txt$|\.pdf$|\.docx?$/i, "");

    formData.append("file", file); // 'file' phải khớp với upload.single('file') ở Backend
    formData.append("title", fileName);
    formData.append("userId", userId);
    formData.append("uploadedBy", username);

    try {
      // Gửi FormData lên Server
      // LƯU Ý: Khi gửi FormData, KHÔNG cần header 'Content-Type': 'application/json'
      const response = await fetch("http://localhost:5000/api/my-books", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Cập nhật giao diện ngay lập tức
        setPendingBooks((prev) => [data.book, ...prev]);
        toast.success("Tải lên và xử lý sách thành công!");
      } else {
        const errorData = await response.json();
        toast.error("Lỗi: " + errorData.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi upload.");
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

  const isSearching = searchQuery.trim() !== "";

  return (
    <div className="animate-fade-in p-6 pb-20">
      <SearchBar placeholder="Tìm kiếm sách..." onSearch={setSearchQuery} />
      {isSearching ? (
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-foreground mb-10">
            🔍 Kết quả tìm kiếm
          </h2>

          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  coverUrl={book.coverUrl}
                  onClick={() => handleBookClick(book.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Không tìm thấy sách nào
              </p>
            </div>
          )}
        </div>
      ) : (
        <>

          <CarouselRow
            title="📖 Thư viện cá nhân"
            books={personalBooks}
            pendingBooks={pendingBooks}
            showUploadCard={true}
            onUploadClick={handleUploadClick}
            onBookClick={handleBookClick}
            onDeleteBook={handleDeleteBook}
            isFixedWidth={false}
          />

          <div className="mb-4">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              🌟 Khám phá Sách
            </h2>
            <BookCategoryRow title="✨ Truyện Cổ Tích" category="Cổ tích" icon="" />
            <BookCategoryRow title="🪄Truyền Thuyết" category="Truyền thuyết" icon="" />
            {/* // <BookCategoryRow title="🔬 Khoa Học" category="Khoa học" icon="" /> */}
            <BookCategoryRow title="🗺️ Truyện thiếu nhi" category="Truyện thiếu nhi" icon="" />
          </div>
        </>
      )}
    </div>
  );
}