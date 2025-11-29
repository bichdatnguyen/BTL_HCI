import { useState, useEffect } from "react";
import { Check, RotateCcw } from "lucide-react";
import { useSetPageHeader } from "@/contexts/HeaderContext";

interface GameRound {
  id: string;
  imageEmoji: string;
  imageName: string;
  correctWord: string;
  options: string[];
}

// ⭐ DANH SÁCH GAME GỐC (15 trò)
const ALL_GAMES: GameRound[] = [
  {
    id: "apple",
    imageEmoji: "🍎",
    imageName: "Quả táo",
    correctWord: "Táo",
    options: ["Táo", "Chuối", "Xe hơi"],
  },
  {
    id: "banana",
    imageEmoji: "🍌",
    imageName: "Quả chuối",
    correctWord: "Chuối",
    options: ["Quả lê", "Chuối", "Mèo"],
  },
  {
    id: "car",
    imageEmoji: "🚗",
    imageName: "Chiếc xe hơi",
    correctWord: "Xe hơi",
    options: ["Xe đạp", "Tàu hỏa", "Xe hơi"],
  },
  {
    id: "cat",
    imageEmoji: "🐱",
    imageName: "Con mèo",
    correctWord: "Mèo",
    options: ["Chó", "Mèo", "Cá"],
  },
  {
    id: "dog",
    imageEmoji: "🐶",
    imageName: "Con chó",
    correctWord: "Chó",
    options: ["Cá", "Gà", "Chó"],
  },
  {
    id: "train",
    imageEmoji: "🚆",
    imageName: "Tàu hỏa",
    correctWord: "Tàu hỏa",
    options: ["Máy bay", "Tàu hỏa", "Xe đạp"],
  },
  {
    id: "plane",
    imageEmoji: "✈️",
    imageName: "Máy bay",
    correctWord: "Máy bay",
    options: ["Tàu hỏa", "Xe hơi", "Máy bay"],
  },
  {
    id: "pizza",
    imageEmoji: "🍕",
    imageName: "Pizza",
    correctWord: "Pizza",
    options: ["Hamburger", "Pizza", "Bánh mì"],
  },
  {
    id: "burger",
    imageEmoji: "🍔",
    imageName: "Hamburger",
    correctWord: "Hamburger",
    options: ["Cơm", "Hamburger", "Phở"],
  },
  {
    id: "book",
    imageEmoji: "📚",
    imageName: "Quyển sách",
    correctWord: "Sách",
    options: ["Sách", "Bút", "Bảng"],
  },
  {
    id: "pencil",
    imageEmoji: "✏️",
    imageName: "Bút chì",
    correctWord: "Bút chì",
    options: ["Thước", "Bút chì", "Cục tẩy"],
  },
  {
    id: "house",
    imageEmoji: "🏠",
    imageName: "Ngôi nhà",
    correctWord: "Nhà",
    options: ["Nhà", "Cây", "Xe"],
  },
  {
    id: "tree",
    imageEmoji: "🌳",
    imageName: "Cái cây",
    correctWord: "Cây",
    options: ["Cây", "Hoa", "Cỏ"],
  },
  {
    id: "flower",
    imageEmoji: "🌸",
    imageName: "Bông hoa",
    correctWord: "Hoa",
    options: ["Lá", "Hoa", "Gốc"],
  },
  {
    id: "fish",
    imageEmoji: "🐟",
    imageName: "Con cá",
    correctWord: "Cá",
    options: ["Mèo", "Cá", "Chim"],
  },
];

interface GameState {
  currentRound: number;
  selectedWord: string | null;
  feedback: "correct" | "incorrect" | null;
  score: number;
}

export function WordMatchingGame() {
  useSetPageHeader({
    title: "🎯 Ghép Từ",
    subtitle: "Ghép từ với hình ảnh để học tập",
    userName: "T",
    streakCount: 5,
  });

  // ⭐ Trò chơi random mỗi lượt
  const [selectedRounds, setSelectedRounds] = useState<GameRound[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    selectedWord: null,
    feedback: null,
    score: 0,
  });

  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  // 🎲 Hàm random
  const randomizeRounds = () => {
    const random = [...ALL_GAMES].sort(() => Math.random() - 0.5).slice(0, 5);
    setSelectedRounds(random);
  };

  // Random khi load trang
  useEffect(() => {
    randomizeRounds();
  }, []);

  const currentGame = selectedRounds[gameState.currentRound] ?? ALL_GAMES[0];
  const shuffledOptions = [...currentGame.options].sort(
    () => Math.random() - 0.5,
  );

  const handleDragStart = (word: string) => setDraggedCard(word);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-primary", "bg-secondary");
  };
  const handleDragLeave = (e: React.DragEvent) =>
    e.currentTarget.classList.remove("ring-2", "ring-primary", "bg-secondary");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-primary", "bg-secondary");
    if (draggedCard) {
      setGameState((prev) => ({
        ...prev,
        selectedWord: draggedCard,
        feedback: null,
      }));
      setDraggedCard(null);
    }
  };

  const handleCheck = () => {
    if (!gameState.selectedWord) return;
    const isCorrect = gameState.selectedWord === currentGame.correctWord;

    setGameState((prev) => ({
      ...prev,
      feedback: isCorrect ? "correct" : "incorrect",
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNext = () => {
    if (gameState.currentRound < selectedRounds.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        selectedWord: null,
        feedback: null,
      }));
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    randomizeRounds();
    setGameState({
      currentRound: 0,
      selectedWord: null,
      feedback: null,
      score: 0,
    });
  };

  const isGameComplete = gameState.feedback !== null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🎯 Ghép Từ</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Ghép từ với hình ảnh để học tập
            </p>
          </div>

          {/* ⭐ Điểm số */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-primary">
              {gameState.score}/{selectedRounds.length}
            </div>
            <p className="text-sm text-muted-foreground">Điểm số</p>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-6xl w-full">
          {/* Progress bar */}
          <div className="mb-8 flex justify-center gap-2">
            {selectedRounds.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index < gameState.currentRound
                    ? "w-8 bg-success"
                    : index === gameState.currentRound
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-full bg-card rounded-3xl p-8 shadow-lg text-center">
                <div className="text-8xl mb-6 animate-bounce">
                  {currentGame.imageEmoji}
                </div>
                <h2 className="text-2xl font-bold">{currentGame.imageName}</h2>
              </div>

              {/* Drop zone */}
              <div
                className="mt-8 w-full bg-secondary/30 border-2 border-dashed border-primary rounded-3xl p-6 text-center min-h-24 flex items-center justify-center"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {gameState.selectedWord ? (
                  <div className="bg-white rounded-2xl px-6 py-4 shadow-md">
                    <p className="text-2xl font-bold">
                      {gameState.selectedWord}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-muted-foreground">
                      Kéo từ đúng vào đây
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ↓ Kéo và thả ↓
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col justify-center gap-5">
              <h3 className="text-xl font-semibold text-center md:text-left">
                Chọn từ đúng:
              </h3>

              <div className="space-y-4">
                {shuffledOptions.map((word, index) => (
                  <div
                    key={`${word}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(word)}
                    onDragEnd={() => setDraggedCard(null)}
                    className={`bg-card rounded-2xl p-6 shadow-md cursor-move hover:scale-105 transition-all
                      ${draggedCard === word ? "opacity-50 ring-2 ring-primary" : ""}
                      ${gameState.selectedWord === word ? "ring-4 ring-accent bg-accent/10" : ""}
                    `}
                  >
                    <p className="text-3xl font-bold text-center">{word}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback */}
          {isGameComplete && (
            <div
              className={`mt-8 rounded-3xl p-6 text-center ${
                gameState.feedback === "correct"
                  ? "bg-success/20 border-2 border-success"
                  : "bg-destructive/20 border-2 border-destructive"
              }`}
            >
              <p
                className={`text-2xl font-bold ${
                  gameState.feedback === "correct"
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {gameState.feedback === "correct"
                  ? "🎉 Đúng rồi! Tuyệt vời!"
                  : "❌ Chưa đúng. Thử lại nha!"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4 justify-center">
            {!isGameComplete ? (
              <button
                onClick={handleCheck}
                disabled={!gameState.selectedWord}
                className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 disabled:opacity-50"
              >
                <Check className="w-6 h-6" />
                Kiểm tra
              </button>
            ) : (
              <div className="flex gap-4">
                {gameState.currentRound < selectedRounds.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90"
                  >
                    Tiếp theo →
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="flex items-center gap-3 px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:opacity-90"
                >
                  <RotateCcw className="w-5 h-5" />
                  Chơi lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
