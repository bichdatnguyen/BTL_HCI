import { useEffect, useState, useRef } from "react";
import { Mic, Volume2, Trophy, Home, RotateCcw } from "lucide-react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { WORD_BANK, WordItem } from "@/data/wordBank";
import { useNavigate } from "react-router-dom";

// --- ĐỊNH NGHĨA KIỂU CHO WEB SPEECH API ---
// (Vì TypeScript mặc định chưa hỗ trợ đầy đủ API này)
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export default function PronunciationGame() {
  const currentStreak = parseInt(localStorage.getItem("currentStreak") || "0");
  const userName = localStorage.getItem("userName") || "Bạn nhỏ";
  const userAvatar = localStorage.getItem("userAvatar") || "";

  const navigate = useNavigate();
  useSetPageHeader({
    title: "🔊 Luyện Âm Vị (Giọng Nói)",
    subtitle: "Nghe – Nói – Được chấm điểm tự động",
    userName: userName,      // Thay vì "T"
    userAvatar: userAvatar,  // Để hiện đúng avatar
    streakCount: currentStreak,
  });

  const [roundWords, setRoundWords] = useState<WordItem[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState<string>(""); // Lưu từ bạn đã nói

  // Trạng thái kết thúc game
  const [isGameFinished, setIsGameFinished] = useState(false);

  // Điểm đạt yêu cầu
  const THRESHOLD = 70;

  const generateWords = () => {
    const easyWords = WORD_BANK.filter((w) => w.difficulty === "easy")
      .sort(() => Math.random() - 0.5).slice(0, 4);
    const mediumWords = WORD_BANK.filter((w) => w.difficulty === "medium")
      .sort(() => Math.random() - 0.5).slice(0, 3);
    const hardWords = WORD_BANK.filter((w) => w.difficulty === "hard")
      .sort(() => Math.random() - 0.5).slice(0, 3);

    const combined = [...easyWords, ...mediumWords, ...hardWords].sort(
      () => Math.random() - 0.5,
    );
    setRoundWords(combined);
  };

  useEffect(() => {
    generateWords();
  }, []);

  const currentWord = roundWords[round];

  // --- TTS ĐỌC MẪU ---
  const speak = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "vi-VN";
    msg.rate = 0.8; // Đọc chậm một chút cho bé nghe rõ
    window.speechSynthesis.speak(msg);
  };

  // --- XỬ LÝ GHI ÂM & CHẤM ĐIỂM THẬT (Dùng Web Speech API) ---
  const startListening = () => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = "vi-VN"; // Thiết lập ngôn ngữ Tiếng Việt
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setUserSpokenText("");
    setScore(null);

    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      const confidence = event.results[0][0].confidence; // Độ tự tin của AI (0.0 - 1.0)

      setUserSpokenText(transcript);
      evaluatePronunciation(transcript, currentWord.word.toLowerCase());
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Lỗi nhận diện:", event.error);
      setIsListening(false);

      if (event.error === 'no-speech') {
        setUserSpokenText("(Không nghe thấy gì)");
        setScore(0);
      }
    };
  };

  // --- HÀM CHẤM ĐIỂM ---
  const evaluatePronunciation = (spoken: string, target: string) => {
    // 1. Loại bỏ dấu câu thừa nếu có để so sánh chính xác hơn
    const cleanSpoken = spoken.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const cleanTarget = target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

    if (cleanSpoken === cleanTarget) {
      // Đúng tuyệt đối
      setScore(100);
    } else if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
      // Gần đúng (ví dụ: nói "con cá" khi từ là "cá")
      setScore(80);
    } else {
      // Sai hoàn toàn -> Random điểm thấp để khuyến khích thử lại
      setScore(Math.floor(Math.random() * 40));
    }
  };

  const nextWord = () => {
    if (round < 9) {
      setRound(prev => prev + 1);
      setScore(null);
      setUserSpokenText("");
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsGameFinished(true);
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch("http://localhost:5000/api/users/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "game", value: 1 })
      }).catch(err => console.error("Lỗi cập nhật tiến độ:", err));
    }
  };

  const handleRestart = () => {
    setIsGameFinished(false);
    setRound(0);
    setScore(null);
    setUserSpokenText("");
    generateWords();
  };

  const handleQuit = () => {
    navigate("/games");
  };

  // --- SVG ICONS ---
  const HappyFace = ({ className = "w-20 h-20" }: { className?: string }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="30" fill="#D1FAE5" />
      <path d="M20 26c0 3 4 3 4 0" stroke="#065F46" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 26c0 3-4 3-4 0" stroke="#065F46" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 42c6 6 18 6 24 0" stroke="#065F46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const SadFace = ({ className = "w-20 h-20" }: { className?: string }) => (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="30" fill="#FEE2E2" />
      <path d="M20 26c0 3 4 3 4 0" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 26c0 3-4 3-4 0" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 46c6-6 18-6 24 0" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card w-full max-w-lg rounded-[32px] p-8 md:p-12 shadow-xl border-2 border-border text-center animate-in zoom-in duration-300">
          <div className="text-6xl mb-6 text-yellow-500">
            <Trophy size={80} className="mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Tuyệt vời!</h2>
          <p className="text-muted-foreground text-lg mb-6">Bạn đã hoàn thành bài luyện nói hôm nay.</p>

          <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">Kết quả</p>
            <p className="text-5xl font-black text-primary">10/10</p>
            <p className="text-sm text-muted-foreground mt-2">Từ vựng đã luyện</p>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleRestart} className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 flex items-center justify-center gap-2 shadow-md">
              <RotateCcw className="w-6 h-6" /> Luyện lại
            </button>
            <button onClick={handleQuit} className="w-full py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:bg-secondary/80 flex items-center justify-center gap-2">
              <Home className="w-5 h-5" /> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) return <div className="min-h-screen p-6 bg-background flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-background flex justify-center">
      <div className="max-w-xl w-full bg-card p-6 rounded-3xl shadow-lg text-center h-fit border border-border">

        {/* Progress Bar */}
        <div className="mb-6 flex justify-between items-center text-sm font-semibold text-muted-foreground">
          <span>Tiến độ</span>
          <span>{round + 1}/10</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-10">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${((round + 1) / 10) * 100}%` }}></div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{currentWord.word}</h2>

        {/* Play audio */}
        <button
          onClick={() => speak(currentWord.word)}
          className="mb-8 p-4 bg-secondary text-secondary-foreground rounded-full shadow hover:bg-secondary/80 transition-colors"
          title="Nghe đọc mẫu"
        >
          <Volume2 className="w-8 h-8" />
        </button>

        {/* Recording Area */}
        <div className="mt-4">
          {!isListening ? (
            <button
              onClick={startListening}
              className="px-10 py-4 bg-destructive text-white font-bold text-lg rounded-full flex items-center gap-3 mx-auto shadow-lg hover:bg-destructive/90 transition-all hover:scale-105"
            >
              <Mic className="w-6 h-6" /> Bấm để nói
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse border-2 border-red-500">
                <Mic className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-destructive font-bold">Đang nghe...</p>
            </div>
          )}
        </div>

        {/* Result Feedback */}
        {score !== null && (
          <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Hiển thị từ bạn nói */}
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-muted-foreground">Bạn nói: <span className="font-bold text-foreground text-lg">"{userSpokenText}"</span></p>
            </div>

            <div>
              {score >= THRESHOLD ? <HappyFace className="w-24 h-24" /> : <SadFace className="w-24 h-24" />}
            </div>

            <div className="text-center">
              <p className="text-3xl font-black text-primary mb-1">{score}/100</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Điểm phát âm</p>
            </div>

            {score >= THRESHOLD ? (
              <p className="text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg">🎉 Tuyệt vời! Bạn nói rất chuẩn.</p>
            ) : (
              <p className="text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg">🤔 Hình như chưa đúng lắm.</p>
            )}

            <button
              onClick={nextWord}
              className="mt-6 w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 shadow-lg transition-all"
            >
              {round < 9 ? "Từ tiếp theo →" : "Xem kết quả 🏆"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}