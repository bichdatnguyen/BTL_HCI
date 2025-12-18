// ==========================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ==========================================

export type SceneType = 'normal' | 'victory' | 'game_over';

export interface StoryChoice {
  text: string;
  nextSceneId: string;
  isCorrect?: boolean; // True = +10 điểm, False/Undefined = 0 điểm
}

export interface StoryScene {
  id: string;
  title?: string;
  text: string;
  image: string;
  type: SceneType;
  choices: StoryChoice[];
}

export interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  scenes: StoryScene[];
}

// ==========================================
// DỮ LIỆU 3 CÂU CHUYỆN (MỖI TRUYỆN 5 CÂU HỎI)
// ==========================================

export const stories: Story[] = [
  // ------------------------------------------------------------------
  // TRUYỆN 1: GẤU CON TÌM MẸ (Chủ đề: Kỹ năng sinh tồn & Lòng tốt)
  // ------------------------------------------------------------------
  {
    id: "story_bear",
    title: "Gấu Con tìm đường về nhà",
    description: "Giúp Gấu Con vượt qua 5 thử thách trong rừng rậm để tìm lại mẹ.",
    coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    scenes: [
      // CÂU 1
      {
        id: "scene_1",
        title: "Thử thách 1: Nơi trú ẩn",
        type: "normal",
        text: "Cơn bão ập đến, Gấu Con cần tìm chỗ nấp ngay lập tức. Có hai nơi phía trước.",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
        choices: [
          { text: "Chui vào hang đá kiên cố", nextSceneId: "scene_2", isCorrect: true }, // +10
          { text: "Đứng dưới gốc cây to", nextSceneId: "scene_2", isCorrect: false }, // 0 điểm (Nguy hiểm khi sét đánh)
        ],
      },
      // CÂU 2
      {
        id: "scene_2",
        title: "Thử thách 2: Chia sẻ",
        type: "normal",
        text: "Hết bão, Gấu gặp Cáo Nhỏ đang đói lả. Gấu chỉ còn một hũ mật ong nhỏ.",
        image: "https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=800&h=600&fit=crop",
        choices: [
          { text: "Chia cho Cáo một nửa", nextSceneId: "scene_3", isCorrect: true }, // +10
          { text: "Giấu đi ăn một mình", nextSceneId: "scene_3", isCorrect: false }, // 0 điểm
        ],
      },
      // CÂU 3
      {
        id: "scene_3",
        title: "Thử thách 3: Quan sát",
        type: "normal",
        text: "Đến ngã ba đường, Gấu không biết đi hướng nào. Cáo gợi ý nhìn lên trời.",
        image: "https://images.unsplash.com/photo-1500614266162-a0f32b994fed?w=800&h=600&fit=crop",
        choices: [
          { text: "Leo lên cây cao để nhìn hướng khói bếp", nextSceneId: "scene_4", isCorrect: true }, // +10
          { text: "Nhắm mắt đi đại một đường", nextSceneId: "scene_4", isCorrect: false }, // 0 điểm
        ],
      },
      // CÂU 4
      {
        id: "scene_4",
        title: "Thử thách 4: Dũng cảm",
        type: "normal",
        text: "Gấu phải đi qua một cây cầu treo cũ kỹ đung đưa trước gió.",
        image: "https://images.unsplash.com/photo-1596395914104-58c75cb66e16?w=800&h=600&fit=crop",
        choices: [
          { text: "Bám chắc dây và đi chậm rãi", nextSceneId: "scene_5", isCorrect: true }, // +10
          { text: "Vừa chạy vừa nhảy cho nhanh", nextSceneId: "scene_5", isCorrect: false }, // 0 điểm (Nguy hiểm)
        ],
      },
      // CÂU 5
      {
        id: "scene_5",
        title: "Thử thách 5: Âm thanh",
        type: "normal",
        text: "Sắp về đến nhà, Gấu nghe thấy tiếng gầm gừ lạ trong bụi rậm.",
        image: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800&h=600&fit=crop",
        choices: [
          { text: "Hỏi to: 'Ai đó?' rồi lùi lại", nextSceneId: "scene_victory", isCorrect: true }, // +10 (Cẩn thận)
          { text: "Lao thẳng vào bụi rậm kiểm tra", nextSceneId: "scene_victory", isCorrect: false }, // 0 điểm
        ],
      },
      {
        id: "scene_victory",
        title: "Đoàn tụ",
        type: "victory",
        text: "Đó chính là Gấu Mẹ! Gấu Con đã về nhà an toàn. Chúc mừng bạn đã hoàn thành câu chuyện!",
        image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=800&h=600&fit=crop",
        choices: [],
      }
    ]
  },

  // ------------------------------------------------------------------
  // TRUYỆN 2: BÉ ĐI SIÊU THỊ (Chủ đề: Toán học & Lựa chọn lành mạnh)
  // ------------------------------------------------------------------
  {
    id: "story_market",
    title: "Thỏ Trắng đi siêu thị",
    description: "Giúp Thỏ Trắng mua đúng đồ mẹ dặn và học cách chi tiêu hợp lý.",
    coverImage: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=600&fit=crop",
    scenes: [
      // CÂU 1
      {
        id: "scene_1",
        title: "Câu hỏi 1: Rau củ",
        type: "normal",
        text: "Mẹ dặn mua loại củ màu cam giúp sáng mắt. Thỏ nên chọn gì?",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&h=600&fit=crop",
        choices: [
          { text: "Củ Cà rốt", nextSceneId: "scene_2", isCorrect: true },
          { text: "Củ Khoai tây", nextSceneId: "scene_2", isCorrect: false },
        ]
      },
      // CÂU 2
      {
        id: "scene_2",
        title: "Câu hỏi 2: Đồ uống",
        type: "normal",
        text: "Thỏ khát nước quá. Thỏ nên mua loại nước nào tốt cho sức khỏe?",
        image: "https://images.unsplash.com/photo-1543573852-1a71a6ce19bc?w=800&h=600&fit=crop",
        choices: [
          { text: "Nước ép cam tươi", nextSceneId: "scene_3", isCorrect: true },
          { text: "Nước ngọt có gas", nextSceneId: "scene_3", isCorrect: false },
        ]
      },
      // CÂU 3
      {
        id: "scene_3",
        title: "Câu hỏi 3: Cám dỗ",
        type: "normal",
        text: "Đi qua quầy đồ chơi, Thỏ thấy một con robot rất đẹp nhưng đắt tiền. Tiền này để mua thức ăn.",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=600&fit=crop",
        choices: [
          { text: "Đi thẳng, không mua", nextSceneId: "scene_4", isCorrect: true },
          { text: "Lén mua robot", nextSceneId: "scene_4", isCorrect: false },
        ]
      },
      // CÂU 4
      {
        id: "scene_4",
        title: "Câu hỏi 4: Tính tiền",
        type: "normal",
        text: "Tổng hoá đơn hết 40 ngàn. Thỏ đưa cô thu ngân tờ 50 ngàn. Cô phải thối lại bao nhiêu?",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&h=600&fit=crop",
        choices: [
          { text: "10 ngàn đồng", nextSceneId: "scene_5", isCorrect: true },
          { text: "20 ngàn đồng", nextSceneId: "scene_5", isCorrect: false },
        ]
      },
      // CÂU 5
      {
        id: "scene_5",
        title: "Câu hỏi 5: Trung thực",
        type: "normal",
        text: "Cô thu ngân lỡ đưa thừa tiền thối lại cho Thỏ. Thỏ sẽ làm gì?",
        image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop",
        choices: [
          { text: "Trả lại tiền thừa cho cô", nextSceneId: "scene_victory", isCorrect: true },
          { text: "Giữ lại mua kẹo", nextSceneId: "scene_victory", isCorrect: false },
        ]
      },
      {
        id: "scene_victory",
        title: "Về nhà",
        type: "victory",
        text: "Thỏ Trắng đã hoàn thành chuyến đi siêu thị. Mẹ rất tự hào về Thỏ!",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
        choices: []
      }
    ]
  },

  // ------------------------------------------------------------------
  // TRUYỆN 3: PHI HÀNH GIA TÍ HON (Chủ đề: Khoa học & Vũ trụ)
  // ------------------------------------------------------------------
  {
    id: "story_space",
    title: "Phi hành gia Tí Hon",
    description: "Bay vào vũ trụ, khám phá Mặt Trăng và các hành tinh.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    scenes: [
      // CÂU 1
      {
        id: "scene_1",
        title: "Nhiệm vụ 1: Khởi động",
        type: "normal",
        text: "Tàu vũ trụ chuẩn bị cất cánh. Đếm ngược như thế nào là đúng?",
        image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=600&fit=crop",
        choices: [
          { text: "3, 2, 1, Bắt đầu!", nextSceneId: "scene_2", isCorrect: true },
          { text: "1, 2, 3, Bắt đầu!", nextSceneId: "scene_2", isCorrect: false },
        ]
      },
      // CÂU 2
      {
        id: "scene_2",
        title: "Nhiệm vụ 2: Ra khỏi tàu",
        type: "normal",
        text: "Tàu đã bay ra ngoài không gian. Ở đây không có không khí. Bạn cần gì để ra ngoài?",
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=600&fit=crop",
        choices: [
          { text: "Mặc bộ đồ phi hành gia kín", nextSceneId: "scene_3", isCorrect: true },
          { text: "Chỉ cần đeo kính râm", nextSceneId: "scene_3", isCorrect: false },
        ]
      },
      // CÂU 3
      {
        id: "scene_3",
        title: "Nhiệm vụ 3: Mặt Trăng",
        type: "normal",
        text: "Mặt Trăng quay quanh hành tinh nào?",
        image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=800&h=600&fit=crop",
        choices: [
          { text: "Trái Đất", nextSceneId: "scene_4", isCorrect: true },
          { text: "Mặt Trời", nextSceneId: "scene_4", isCorrect: false },
        ]
      },
      // CÂU 4
      {
        id: "scene_4",
        title: "Nhiệm vụ 4: Trọng lực",
        type: "normal",
        text: "Trên Mặt Trăng, trọng lực yếu hơn Trái Đất. Khi nhảy lên, bạn sẽ thế nào?",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
        choices: [
          { text: "Nhảy cao hơn và lơ lửng lâu hơn", nextSceneId: "scene_5", isCorrect: true },
          { text: "Không nhảy lên được", nextSceneId: "scene_5", isCorrect: false },
        ]
      },
      // CÂU 5
      {
        id: "scene_5",
        title: "Nhiệm vụ 5: Trở về",
        type: "normal",
        text: "Nhiên liệu sắp hết, bạn phải điều khiển tàu đi đâu?",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
        choices: [
          { text: "Quay trở về Trái Đất", nextSceneId: "scene_victory", isCorrect: true },
          { text: "Bay tiếp đến Sao Hỏa xa xôi", nextSceneId: "scene_victory", isCorrect: false },
        ]
      },
      {
        id: "scene_victory",
        title: "Hạ cánh an toàn",
        type: "victory",
        text: "Chúc mừng phi hành gia nhí! Bạn đã hoàn thành sứ mệnh thám hiểm vũ trụ.",
        image: "https://images.unsplash.com/photo-1614728963931-111d457e49b3?w=800&h=600&fit=crop",
        choices: []
      }
    ]
  }
];