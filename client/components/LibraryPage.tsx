import { useState } from "react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { SearchBar } from "./SearchBar";
import { CarouselRow } from "./CarouselRow";

interface Book {
  id: string;
  title: string;
  emoji: string;
  isFavorite?: boolean;
}

const personalLibraryBooks: Book[] = [
  { id: "pb1", title: "Chú gấu nhỏ", emoji: "🐻", isFavorite: true },
  { id: "pb2", title: "Công chúa và rồng", emoji: "🐉", isFavorite: true },
  { id: "pb3", title: "Nhà phép thuật", emoji: "✨", isFavorite: false },
];

const fairyTaleBooks: Book[] = [
  { id: "ft1", title: "Lọ lem", emoji: "👑" },
  { id: "ft2", title: "Bạch Tuyết", emoji: "��️" },
  { id: "ft3", title: "Quỷ dữ", emoji: "👹" },
  { id: "ft4", title: "Cô bé bán diêm", emoji: "🕯️" },
  { id: "ft5", title: "Kẻ cô độc", emoji: "🎭" },
  { id: "ft6", title: "Hoàng tử ếch", emoji: "🐸" },
];

const adventureBooks: Book[] = [
  { id: "ad1", title: "Phiêu lưu trên biển", emoji: "⛵" },
  { id: "ad2", title: "Hòn đảo kỳ bí", emoji: "🏝️" },
  { id: "ad3", title: "Vượt sa mạc", emoji: "🏜️" },
  { id: "ad4", title: "Leo núi tuyết", emoji: "⛰️" },
  { id: "ad5", title: "Rừng sâu bí ẩn", emoji: "🌲" },
  { id: "ad6", title: "Thành phố dưới nước", emoji: "🌊" },
];

const scienceBooks: Book[] = [
  { id: "sc1", title: "Khám phá vũ trụ", emoji: "🚀" },
  { id: "sc2", title: "Các hành tinh", emoji: "🪐" },
  { id: "sc3", title: "Sinh vật biển", emoji: "🐠" },
  { id: "sc4", title: "Cây cỏ rợp trời", emoji: "🌿" },
  { id: "sc5", title: "Động vật hoang dã", emoji: "🦁" },
  { id: "sc6", title: "Cơ thể con người", emoji: "🧬" },
];

const fantasyBooks: Book[] = [
  { id: "fa1", title: "Vương quốc phép thuật", emoji: "🔮" },
  { id: "fa2", title: "Thế giới yêu tinh", emoji: "🧚" },
  { id: "fa3", title: "Lâu đài bí ẩn", emoji: "🏰" },
  { id: "fa4", title: "Bảo bối thần kỳ", emoji: "💎" },
  { id: "fa5", title: "Chiến binh huyền thoại", emoji: "⚔️" },
  { id: "fa6", title: "Nước Narnia", emoji: "🦁" },
];

export function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  useSetPageHeader({
    title: "📚 Thư viện",
    subtitle: "Khám phá và đọc những cuốn sách tuyệt vời",
    userName: "T",
    streakCount: 5,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Searching for:", query);
  };

  const handleUploadClick = () => {
    console.log("Upload book clicked");
  };

  return (
    <div className="animate-fade-in">
      {/* Search Bar */}
      <SearchBar placeholder="Tìm kiếm sách..." onSearch={handleSearch} />

      {/* Personal Library Section */}
      <CarouselRow
        title="📖 Thư viện cá nhân"
        books={personalLibraryBooks}
        showUploadCard={true}
        onUploadClick={handleUploadClick}
        isFixedWidth={true}
      />

      {/* Discover Books Section */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-foreground mb-10">
          🌟 Khám phá Sách
        </h2>

        {/* Fairy Tales Category */}
        <CarouselRow
          title="✨ Truyện Cổ Tích"
          books={fairyTaleBooks}
          categoryId="fairy-tales"
          isFixedWidth={true}
        />

        {/* Adventure Category */}
        <CarouselRow
          title="🗺️ Phiêu Lưu"
          books={adventureBooks}
          categoryId="adventure"
          isFixedWidth={true}
        />

        {/* Science Category */}
        <CarouselRow
          title="🔬 Khoa Học"
          books={scienceBooks}
          categoryId="science"
          isFixedWidth={true}
        />

        {/* Fantasy Category */}
        <CarouselRow
          title="🪄 Kỳ Ảo"
          books={fantasyBooks}
          categoryId="fantasy"
          isFixedWidth={true}
        />
      </div>
    </div>
  );
}
