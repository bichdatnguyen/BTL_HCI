import { useEffect, useState } from "react";
import { DashboardSection } from "./DashboardCard"; // Giữ lại khung section
import { BookCard } from "./BookCard"; // Dùng BookCard mới để hiện ảnh

interface Book {
  _id: string;
  title: string;
  coverUrl: string;
  author: string;
}

export function LibrarySection() {
  const [books, setBooks] = useState<Book[]>([]);
  const userId = localStorage.getItem("userId");

  // Gọi API lấy sách cá nhân để hiện ra trang chủ
  useEffect(() => {
    const fetchBooks = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/my-books?userId=${userId}`);
        const data = await response.json();
        // Chỉ lấy 6 cuốn mới nhất để hiển thị
        setBooks(data.slice(0, 6));
      } catch (error) {
        console.error("Lỗi tải sách:", error);
      }
    };
    fetchBooks();
  }, [userId]);

  return (
    <DashboardSection title="📚 Thư viện của tôi" className="mb-10">
      {books.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {books.map((book) => (
            <div key={book._id} className="flex justify-center">
              <BookCard
                id={book._id}
                title={book.title}
                coverUrl={book.coverUrl}
                // author={book.author} // Bỏ tác giả nếu muốn gọn
                onClick={() => console.log(`Đọc sách: ${book._id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl">
          <p>Bạn chưa có cuốn sách nào.</p>
          <p className="text-sm">Hãy vào Thư viện để thêm sách mới nhé!</p>
        </div>
      )}
    </DashboardSection>
  );
}