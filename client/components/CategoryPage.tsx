import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { BookCard } from "./BookCard";

interface Book {
  id: string;
  title: string;
  emoji: string;
  isFavorite?: boolean;
}

interface CategoryPageProps {
  categoryId: string;
  categoryTitle: string;
  categoryIcon: string;
  books: Book[];
}

export function CategoryPage({
  categoryId,
  categoryTitle,
  categoryIcon,
  books,
}: CategoryPageProps) {
  useSetPageHeader({
    title: `${categoryIcon} ${categoryTitle}`,
    userName: "T",
    streakCount: 5,
  });

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          to="/library"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to library"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-6">
        {books.map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </div>
    </div>
  );
}
