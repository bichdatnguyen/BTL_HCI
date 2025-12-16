import { useState, useEffect } from "react";
import { HelpCircle, ArrowLeft, Trophy, Home, RotateCcw, PlayCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { WORD_SEARCH_WORDS, WordSearchWord } from "@/data/wordSearchData";
import { toast } from "sonner";

// --- CÁC INTERFACE ---
interface PlacedWord {
  id: string;
  word: string;
  cells: Array<[number, number]>;
}

type Direction = "horizontal" | "vertical" | "diagonalDown" | "diagonalUp";
type Difficulty = "easy" | "medium" | "hard";

interface GameConfig {
  difficulty: Difficulty;
  gridSize: number;
  maxAttempts: number;
}

const difficultyConfig: Record<Difficulty, GameConfig> = {
  easy: { difficulty: "easy", gridSize: 10, maxAttempts: 200 },
  medium: { difficulty: "medium", gridSize: 12, maxAttempts: 160 },
  hard: { difficulty: "hard", gridSize: 14, maxAttempts: 120 },
};

const normalize = (s: string) => s.replace(/\s+/g, "").toUpperCase();

// --- HÀM TẠO GRID ---
const generateGridWithWords = (words: WordSearchWord[], config: GameConfig) => {
  const GRID_SIZE = config.gridSize;
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ""),
  );

  const placedWords: PlacedWord[] = [];
  const alphabet = "AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ";

  const directions: Record<Direction, [number, number]> = {
    horizontal: [0, 1],
    vertical: [1, 0],
    diagonalDown: [1, 1],
    diagonalUp: [-1, 1],
  };

  const canPlaceWord = (word: string, row: number, col: number, direction: Direction) => {
    const [dRow, dCol] = directions[direction];
    const endRow = row + dRow * (word.length - 1);
    const endCol = col + dCol * (word.length - 1);

    if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) return false;

    for (let i = 0; i < word.length; i++) {
      const r = row + dRow * i;
      const c = col + dCol * i;
      const cell = grid[r][c];
      if (cell !== "" && cell !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (id: string, word: string, row: number, col: number, direction: Direction) => {
    const [dRow, dCol] = directions[direction];
    const cells: Array<[number, number]> = [];
    for (let i = 0; i < word.length; i++) {
      const r = row + dRow * i;
      const c = col + dCol * i;
      grid[r][c] = word[i];
      cells.push([r, c]);
    }
    placedWords.push({ id, word, cells });
  };

  const normalized = words
    .map((w) => ({ ...w, normalized: normalize(w.text) }))
    .sort((a, b) => b.normalized.length - a.normalized.length);

  for (const w of normalized) {
    const word = w.normalized;
    let placed = false;
    for (let attempt = 0; attempt < config.maxAttempts && !placed; attempt++) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const dirList: Direction[] = ["horizontal", "vertical", "diagonalDown", "diagonalUp"];
      const dir = dirList[Math.floor(Math.random() * dirList.length)];
      if (canPlaceWord(word, row, col, dir)) {
        placeWord(w.id, word, row, col, dir);
        placed = true;
      }
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, placedWords };
};

// --- HÀM TÍNH TOÁN ĐƯỜNG THẲNG ---
const getCellsBetween = (start: [number, number], end: [number, number]): [number, number][] => {
  const [r1, c1] = start;
  const [r2, c2] = end;
  const dr = r2 - r1;
  const dc = c2 - c1;

  const isHorizontal = dr === 0;
  const isVertical = dc === 0;
  const isDiagonal = Math.abs(dr) === Math.abs(dc);

  if (!isHorizontal && !isVertical && !isDiagonal) return [start];

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = dr === 0 ? 0 : dr / steps;
  const stepC = dc === 0 ? 0 : dc / steps;

  const cells: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([r1 + i * stepR, c1 + i * stepC]);
  }
  return cells;
};

export function WordSearchGame() {
  const navigate = useNavigate();
  useSetPageHeader({
    title: "🔍 Tìm Từ",
    subtitle: "Tìm những từ ẩn trong lưới",
    userName: "T",
    streakCount: 5,
  });

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameStarted, setGameStarted] = useState(false);

  // Trạng thái kết thúc game
  const [isGameFinished, setIsGameFinished] = useState(false);

  const [selectedWords, setSelectedWords] = useState<WordSearchWord[]>([]);
  const [gameData, setGameData] = useState<{ grid: string[][]; placedWords: PlacedWord[] } | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());

  // Trạng thái kéo chuột
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragCurrent, setDragCurrent] = useState<[number, number] | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const [showHelp, setShowHelp] = useState(false);

  const selectRandomWords = (diff: Difficulty) => {
    const pool = WORD_SEARCH_WORDS.filter((w) => w.difficulty === diff);
    const count = Math.min(pool.length, 5);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    const words = selectRandomWords(diff);
    setSelectedWords(words);
    const cfg = difficultyConfig[diff];
    const data = generateGridWithWords(words, cfg);
    setGameData(data);

    // Reset toàn bộ trạng thái
    setFoundWords(new Set());
    setDragStart(null);
    setDragCurrent(null);
    setIsSelecting(false);
    setIsGameFinished(false);
    setGameStarted(true);
  };

  // --- XỬ LÝ CHUỘT ---
  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setDragStart([row, col]);
    setDragCurrent([row, col]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting) {
      setDragCurrent([row, col]);
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting || !dragStart || !dragCurrent || !gameData) {
      setIsSelecting(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const selectedCells = getCellsBetween(dragStart, dragCurrent);
    const selectedString = selectedCells.map(([r, c]) => gameData.grid[r][c]).join("");
    const reversedString = selectedString.split("").reverse().join("");

    const foundWord = gameData.placedWords.find(pw => {
      if (foundWords.has(pw.id)) return false;
      const target = pw.word;
      return target === selectedString || target === reversedString;
    });

    if (foundWord) {
      // Logic xử lý khi tìm thấy từ
      const nextFoundWords = new Set(foundWords).add(foundWord.id);
      setFoundWords(nextFoundWords);

      const wordText = selectedWords.find(w => w.id === foundWord.id)?.text;
      toast.success(`Chính xác! Bạn tìm thấy: ${wordText}`);

      // 🔥 KIỂM TRA XEM ĐÃ TÌM HẾT CHƯA?
      if (nextFoundWords.size === selectedWords.length) {
        finishGame();
      }
    }

    setIsSelecting(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  // --- HÀM KẾT THÚC GAME ---
  const finishGame = () => {
    setIsGameFinished(true); // Hiện màn hình chúc mừng

    // Gọi API cập nhật tiến độ (Hoàn thành 1 game)
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch("http://localhost:5000/api/users/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "game", value: 1 })
      }).catch(err => console.error(err));
    }
  };

  const handleRestart = () => {
    startGame(difficulty);
  };

  const handleQuit = () => {
    navigate("/");
  };

  // --- LOGIC HIỂN THỊ MÀU SẮC CHO Ô ---
  const getCellStatus = (row: number, col: number) => {
    if (!gameData) return "normal";
    for (const wordId of foundWords) {
      const placed = gameData.placedWords.find(pw => pw.id === wordId);
      if (placed && placed.cells.some(([r, c]) => r === row && c === col)) {
        return "found";
      }
    }
    if (isSelecting && dragStart && dragCurrent) {
      const selectingCells = getCellsBetween(dragStart, dragCurrent);
      if (selectingCells.some(([r, c]) => r === row && c === col)) {
        return "selecting";
      }
    }
    return "normal";
  };

  // Tính toán tiến độ
  const completedWords = foundWords.size;
  const totalWords = selectedWords.length;
  const progress = totalWords > 0 ? (completedWords / totalWords) * 100 : 0;

  // CSS class cho grid size
  const isHardMode = difficulty === "hard";
  const gridSizeClass = isHardMode
    ? "w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-xs sm:text-base"
    : "w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-sm sm:text-xl";

  // --- MÀN HÌNH CHỌN CẤP ĐỘ (Menu) ---
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-2">🔍 Tìm Từ</h1>
            <p className="text-muted-foreground text-lg">Chọn cấp độ để bắt đầu</p>
          </div>
          <div className="space-y-4">
            <button onClick={() => startGame("easy")} className="w-full bg-card border-2 border-border rounded-3xl p-8 hover:border-primary hover:shadow-lg transition-all text-center"><h3 className="text-2xl font-bold">DỄ 🟢</h3></button>
            <button onClick={() => startGame("medium")} className="w-full bg-card border-2 border-border rounded-3xl p-8 hover:border-primary hover:shadow-lg transition-all text-center"><h3 className="text-2xl font-bold">TRUNG BÌNH 🟡</h3></button>
            <button onClick={() => startGame("hard")} className="w-full bg-card border-2 border-border rounded-3xl p-8 hover:border-primary hover:shadow-lg transition-all text-center"><h3 className="text-2xl font-bold">KHÓ 🔴</h3></button>
          </div>
          <div className="mt-12 text-center">
            <Link to="/games" className="text-muted-foreground hover:text-foreground">← Quay lại</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH CHÚC MỪNG HOÀN THÀNH ---
  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card w-full max-w-lg rounded-[32px] p-8 md:p-12 shadow-xl border-2 border-border text-center animate-in zoom-in duration-300">
          <div className="text-6xl mb-6 text-yellow-500">
            <Trophy size={80} className="mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Xin chúc mừng!</h2>
          <p className="text-muted-foreground text-lg mb-6">Bạn đã tìm thấy tất cả các từ.</p>

          <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">Kết quả</p>
            <p className="text-5xl font-black text-primary">{completedWords}/{totalWords}</p>
          </div>

          <p className="text-xl font-semibold mb-8 text-foreground">Bạn có muốn chơi tiếp không?</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <PlayCircle className="w-6 h-6" />
              Có, chơi lại!
            </button>

            <button
              onClick={handleQuit}
              className="w-full py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:bg-secondary/80 flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-5 h-5" />
              Không, về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameData) return <div>Loading...</div>;

  // --- MÀN HÌNH CHƠI GAME (GRID) ---
  return (
    <div className="min-h-screen bg-background flex flex-col select-none" onMouseUp={handleMouseUp}>
      <div className="bg-card shadow-sm border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setGameStarted(false)} className="flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft /> Thoát
          </button>
          <h1 className="text-2xl font-bold">Cấp độ: {difficulty.toUpperCase()}</h1>
          <button onClick={() => setShowHelp(!showHelp)}><HelpCircle /></button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-secondary/30 border-b border-secondary p-4 text-center text-sm">
          💡 Kéo chuột theo đường thẳng (ngang, dọc, chéo) để chọn từ.
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* CỘT TRÁI: GRID */}
            <div className="xl:col-span-2 flex flex-col items-center">
              <div className="w-full mb-6 flex items-center gap-4 max-w-2xl">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="font-bold text-success">{completedWords}/{totalWords}</span>
              </div>

              <div className="w-full overflow-x-auto pb-4 flex justify-center">
                <div className="bg-card rounded-3xl p-4 md:p-6 shadow-lg inline-block min-w-min">
                  <div
                    className="grid gap-1 md:gap-2"
                    style={{ gridTemplateColumns: `repeat(${gameData.grid.length}, 1fr)` }}
                    onMouseLeave={handleMouseUp}
                  >
                    {gameData.grid.map((row, r) =>
                      row.map((letter, c) => {
                        const status = getCellStatus(r, c);
                        let cellClass = "bg-muted text-foreground hover:bg-secondary";
                        if (status === "found") cellClass = "bg-success text-white font-extrabold shadow-inner scale-95";
                        else if (status === "selecting") cellClass = "bg-primary text-white scale-105 shadow-lg z-10";

                        return (
                          <div
                            key={`${r}-${c}`}
                            onMouseDown={() => handleMouseDown(r, c)}
                            onMouseEnter={() => handleMouseEnter(r, c)}
                            onTouchStart={(e) => { e.preventDefault(); handleMouseDown(r, c); }}
                            className={`
                              ${gridSizeClass}
                              rounded-md md:rounded-lg
                              flex items-center justify-center 
                              font-bold 
                              cursor-pointer transition-all duration-100 select-none
                              ${cellClass}
                            `}
                          >
                            {letter}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: DANH SÁCH TỪ */}
            <div className="w-full max-w-md mx-auto xl:mx-0">
              <h2 className="text-xl font-bold mb-4">Tìm những từ sau:</h2>
              <div className="space-y-3">
                {selectedWords.map(word => (
                  <div key={word.id} className={`p-4 rounded-xl border-2 transition-all ${foundWords.has(word.id) ? "bg-success/20 border-success" : "bg-card border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-lg ${foundWords.has(word.id) ? "line-through text-success-foreground" : ""}`}>{word.text}</span>
                      {foundWords.has(word.id) && <span className="text-xl">✅</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{word.hint}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}