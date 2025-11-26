import { useState } from "react";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSetPageHeader } from "@/contexts/HeaderContext";

interface Word {
  id: string;
  text: string;
  found: boolean;
}

interface Cell {
  row: number;
  col: number;
  letter: string;
}

// 10x10 word search grid with hidden words
const generateGrid = () => {
  const letters = [
    ["B", "Á", "D", "Í", "A", "U", "V", "O", "X", "M"],
    ["M", "E", "T", "A", "R", "A", "N", "G", "E", "T"],
    ["C", "U", "C", "A", "C", "H", "U", "U", "T", "O"],
    ["H", "U", "Á", "M", "P", "H", "L", "V", "I", "N"],
    ["O", "V", "O", "C", "A", "D", "O", "B", "Á", "H"],
    ["C", "O", "I", "N", "T", "H", "O", "M", "A", "U"],
    ["O", "L", "A", "M", "A", "R", "A", "N", "J", "A"],
    ["L", "À", "Â", "U", "L", "Á", "I", "H", "O", "I"],
    ["A", "R", "O", "Z", "F", "R", "A", "N", "G", "A"],
    ["P", "E", "R", "A", "P", "U", "S", "Á", "M", "A"],
  ];
  return letters;
};

const words: Word[] = [
  { id: "orange", text: "LARANJA", found: false },
  { id: "apple", text: "MAÇÃ", found: false },
  { id: "grape", text: "UVA", found: false },
  { id: "lemon", text: "LIMÃO", found: false },
];

export function WordSearchGame() {
  useSetPageHeader({
    title: "🔍 Tìm Từ",
    subtitle: "Tìm từ ẩn trong lưới",
    userName: "T",
    streakCount: 5,
  });

  const grid = generateGrid();
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  const toggleCellSelection = (row: number, col: number) => {
    const cellKey = `${row},${col}`;
    const newSelected = new Set(selectedCells);

    if (newSelected.has(cellKey)) {
      newSelected.delete(cellKey);
    } else {
      newSelected.add(cellKey);
    }

    setSelectedCells(newSelected);
  };

  const markWordAsFound = (wordId: string) => {
    const newFound = new Set(foundWords);
    if (newFound.has(wordId)) {
      newFound.delete(wordId);
    } else {
      newFound.add(wordId);
    }
    setFoundWords(newFound);
    setSelectedCells(new Set());
  };

  const isCellPartOfWord = (row: number, col: number): string | null => {
    // This is a simplified version - in a real game, you'd calculate which words contain this cell
    // For demo purposes, we'll just check if it's selected
    const cellKey = `${row},${col}`;
    if (selectedCells.has(cellKey)) {
      return "accent"; // Selected cell
    }
    return null;
  };

  const completedWords = foundWords.size;
  const totalWords = words.length;
  const progress = (completedWords / totalWords) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/games"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back to games"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">🔍 Tìm Từ</h1>
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

      {/* Help Message */}
      {showHelp && (
        <div className="bg-secondary/30 border-b border-secondary p-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-foreground font-semibold mb-2">💡 Gợi ý:</p>
            <p className="text-muted-foreground">
              Nhấp vào các chữ cái để chọn từ. Tìm thấy tất cả các từ trong danh sách bên dưới!
            </p>
          </div>
        </div>
      )}

      {/* Game Content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: Word Search Grid */}
            <div className="lg:col-span-2">
              {/* Progress Bar */}
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

              {/* Grid */}
              <div className="bg-card rounded-3xl p-8 shadow-lg">
                <div className="inline-block">
                  <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
                    {grid.map((row, rowIndex) =>
                      row.map((letter, colIndex) => {
                        const cellKey = `${rowIndex},${colIndex}`;
                        const isSelected = selectedCells.has(cellKey);
                        const highlightColor = isCellPartOfWord(rowIndex, colIndex);

                        return (
                          <button
                            key={cellKey}
                            onClick={() => toggleCellSelection(rowIndex, colIndex)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold text-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                              isSelected
                                ? "bg-accent text-accent-foreground shadow-md"
                                : highlightColor === "accent"
                                  ? "bg-warning text-foreground"
                                  : "bg-muted text-foreground hover:bg-secondary"
                            }`}
                            aria-label={`Letter ${letter}`}
                          >
                            {letter}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Word List */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Tìm những từ:
              </h2>

              <div className="space-y-3 flex flex-col">
                {words.map((word) => (
                  <div
                    key={word.id}
                    className="bg-card rounded-2xl p-4 shadow-md"
                  >
                    <button
                      onClick={() => markWordAsFound(word.id)}
                      className="w-full flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          foundWords.has(word.id)
                            ? "bg-success border-success"
                            : "border-border bg-background"
                        }`}
                      >
                        {foundWords.has(word.id) && (
                          <span className="text-white text-sm font-bold">✓</span>
                        )}
                      </div>
                      <span
                        className={`text-xl font-bold transition-all ${
                          foundWords.has(word.id)
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {word.text}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Completion Message */}
              {completedWords === totalWords && (
                <div className="mt-8 bg-success/20 border-2 border-success rounded-3xl p-6 text-center animate-slide-up">
                  <p className="text-2xl font-bold text-success">
                    🎉 Tuyệt vời!
                  </p>
                  <p className="text-success text-sm mt-2">
                    Bạn tìm thấy tất cả các từ!
                  </p>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={() => {
                  setFoundWords(new Set());
                  setSelectedCells(new Set());
                }}
                className="w-full mt-8 px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                Chơi lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
