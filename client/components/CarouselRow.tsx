import { Link } from "react-router-dom";
import { BookCard } from "./BookCard";

interface Book {
  id: string;
  title: string;
  emoji: string;
  isFavorite?: boolean;
}

interface CarouselRowProps {
  title: string;
  books: Book[];
  showUploadCard?: boolean;
  onUploadClick?: () => void;
  isFixedWidth?: boolean;
  categoryId?: string;
}

export function CarouselRow({
  title,
  books,
  showUploadCard = false,
  onUploadClick,
  isFixedWidth = false,
  categoryId,
}: CarouselRowProps) {
  // Show only 4-5 books when in fixed width mode (library page)
  const displayBooks = isFixedWidth ? books.slice(0, 5) : books;
  const hasMoreBooks = isFixedWidth && books.length > 5;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {hasMoreBooks && categoryId && (
          <Link
            to={`/library/category/${categoryId}`}
            className="text-primary font-semibold hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            Xem tất cả <span>›</span>
          </Link>
        )}
      </div>

      {/* Fixed-width grid or scrollable carousel */}
      {isFixedWidth ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {/* Upload card - only in personal library */}
          {showUploadCard && (
            <div key="upload">
              <BookCard
                id="upload"
                title="Tải sách lên"
                emoji="+"
                isUpload={true}
                onClick={onUploadClick}
              />
            </div>
          )}

          {/* Book cards */}
          {displayBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {/* Upload card - only in personal library */}
          {showUploadCard && (
            <div key="upload" className="flex-shrink-0">
              <BookCard
                id="upload"
                title="Tải sách lên"
                emoji="+"
                isUpload={true}
                onClick={onUploadClick}
              />
            </div>
          )}

          {/* Book cards */}
          {displayBooks.map((book) => (
            <div key={book.id} className="flex-shrink-0 w-40">
              <BookCard {...book} />
            </div>
          ))}
        </div>
      )}

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
