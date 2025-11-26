import { useParams } from "react-router-dom";
import { CategoryPage } from "@/components/CategoryPage";

interface Book {
  id: string;
  title: string;
  emoji: string;
  isFavorite?: boolean;
}

const categoryData: Record<
  string,
  { title: string; icon: string; books: Book[] }
> = {
  "fairy-tales": {
    title: "Truyện Cổ Tích",
    icon: "✨",
    books: [
      { id: "ft1", title: "Lọ lem", emoji: "👑" },
      { id: "ft2", title: "Bạch Tuyết", emoji: "❄️" },
      { id: "ft3", title: "Quỷ dữ", emoji: "👹" },
      { id: "ft4", title: "Cô bé bán diêm", emoji: "🕯️" },
      { id: "ft5", title: "Kẻ cô độc", emoji: "🎭" },
      { id: "ft6", title: "Hoàng tử ếch", emoji: "��" },
      { id: "ft7", title: "Công chúa và cái kén", emoji: "🌹" },
      { id: "ft8", title: "Aladdin", emoji: "🧞" },
      { id: "ft9", title: "Rapunzel", emoji: "✂️" },
      { id: "ft10", title: "Bông tuyết", emoji: "☃️" },
    ],
  },
  adventure: {
    title: "Phiêu Lưu",
    icon: "🗺️",
    books: [
      { id: "ad1", title: "Phiêu lưu trên biển", emoji: "⛵" },
      { id: "ad2", title: "Hòn đảo kỳ bí", emoji: "🏝️" },
      { id: "ad3", title: "Vượt sa mạc", emoji: "🏜️" },
      { id: "ad4", title: "Leo núi tuyết", emoji: "⛰️" },
      { id: "ad5", title: "Rừng sâu bí ẩn", emoji: "🌲" },
      { id: "ad6", title: "Thành phố dưới nước", emoji: "🌊" },
      { id: "ad7", title: "Kho báu ẩn giấu", emoji: "💎" },
      { id: "ad8", title: "Hang động bí mật", emoji: "🕳️" },
      { id: "ad9", title: "Cuộc phiêu lưu Tây Bộ", emoji: "🤠" },
      { id: "ad10", title: "Người đầu tiên lên núi", emoji: "🧗" },
    ],
  },
  science: {
    title: "Khoa Học",
    icon: "🔬",
    books: [
      { id: "sc1", title: "Khám phá vũ trụ", emoji: "🚀" },
      { id: "sc2", title: "Các hành tinh", emoji: "🪐" },
      { id: "sc3", title: "Sinh vật biển", emoji: "🐠" },
      { id: "sc4", title: "Cây cỏ rợp trời", emoji: "🌿" },
      { id: "sc5", title: "Động vật hoang dã", emoji: "🦁" },
      { id: "sc6", title: "Cơ thể con người", emoji: "🧬" },
      { id: "sc7", title: "Khoa học về thời tiết", emoji: "🌤️" },
      { id: "sc8", title: "Cuộc sống dưới nước", emoji: "🐙" },
      { id: "sc9", title: "Khoa học của ánh sáng", emoji: "💡" },
      { id: "sc10", title: "Công nghệ thế giới", emoji: "⚙️" },
    ],
  },
  fantasy: {
    title: "Kỳ Ảo",
    icon: "🪄",
    books: [
      { id: "fa1", title: "Vương quốc phép thuật", emoji: "🔮" },
      { id: "fa2", title: "Thế giới yêu tinh", emoji: "🧚" },
      { id: "fa3", title: "Lâu đài bí ẩn", emoji: "🏰" },
      { id: "fa4", title: "Bảo bối thần kỳ", emoji: "💎" },
      { id: "fa5", title: "Chiến binh huyền thoại", emoji: "⚔️" },
      { id: "fa6", title: "Nước Narnia", emoji: "🦁" },
      { id: "fa7", title: "Thế giới ma thuật", emoji: "✨" },
      { id: "fa8", title: "Rồng thiêng liêng", emoji: "🐉" },
      { id: "fa9", title: "Thánh Graal", emoji: "🏆" },
      { id: "fa10", title: "Biệt đội siêu anh hùng", emoji: "🦸" },
    ],
  },
};

export default function CategoryView() {
  const { categoryId } = useParams<{ categoryId: string }>();

  if (!categoryId || !categoryData[categoryId]) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const { title, icon, books } = categoryData[categoryId];

  return (
    <CategoryPage
      categoryId={categoryId}
      categoryTitle={title}
      categoryIcon={icon}
      books={books}
    />
  );
}
