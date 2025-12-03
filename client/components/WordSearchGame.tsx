import { useState, useEffect } from "react";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { WORD_SEARCH_WORDS, WordSearchWord } from "@/data/wordSearchData";

interface PlacedWord {
  id: string;
  word: string; // normalized (no spaces)
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

const normalize = (s: string) => s.replace(/\s+/g, "");

const generateGridWithWords = (words: WordSearchWord[], config: GameConfig) => {
  const GRID_SIZE = config.gridSize;
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ""),
  );

  const placedWords: PlacedWord[] = [];
  const alphabet =
    "AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ";

  const directions: Record<Direction, [number, number]> = {
    horizontal: [0, 1],
    vertical: [1, 0],
    diagonalDown: [1, 1],
    diagonalUp: [-1, 1],
  };

  const canPlaceWord = (
    word: string,
    row: number,
    col: number,
    direction: Direction,
  ) => {
    const [dRow, dCol] = directions[direction];

    // boundary check
    const endRow = row + dRow * (word.length - 1);
    const endCol = col + dCol * (word.length - 1);
    if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE)
      return false;

    // collision check (allow same letter)
    for (let i = 0; i < word.length; i++) {
      const r = row + dRow * i;
      const c = col + dCol * i;
      const cell = grid[r][c];
      if (cell !== "" && cell !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (
    id: string,
    word: string,
    row: number,
    col: number,
    direction: Direction,
  ) => {
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

  // normalize and sort by length (longer first)
  const normalized = words
    .map((w) => ({ ...w, normalized: normalize(w.text) }))
    .sort((a, b) => b.normalized.length - a.normalized.length);

  for (const w of normalized) {
    const word = w.normalized;
    let placed = false;

    // random attempts
    for (let attempt = 0; attempt < config.maxAttempts && !placed; attempt++) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const dirList: Direction[] = [
        "horizontal",
        "vertical",
        "diagonalDown",
        "diagonalUp",
      ];
      const dir = dirList[Math.floor(Math.random() * dirList.length)];
      if (canPlaceWord(word, row, col, dir)) {
        placeWord(w.id, word, row, col, dir);
        placed = true;
      }
    }

    // brute-force fallback
    if (!placed) {
      outer: for (let r = 0; r < GRID_SIZE && !placed; r++) {
        for (let c = 0; c < GRID_SIZE && !placed; c++) {
          for (const dir of [
            "horizontal",
            "vertical",
            "diagonalDown",
            "diagonalUp",
          ] as Direction[]) {
            if (canPlaceWord(word, r, c, dir)) {
              placeWord(w.id, word, r, c, dir);
              placed = true;
              break outer;
            }
          }
        }
      }
    }
    // if still not placed, skip (rare). Game will continue with fewer placed words.
  }

  // fill remaining cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, placedWords };
};

export function WordSearchGame() {
  useSetPageHeader({
    title: "🔍 Tìm Từ",
    subtitle: "Tìm những từ ẩn trong lưới",
    userName: "T",
    streakCount: 5,
  });

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWords, setSelectedWords] = useState<WordSearchWord[]>([]);
  const [gameData, setGameData] = useState<{
    grid: string[][];
    placedWords: PlacedWord[];
  } | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const selectRandomWords = (diff: Difficulty) => {
    const pool = WORD_SEARCH_WORDS.filter((w) => w.difficulty === diff);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    const words = selectRandomWords(diff);
    setSelectedWords(words);
    const cfg = difficultyConfig[diff];
    const data = generateGridWithWords(words, cfg);
    setGameData(data);
    setFoundWords(new Set());
    setSelectedCells(new Set());
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameData || selectedCells.size < 2) return;

    const selectedArray = Array.from(selectedCells)
      .map((k) => k.split(",").map(Number) as [number, number])
      // sort by row then col to get canonical order
      .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

    for (const placed of gameData.placedWords) {
      const wordCells = [...placed.cells].sort((a, b) =>
        a[0] === b[0] ? a[1] - b[1] : a[0] - b[0],
      );

      // forward match
      if (
        selectedArray.length === wordCells.length &&
        selectedArray.every(
          (cell, idx) =>
            cell[0] === wordCells[idx][0] && cell[1] === wordCells[idx][1],
        )
      ) {
        if (!foundWords.has(placed.id)) {
          setFoundWords((prev) => new Set(prev).add(placed.id));
        }
        setSelectedCells(new Set());
        return;
      }

      // reverse match
      const reversed = [...wordCells].reverse();
      if (
        selectedArray.length === reversed.length &&
        selectedArray.every(
          (cell, idx) =>
            cell[0] === reversed[idx][0] && cell[1] === reversed[idx][1],
        )
      ) {
        if (!foundWords.has(placed.id)) {
          setFoundWords((prev) => new Set(prev).add(placed.id));
        }
        setSelectedCells(new Set());
        return;
      }
    }
  }, [selectedCells, gameData, foundWords, selectedWords]);

  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setSelectedCells(new Set([`${row},${col}`]));
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging) return;
    setSelectedCells((prev) => new Set(prev).add(`${row},${col}`));
  };

  const handleCellMouseUp = () => {
    setIsDragging(false);
  };

  // touch support (basic)
  const handleTouchStart = (row: number, col: number) => {
    handleCellMouseDown(row, col);
  };
  const handleTouchMove = (ev: React.TouchEvent, row: number, col: number) => {
    ev.preventDefault();
    handleCellMouseEnter(row, col);
  };
  const handleTouchEnd = () => {
    handleCellMouseUp();
  };

  const toggleCellSelection = (row: number, col: number) => {
    const key = `${row},${col}`;
    setSelectedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isCellHighlighted = (row: number, col: number) =>
    selectedCells.has(`${row},${col}`);

  const isCellPartOfFoundWord = (row: number, col: number) => {
    if (!gameData) return false;
    for (const id of foundWords) {
      const p = gameData.placedWords.find((pw) => pw.id === id);
      if (p && p.cells.some((c) => c[0] === row && c[1] === col)) return true;
    }
    return false;
  };

  const completedWords = foundWords.size;
  const totalWords = selectedWords.length;
  const progress = totalWords > 0 ? (completedWords / totalWords) * 100 : 0;

  const resetGame = () => {
    startGame(difficulty);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-2">
              🔍 Tìm Từ
            </h1>
            <p className="text-muted-foreground text-lg">
              Chọn cấp độ để bắt đầu
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => startGame("easy")}
              className="w-full bg-card border-2 border-border rounded-3xl p-8 hover:border-primary hover:shadow-lg transition-all text-center"
            >
              <div className="text-4xl mb-3">🟢</div>
              <h3 className="text-2xl font-bold text-foreground mb-1">DỄ</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Grid 10x10, từ ngắn
              </p>
              <p className="text-xs text-muted-foreground">
                2-3 chữ cái • 5 từ
              </p>
            </button>

            <button
              onClick={() => startGame("medium")}
              className="w-full bg-card border-2 border-border rounded-3xl p-8 hover:border-primary hover:shadow-lg transition-all text-center"
            >
              <div className="text-4xl mb-3">🟡</div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                TRUNG BÌNH
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Grid 12x12, từ vừa
              </p>
              <p className="text-xs text-muted-foreground">
                4-5 chữ cái • 5 từ
              </p>
            </button>

            <button
              onClick={() => startGame("hard")}
              className="w-full bg-card border-2 border-border rounded-3xl p-8 hover:border-primary hover:shadow-lg transition-all text-center"
            >
              <div className="text-4xl mb-3">🔴</div>
              <h3 className="text-2xl font-bold text-foreground mb-1">KHÓ</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Grid 14x14, từ dài
              </p>
              <p className="text-xs text-muted-foreground">6+ chữ cái • 5 từ</p>
            </button>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/games"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Đang tạo game...</p>
      </div>
    );
  }

  const { grid } = gameData;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      onMouseLeave={() => setIsDragging(false)}
    >
      <div className="bg-card shadow-sm border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGameStarted(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                🔍 Tìm Từ -{" "}
                <span className="capitalize">
                  {difficulty === "easy"
                    ? "Dễ 🟢"
                    : difficulty === "medium"
                      ? "Trung bình 🟡"
                      : "Khó 🔴"}
                </span>
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Tìm những từ ẩn trong lưới
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity"
              aria-label="Show help"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Trợ giúp</span>
            </button>
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="bg-secondary/30 border-b border-secondary p-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-foreground font-semibold mb-2">💡 Gợi ý:</p>
            <p className="text-muted-foreground">
              Kéo chuột hoặc nhấp để chọn các chữ cái. Từ có thể nằm: trái→phải,
              phải→trái, trên→dưới, dưới→trên, hoặc chéo.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-foreground">
                    Tiến độ
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {completedWords}/{totalWords}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-card rounded-3xl p-8 shadow-lg overflow-x-auto select-none">
                <div className="inline-block">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
                    }}
                  >
                    {grid.map((row, rowIndex) =>
                      row.map((letter, colIndex) => {
                        const isSelected = isCellHighlighted(
                          rowIndex,
                          colIndex,
                        );
                        const isPartOfFound = isCellPartOfFoundWord(
                          rowIndex,
                          colIndex,
                        );
                        return (
                          <button
                            key={`${rowIndex},${colIndex}`}
                            onMouseDown={() =>
                              handleCellMouseDown(rowIndex, colIndex)
                            }
                            onMouseEnter={() =>
                              handleCellMouseEnter(rowIndex, colIndex)
                            }
                            onMouseUp={handleCellMouseUp}
                            onTouchStart={() =>
                              handleTouchStart(rowIndex, colIndex)
                            }
                            onTouchMove={(e) =>
                              handleTouchMove(e, rowIndex, colIndex)
                            }
                            onTouchEnd={handleTouchEnd}
                            onClick={() =>
                              toggleCellSelection(rowIndex, colIndex)
                            }
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold text-sm sm:text-base transition-all focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${
                              isPartOfFound
                                ? "bg-success text-white shadow-md"
                                : isSelected
                                  ? "bg-accent text-accent-foreground shadow-md"
                                  : "bg-muted text-foreground hover:bg-secondary"
                            }`}
                            aria-label={`Letter ${letter}`}
                          >
                            {letter}
                          </button>
                        );
                      }),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Tìm những từ:
              </h2>

              <div className="space-y-3 flex flex-col max-h-[600px] overflow-y-auto">
                {selectedWords.map((w) => (
                  <div key={w.id} className="bg-card rounded-2xl p-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${foundWords.has(w.id) ? "bg-success border-success" : "border-border bg-background"}`}
                      >
                        {foundWords.has(w.id) && (
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-lg font-bold transition-all ${foundWords.has(w.id) ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {w.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {w.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {completedWords === totalWords && (
                <div className="mt-8 bg-success/20 border-2 border-success rounded-3xl p-6 text-center animate-pulse">
                  <p className="text-2xl font-bold text-success">
                    🎉 Tuyệt vời!
                  </p>
                  <p className="text-success text-sm mt-2">
                    Bạn tìm thấy tất cả các từ!
                  </p>
                </div>
              )}

              <button
                onClick={resetGame}
                className="w-full mt-8 px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                Chơi lại
              </button>
              <button
                onClick={() => setGameStarted(false)}
                className="w-full mt-3 px-6 py-3 bg-muted text-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                Đổi cấp độ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
