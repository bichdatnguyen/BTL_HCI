import { useEffect, useState } from "react";
import { Check, Mic, Volume2, RotateCcw } from "lucide-react";
import { useSetPageHeader } from "@/contexts/HeaderContext";

// 20 từ
const WORD_BANK = [
  { id: "1", word: "mèo" },
  { id: "2", word: "chó" },
  { id: "3", word: "cá" },
  { id: "4", word: "chim" },
  { id: "5", word: "cơm" },
  { id: "6", word: "sữa" },
  { id: "7", word: "chuối" },
  { id: "8", word: "táo" },
  { id: "9", word: "bóng" },
  { id: "10", word: "mũ" },
  { id: "11", word: "giày" },
  { id: "12", word: "tàu" },
  { id: "13", word: "bánh" },
  { id: "14", word: "sách" },
  { id: "15", word: "sao" },
  { id: "16", word: "trăng" },
  { id: "17", word: "tay" },
  { id: "18", word: "mắt" },
  { id: "19", word: "tai" },
  { id: "20", word: "mũi" },
];

// Mock API chấm điểm (tạm thời)
async function mockScore(word: string, audioBlob: Blob): Promise<number> {
  return Math.floor(60 + Math.random() * 40); // điểm 60–100
}

export default function PronunciationGame() {
  useSetPageHeader({
    title: "🔊 Luyện Âm Vị (Giọng Nói)",
    subtitle: "Nghe – Nói – Được chấm điểm tự động",
    userName: "T",
    streakCount: 5,
  });

  const [roundWords, setRoundWords] = useState(WORD_BANK.slice(0, 5));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const THRESHOLD = 70;

  useEffect(() => {
    const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
    setRoundWords(shuffled.slice(0, 5));
  }, []);

  const currentWord = roundWords[round];

  // TTS đọc từ
  const speak = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "vi-VN";
    msg.rate = 1;
    window.speechSynthesis.speak(msg);
  };

  // Bắt đầu ghi âm
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));

      // Gửi audio lên server scoring (tạm mock)
      const score = await mockScore(currentWord.word, blob);
      setScore(score);
    };

    recorder.start();
    setRecording(true);

    setTimeout(() => {
      recorder.stop();
      setRecording(false);
    }, 2000); // ghi 2 giây
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
    const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
    setRoundWords(shuffled.slice(0, 5));
    setRound(0);
    setScore(null);
    setAudioURL(null);
  };

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
          <div className="mt-6">
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
