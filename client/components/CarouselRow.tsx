import { Link } from "react-router-dom";
import { BookCard } from "./BookCard";

interface Book {
  id: string; // Trong dự án của bạn là _id, nhưng để tương thích với nhiều nơi ta dùng id chung
  _id?: string; // Hỗ trợ cả _id từ MongoDB
  title: string;
  coverUrl?: string; // Dự án bạn dùng coverUrl
  emoji?: string;    // Builder dùng emoji
  isFavorite?: boolean;
  status?: "pending" | "approved";// Trạng thái chờ duyệt
}

interface CarouselRowProps {
  title: string;
  books: Book[];
  pendingBooks?: Book[]; // Danh sách sách đang chờ duyệt
  showUploadCard?: boolean;
  onUploadClick?: () => void;
  onFileUpload?: (file: File) => void;
  onBookClick?: (bookId: string) => void;
  isFixedWidth?: boolean;
  categoryId?: string;
  onDeleteBook?: (bookId: string) => void;
}

export function CarouselRow({
  title,
  books,
  pendingBooks = [],
  showUploadCard = false,
  onUploadClick,
  onFileUpload,
  onBookClick,
  isFixedWidth = false,
  categoryId,
  onDeleteBook,
}: CarouselRowProps) {
  // Gộp sách pending vào đầu danh sách
  const displayBooks = isFixedWidth ? books.slice(0, 5) : books;
  const hasMoreBooks = isFixedWidth && books.length > 5;
  const allBooks = [...pendingBooks, ...displayBooks];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {hasMoreBooks && categoryId && (
          <Link
            to={`/category/${categoryId}`} // Sửa đường dẫn cho khớp dự án bạn (/category/...)
            className="text-primary font-semibold hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            Xem tất cả <span>›</span>
          </Link>
        )}
      </div>

      {/* Hiển thị dạng lưới (Grid) hoặc trượt ngang (Carousel) */}
      <div className={isFixedWidth ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" : "flex gap-6 overflow-x-auto scrollbar-hide pb-2"}>

        {/* Nút Upload (Chỉ hiện khi có yêu cầu) */}
        {showUploadCard && (
          <div key="upload" className={isFixedWidth ? "" : "flex-shrink-0"}>
            <BookCard
              id="upload"
              title="Tải sách lên"
              // Dùng coverUrl rỗng hoặc emoji cộng để BookCard hiển thị đúng style Upload
              isUpload={true}
              onClick={onUploadClick}
            // Nếu BookCard của bạn chưa hỗ trợ onFileUpload trực tiếp thì sự kiện onClick sẽ mở modal
            />
          </div>
        )}

        {/* Danh sách sách (Bao gồm cả sách đang chờ duyệt) */}
        {allBooks.map((book) => {
          // Xử lý ID: ưu tiên _id của MongoDB, nếu không có thì dùng id
          const realId = book._id || book.id;

          return (
            <div key={realId} className={isFixedWidth ? "" : "flex-shrink-0 w-40"}>
              <BookCard
                id={realId}
                title={book.title}
                coverUrl={book.coverUrl || book.emoji} // Tương thích cả ảnh và emoji

                // Truyền prop để BookCard biết đây là sách đang chờ (để làm mờ hoặc hiện badge)
                // Lưu ý: Bạn cần sửa BookCard để hứng prop 'status' nếu muốn hiển thị chữ "Đang duyệt"

                onClick={() => {
                  // Chỉ cho đọc nếu sách KHÔNG phải đang chờ duyệt
                  if (book.status !== "pending" && onBookClick) {
                    onBookClick(realId);
                  }
                }}
                onDelete={onDeleteBook}
              />
              {/* Hiển thị nhãn "Đang duyệt" bên dưới nếu cần */}
              {book.status === "pending" && (
                <p className="text-xs text-yellow-600 text-center mt-1 font-semibold">Đang chờ duyệt...</p>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}