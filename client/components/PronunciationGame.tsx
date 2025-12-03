// ...existing code...
import { useEffect, useState } from "react";
import { Check, Mic, Volume2, RotateCcw } from "lucide-react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { WORD_BANK, WordItem } from "@/data/wordBank";
// ...existing code...

export default function PronunciationGame() {
  useSetPageHeader({
    title: "🔊 Luyện Âm Vị (Giọng Nói)",
    subtitle: "Nghe – Nói – Được chấm điểm tự động",
    userName: "T",
    streakCount: 5,
  });

  const [roundWords, setRoundWords] = useState<WordItem[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const THRESHOLD = 70;

  // Tạo bộ 5 từ mỗi lần chơi
  useEffect(() => {
    const easyWords = WORD_BANK.filter((w) => w.difficulty === "easy")
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const mediumWords = WORD_BANK.filter((w) => w.difficulty === "medium")
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const hardWords = WORD_BANK.filter((w) => w.difficulty === "hard")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    setRoundWords(
      [...easyWords, ...mediumWords, ...hardWords].sort(
        () => Math.random() - 0.5,
      ),
    );
  }, []);

  const currentWord = roundWords[round];

  // ⭐⭐⭐ FIX CHÍNH  — NGĂN TRẮNG MÀN HÌNH ⭐⭐⭐
  if (!currentWord) {
    return (
      <div className="min-h-screen p-6 bg-background flex justify-center">
        <div className="max-w-xl w-full bg-card p-6 rounded-3xl shadow-lg text-center">
          <p className="text-xl font-bold">⏳ Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  // TTS đọc từ
  const speak = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "vi-VN";
    msg.rate = 1;
    window.speechSynthesis.speak(msg);
  };

  // Mock API chấm điểm (tạm thời)
  async function mockScore(word: string, audioBlob: Blob): Promise<number> {
    return Math.floor(60 + Math.random() * 40); // 60–100
  }

  // Bắt đầu ghi âm
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));

      const scoreValue = await mockScore(currentWord.word, blob);
      setScore(scoreValue);
    };

    recorder.start();
    setRecording(true);

    setTimeout(() => {
      recorder.stop();
      setRecording(false);
    }, 2000);
  };

  const nextWord = () => {
    if (round < 4) {
      setRound(round + 1);
      setScore(null);
      setAudioURL(null);
    } else {
      reset();
    }
  };

  const reset = () => {
    const easyWords = WORD_BANK.filter((w) => w.difficulty === "easy")
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const mediumWords = WORD_BANK.filter((w) => w.difficulty === "medium")
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const hardWords = WORD_BANK.filter((w) => w.difficulty === "hard")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    setRoundWords(
      [...easyWords, ...mediumWords, ...hardWords].sort(
        () => Math.random() - 0.5,
      ),
    );

    setRound(0);
    setScore(null);
    setAudioURL(null);
  };

  // --- SVG emoji ---
  const HappyFace = ({ className = "w-20 h-20" }: { className?: string }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="30" fill="#D1FAE5" />
      <path
        d="M20 26c0 3 4 3 4 0"
        stroke="#065F46"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M44 26c0 3-4 3-4 0"
        stroke="#065F46"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 42c6 6 18 6 24 0"
        stroke="#065F46"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const SadFace = ({ className = "w-20 h-20" }: { className?: string }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="30" fill="#FEE2E2" />
      <path
        d="M20 26c0 3 4 3 4 0"
        stroke="#991B1B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M44 26c0 3-4 3-4 0"
        stroke="#991B1B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 46c6-6 18-6 24 0"
        stroke="#991B1B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="min-h-screen p-6 bg-background flex justify-center">
      <div className="max-w-xl w-full bg-card p-6 rounded-3xl shadow-lg text-center">
        <h2 className="text-3xl font-bold">{currentWord.word}</h2>

        {/* Play audio */}
        <button
          onClick={() => speak(currentWord.word)}
          className="mt-4 p-4 bg-primary text-white rounded-full shadow"
        >
          <Volume2 className="w-7 h-7" />
        </button>

        {/* Recording */}
        <div className="mt-8">
          {!recording ? (
            <button
              onClick={startRecording}
              className="px-8 py-3 bg-red-500 text-white font-bold rounded-full flex items-center gap-3 mx-auto"
            >
              <Mic /> Ghi âm
            </button>
          ) : (
            <p className="text-primary font-bold animate-pulse">
              🎤 Đang ghi...
            </p>
          )}
        </div>

        {/* Result */}
        {score !== null && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div>
              {score >= THRESHOLD ? (
                <HappyFace className="w-24 h-24" />
              ) : (
                <SadFace className="w-24 h-24" />
              )}
            </div>

            <p className="text-2xl font-bold">
              Điểm phát âm: <span>{score}</span>/100
            </p>

            {score >= THRESHOLD ? (
              <p className="text-green-600 font-bold mt-2">
                ✔️ Tốt! Chuyển sang từ tiếp theo
              </p>
            ) : (
              <p className="text-red-600 font-bold mt-2">
                ❌ Chưa đạt, hãy thử lại nhé
              </p>
            )}
          </div>
        )}

        {/* Next or Reset */}
        {score !== null && (
          <button
            onClick={nextWord}
            className="mt-8 px-10 py-3 bg-primary text-white rounded-full font-bold"
          >
            {round < 4 ? "Tiếp theo →" : "Chơi lại"}
          </button>
        )}
      </div>
    </div>
  );
}
// ...existing code...
