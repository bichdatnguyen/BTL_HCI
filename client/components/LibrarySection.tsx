import { DashboardCard, DashboardSection } from "./DashboardCard";
import { Heart } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  emoji: string;
  level: "1" | "2" | "3" | "4";
  isFavorite?: boolean;
}

const books: Book[] = [
  {
    id: "book1",
    title: "Chú Gấu Nhỏ",
    author: "Tác giả nước ngoài",
    emoji: "🐻",
    level: "1",
    isFavorite: true,
  },
  {
    id: "book2",
    title: "Phiêu Lưu Trên Biển",
    author: "Tác giả nước ngoài",
    emoji: "⛵",
    level: "2",
  },
  {
    id: "book3",
    title: "Công Chúa Và Rồng",
    author: "Tác giả nước ngoài",
    emoji: "🐉",
    level: "3",
    isFavorite: true,
  },
  {
    id: "book4",
    title: "Nhà Mago Phép Thuật",
    author: "Tác giả nước ngoài",
    emoji: "✨",
    level: "2",
  },
  {
    id: "book5",
    title: "Khám Phá Rừng",
    author: "Tác giả nước ngoài",
    emoji: "🌳",
    level: "1",
  },
  {
    id: "book6",
    title: "Bạn Nhện Bé Nhỏ",
    author: "Tác giả nước ngoài",
    emoji: "🕷️",
    level: "1",
  },
];

export function LibrarySection() {
  return (
    <DashboardSection title="📚 Thư viện đọc" className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        {books.map((book) => (
          <DashboardCard
            key={book.id}
            onClick={() => {
              // Placeholder for book navigation
              console.log(`Reading book: ${book.id}`);
            }}
            className="flex flex-col items-center text-center relative"
          >
            {book.isFavorite && (
              <button
                className="absolute top-3 right-3 text-warning hover:scale-110 transition-transform"
                aria-label={`Remove ${book.title} from favorites`}
              >
                <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
              </button>
            )}

            <div className="text-4xl mb-3">{book.emoji}</div>
            <h3 className="text-base font-bold text-foreground mb-1">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">{book.author}</p>
            <div className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              Cấp độ {book.level}
            </div>
          </DashboardCard>
        ))}
      </div>
    </DashboardSection>
  );
}
