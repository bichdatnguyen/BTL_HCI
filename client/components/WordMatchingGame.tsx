import { useState, useEffect } from "react";
import { Check, RotateCcw, Home, PlayCircle } from "lucide-react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { useNavigate } from "react-router-dom";

interface GameRound {
  id: string;
  imageEmoji: string;
  imageName: string;
  correctWord: string;
  options: string[];
}

// DANH SÁCH GAME GỐC
const ALL_GAMES: GameRound[] = [
  { id: "apple", imageEmoji: "🍎", imageName: "Quả táo", correctWord: "Táo", options: ["Táo", "Chuối", "Xe hơi"] },
  { id: "banana", imageEmoji: "🍌", imageName: "Quả chuối", correctWord: "Chuối", options: ["Quả lê", "Chuối", "Mèo"] },
  { id: "car", imageEmoji: "🚗", imageName: "Chiếc xe hơi", correctWord: "Xe hơi", options: ["Xe đạp", "Tàu hỏa", "Xe hơi"] },
  { id: "cat", imageEmoji: "🐱", imageName: "Con mèo", correctWord: "Mèo", options: ["Chó", "Mèo", "Cá"] },
  { id: "dog", imageEmoji: "🐶", imageName: "Con chó", correctWord: "Chó", options: ["Cá", "Gà", "Chó"] },
  { id: "train", imageEmoji: "🚆", imageName: "Tàu hỏa", correctWord: "Tàu hỏa", options: ["Máy bay", "Tàu hỏa", "Xe đạp"] },
  { id: "plane", imageEmoji: "✈️", imageName: "Máy bay", correctWord: "Máy bay", options: ["Tàu hỏa", "Xe hơi", "Máy bay"] },
  { id: "pizza", imageEmoji: "🍕", imageName: "Pizza", correctWord: "Pizza", options: ["Hamburger", "Pizza", "Bánh mì"] },
  { id: "burger", imageEmoji: "🍔", imageName: "Hamburger", correctWord: "Hamburger", options: ["Cơm", "Hamburger", "Phở"] },
  { id: "book", imageEmoji: "📚", imageName: "Quyển sách", correctWord: "Sách", options: ["Sách", "Bút", "Bảng"] },
  { id: "pencil", imageEmoji: "✏️", imageName: "Bút chì", correctWord: "Bút chì", options: ["Thước", "Bút chì", "Cục tẩy"] },
  { id: "house", imageEmoji: "🏠", imageName: "Ngôi nhà", correctWord: "Nhà", options: ["Nhà", "Cây", "Xe"] },
  { id: "tree", imageEmoji: "🌳", imageName: "Cái cây", correctWord: "Cây", options: ["Cây", "Hoa", "Cỏ"] },
  { id: "flower", imageEmoji: "🌸", imageName: "Bông hoa", correctWord: "Hoa", options: ["Lá", "Hoa", "Gốc"] },
  { id: "fish", imageEmoji: "🐟", imageName: "Con cá", correctWord: "Cá", options: ["Mèo", "Cá", "Chim"] },
];

interface GameState {
  currentRound: number;
  selectedWord: string | null;
  feedback: "correct" | "incorrect" | null;
  score: number;
}

export function WordMatchingGame() {
  const currentStreak = parseInt(localStorage.getItem("currentStreak") || "0");
  const userName = localStorage.getItem("userName") || "Bạn nhỏ";
  const userAvatar = localStorage.getItem("userAvatar") || "";
  const navigate = useNavigate();
  useSetPageHeader({
    title: "🎯 Ghép Từ",
    subtitle: "Ghép từ với hình ảnh để học tập",
    userName: userName,
    userAvatar: userAvatar,
    streakCount: currentStreak,
  });

  const [selectedRounds, setSelectedRounds] = useState<GameRound[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    selectedWord: null,
    feedback: null,
    score: 0,
  });

  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  // Trạng thái để ngăn việc gọi API nhiều lần
  const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);

  // Lấy 10 câu hỏi ngẫu nhiên
  const randomizeRounds = () => {
    const random = [...ALL_GAMES].sort(() => Math.random() - 0.5).slice(0, 10);
    setSelectedRounds(random);
  };

  useEffect(() => {
    randomizeRounds();
  }, []);

  const currentGame = selectedRounds[gameState.currentRound] ?? ALL_GAMES[0];
  const shuffledOptions = currentGame.options;

  // --- LOGIC KÉO THẢ & CLICK GIỮ NGUYÊN ---
  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData("text/plain", word);
    e.dataTransfer.effectAllowed = "move";
    setDraggedCard(word);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-primary", "bg-secondary");
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-primary", "bg-secondary");
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-primary", "bg-secondary");
    const word = draggedCard || e.dataTransfer.getData("text/plain");
    if (word) {
      setGameState((prev) => ({ ...prev, selectedWord: word, feedback: null }));
      setDraggedCard(null);
    }
  };
  const handleOptionClick = (word: string) => {
    setGameState((prev) => ({ ...prev, selectedWord: word, feedback: null }));
  };

  // --- KIỂM TRA ĐÚNG SAI ---
  const handleCheck = () => {
    if (!gameState.selectedWord) return;
    const isCorrect = gameState.selectedWord === currentGame.correctWord;

    setGameState((prev) => ({
      ...prev,
      feedback: isCorrect ? "correct" : "incorrect",
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
    // ⚠️ QUAN TRỌNG: Không gọi API progress ở đây nữa!
  };

  // --- CHUYỂN CÂU ---
  const handleNext = () => {
    if (gameState.currentRound < selectedRounds.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        selectedWord: null,
        feedback: null,
      }));
    } else {
      // Kết thúc game
      finishGameSession();
    }
  };

  // --- KẾT THÚC GAME ---
  const finishGameSession = () => {
    setIsSessionFinished(true);

    // Chỉ gọi API nếu chưa gọi lần nào trong phiên này
    if (!hasUpdatedProgress) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // 🔥 Cập nhật: Chỉ cộng 1 Game
        fetch("http://localhost:5000/api/users/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, type: "game", value: 1 })
        }).catch(err => console.error("Lỗi:", err));

        setHasUpdatedProgress(true); // Đánh dấu đã cộng điểm
      }
    }
  };

  const handleRestart = () => {
    setIsSessionFinished(false);
    setHasUpdatedProgress(false); // Reset cờ để game mới được tính điểm tiếp
    randomizeRounds();
    setGameState({
      currentRound: 0,
      selectedWord: null,
      feedback: null,
      score: 0,
    });
  };

  const handleQuit = () => navigate("/");

  // --- GIAO DIỆN ---
  if (isSessionFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card w-full max-w-lg rounded-[32px] p-8 md:p-12 shadow-xl border-2 border-border text-center animate-in zoom-in duration-300">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Hoàn thành!</h2>
          <p className="text-muted-foreground text-lg mb-6">Bạn đã hoàn thành 1 lượt chơi.</p>

          <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">Điểm số</p>
            <p className="text-5xl font-black text-primary">{gameState.score}/10</p>
          </div>

          <p className="text-xl font-semibold mb-8 text-foreground">Bạn có muốn chơi tiếp không?</p>

          <div className="flex flex-col gap-3">
            <button onClick={handleRestart} className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 flex items-center justify-center gap-2 shadow-md">
              <PlayCircle className="w-6 h-6" /> Có, chơi tiếp!
            </button>
            <button onClick={handleQuit} className="w-full py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:bg-secondary/80 flex items-center justify-center gap-2">
              <Home className="w-5 h-5" /> Không, thoát ra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🎯 Ghép Từ</h1>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-primary">{gameState.score}/10</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-6xl w-full">
          {/* Progress Dots */}
          <div className="mb-8 flex justify-center gap-1.5 flex-wrap">
            {selectedRounds.map((_, index) => (
              <div key={index} className={`h-2 rounded-full transition-all ${index < gameState.currentRound ? "w-8 bg-success" : index === gameState.currentRound ? "w-8 bg-primary" : "w-4 bg-muted"}`} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-full bg-card rounded-3xl p-8 shadow-lg text-center min-h-[250px] flex flex-col items-center justify-center">
                <div className="text-[120px] animate-bounce filter drop-shadow-xl">{currentGame.imageEmoji}</div>
              </div>
              <div
                className={`mt-8 w-full border-2 border-dashed rounded-3xl p-6 text-center min-h-24 flex items-center justify-center transition-all ${gameState.selectedWord ? "border-primary bg-primary/5" : "border-muted-foreground/30 bg-secondary/30"}`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                {gameState.selectedWord ? (
                  <div className="bg-white rounded-2xl px-8 py-4 shadow-md animate-in zoom-in">
                    <p className="text-3xl font-bold text-primary">{gameState.selectedWord}</p>
                  </div>
                ) : (
                  <div className="text-center pointer-events-none">
                    <p className="text-lg font-semibold text-muted-foreground">Kéo từ đúng vào đây</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-5">
              <h3 className="text-xl font-semibold text-center md:text-left">Chọn từ đúng:</h3>
              <div className="space-y-4">
                {shuffledOptions.map((word, index) => (
                  <div
                    key={`${word}-${index}`} draggable onDragStart={(e) => handleDragStart(e, word)} onDragEnd={() => setDraggedCard(null)} onClick={() => handleOptionClick(word)}
                    className={`bg-card rounded-2xl p-6 shadow-md cursor-pointer hover:scale-105 transition-all select-none border-2 ${draggedCard === word ? "opacity-50 ring-2 ring-primary" : ""} ${gameState.selectedWord === word ? "border-primary bg-primary/10 ring-2 ring-primary/50" : "border-transparent hover:border-primary/50"}`}
                  >
                    <p className="text-3xl font-bold text-center">{word}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {gameState.feedback && (
            <div className={`mt-8 rounded-3xl p-6 text-center animate-in slide-in-from-bottom-5 ${gameState.feedback === "correct" ? "bg-success/20 border-2 border-success" : "bg-destructive/20 border-2 border-destructive"}`}>
              <p className={`text-2xl font-bold ${gameState.feedback === "correct" ? "text-success" : "text-destructive"}`}>
                {gameState.feedback === "correct" ? `🎉 Chính xác!` : "❌ Chưa đúng. Thử lại nhé!"}
              </p>
            </div>
          )}

          <div className="mt-10 flex gap-4 justify-center">
            {!gameState.feedback ? (
              <button onClick={handleCheck} disabled={!gameState.selectedWord} className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 disabled:opacity-50 transition-all">
                <Check className="w-6 h-6" /> Kiểm tra
              </button>
            ) : (
              <div className="flex gap-4">
                <button onClick={handleNext} className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 transition-all shadow-lg">
                  {gameState.currentRound < selectedRounds.length - 1 ? "Tiếp theo →" : "Xem kết quả 🏆"}
                </button>
                <button onClick={handleRestart} className="flex items-center gap-3 px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:opacity-90 transition-all">
                  <RotateCcw className="w-5 h-5" /> Chơi lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}