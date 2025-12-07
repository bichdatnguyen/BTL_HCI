export interface WordSearchWord {
  id: string;
  text: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
}

export const WORD_SEARCH_WORDS: WordSearchWord[] = [
  // EASY - từ ngắn (2-3 chữ)
  { id: "tao", text: "TÁO", hint: "Trái cây đỏ", difficulty: "easy" },
  { id: "dao", text: "ĐÀO", hint: "Trái có lông mềm", difficulty: "easy" },
  { id: "nho", text: "NHO", hint: "Trái mọng nhỏ", difficulty: "easy" },
  { id: "meo", text: "MÈO", hint: "Thú nuôi kêu meo meo", difficulty: "easy" },
  { id: "chao", text: "CHÁO", hint: "Món ăn mềm", difficulty: "easy" },
  { id: "dua", text: "DỪA", hint: "Nước ngọt, vỏ cứng", difficulty: "easy" },
  { id: "neo", text: "NẸO", hint: "Vết thâm nhỏ", difficulty: "easy" },
  { id: "keo", text: "KẸO", hint: "Đồ ngọt", difficulty: "easy" },
  { id: "but", text: "BÚT", hint: "Dụng cụ viết", difficulty: "easy" },
  { id: "muoi", text: "MUỐI", hint: "Gia vị mặn", difficulty: "easy" },

  // MEDIUM - từ trung bình (4-5 chữ)
  { id: "chuoi", text: "CHUỐI", hint: "Trái vàng cong", difficulty: "medium" },
  { id: "xoai", text: "XOÀI", hint: "Trái nhiệt đới", difficulty: "medium" },
  { id: "muong", text: "MUỖNG", hint: "Dụng cụ ăn", difficulty: "medium" },
  {
    id: "banh",
    text: "BÁNH",
    hint: "Đồ ăn ngọt hoặc mặn",
    difficulty: "medium",
  },
  { id: "vang", text: "VÀNG", hint: "Kim loại quý", difficulty: "medium" },
  {
    id: "maydo",
    text: "MÁYĐO",
    hint: "Thiết bị đo lường",
    difficulty: "medium",
  },
  {
    id: "denpin",
    text: "ĐÈNPIN",
    hint: "Dụng cụ chiếu sáng",
    difficulty: "medium",
  },
  {
    id: "thuoc",
    text: "THUỐC",
    hint: "Dùng để chữa bệnh",
    difficulty: "medium",
  },
  { id: "giay", text: "GIẤY", hint: "Dùng để viết", difficulty: "medium" },
  { id: "khanh", text: "KHÁNH", hint: "Tên người Việt", difficulty: "medium" },

  // HARD - từ dài (6+ chữ)
  { id: "caigoi", text: "CÁI GỐI", hint: "Dùng để kê đầu", difficulty: "hard" },
  {
    id: "maylanh",
    text: "MÁY LẠNH",
    hint: "Làm mát phòng",
    difficulty: "hard",
  },
  {
    id: "tulanh",
    text: "TỦ LẠNH",
    hint: "Bảo quản thức ăn",
    difficulty: "hard",
  },
  {
    id: "denlong",
    text: "ĐÈN LỒNG",
    hint: "Trang trí lễ hội",
    difficulty: "hard",
  },
  { id: "thiago", text: "THÌA GỖ", hint: "Dụng cụ nấu ăn", difficulty: "hard" },
  {
    id: "banphim",
    text: "BÀN PHÍM",
    hint: "Dùng với máy tính",
    difficulty: "hard",
  },
  {
    id: "thuocla",
    text: "THUỐC LÁ",
    hint: "Thứ gây nghiện",
    difficulty: "hard",
  },
  {
    id: "cua kinh",
    text: "CỬA KÍNH",
    hint: "Trong suốt, mở ra vào",
    difficulty: "hard",
  },
  {
    id: "nongson",
    text: "NÓNG SƠN",
    hint: "Cảm giác khi chạm vật nóng",
    difficulty: "hard",
  },
  {
    id: "banhmi",
    text: "BÁNH MÌ",
    hint: "Món ăn nổi tiếng Việt Nam",
    difficulty: "hard",
  },
];
