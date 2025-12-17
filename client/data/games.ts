// client/src/data/games.ts
export interface Game {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  path: string;
  isComingSoon?: boolean;
}

export const GAMES: Game[] = [
  {
    id: "matching",
    name: "Ghép Từ",
    emoji: "🎯",
    description: "Ghép từ với hình ảnh",
    difficulty: "easy",
    path: "/games/matching",
  },
  {
    id: "spelling",
    name: "Chính tả",
    emoji: "✏️",
    description: "Học cách viết đúng",
    difficulty: "medium",
    path: "#",
    isComingSoon: true,
  },
  {
    id: "story",
    name: "Truyện Tương Tác",
    emoji: "📖",
    description: "Đọc và chọn câu chuyện",
    difficulty: "easy",
    path: "/games/story",
    isComingSoon: false,
  },
  {
    id: "word-search",
    name: "Tìm Từ",
    emoji: "🔍",
    description: "Tìm từ ẩn trong lưới",
    difficulty: "medium",
    path: "/games/word-search",
  },
  {
    id: "pronunciation",
    name: "Phát Âm",
    emoji: "🎤",
    description: "Luyện nói chuẩn từng từ",
    difficulty: "medium",
    path: "/games/pronunciation",
  },
];

// 4 game mới nhất (thêm game mới vào cuối → tự lên đầu trang chủ)
export const NEWEST_GAMES = [...GAMES].reverse().slice(0, 4);
