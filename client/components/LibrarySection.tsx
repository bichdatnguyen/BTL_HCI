import { useEffect, useState } from "react";
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

  // Gọi API lấy sách yêu thích
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      try {
        // Gọi endpoint mới dành cho sách yêu thích
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
                isFavorite={true} // Luôn hiện trái tim đỏ
                onClick={() => console.log(`Đọc sách: ${book._id}`)}
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