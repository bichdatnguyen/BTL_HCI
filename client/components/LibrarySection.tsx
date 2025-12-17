// LibrarySection.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <--- 1. Thêm dòng này
import { DashboardSection } from "./DashboardCard";
import { BookCard } from "./BookCard";

interface Book {
  _id: string;
  title: string;
  coverUrl: string;
  author: string;
}

export function LibrarySection() {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const userId = localStorage.getItem("userId");

  const navigate = useNavigate(); // <--- 2. Khai báo hàm chuyển trang

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/favorites`);

        if (response.ok) {
          const data = await response.json();
          setFavoriteBooks(data);
        }
      } catch (error) {
        console.error("Lỗi tải sách yêu thích:", error);
      }
    };
    fetchFavorites();
  }, [userId]);

  return (
    <DashboardSection title="❤️ Sách yêu thích" className="mb-10">
      {favoriteBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {favoriteBooks.map((book) => (
            <div key={book._id} className="flex justify-center">
              <BookCard
                id={book._id}
                title={book.title}
                coverUrl={book.coverUrl}
                isFavorite={true}

                // <--- 3. SỬA DÒNG NÀY: Chuyển hướng đến trang đọc sách
                onClick={() => navigate(`/read/${book._id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl">
          <p>Bạn chưa có cuốn sách yêu thích nào.</p>
          <p className="text-sm">Hãy thả tim ❤️ vào các cuốn sách bạn thích nhé!</p>
        </div>
      )}
    </DashboardSection>
  );
}