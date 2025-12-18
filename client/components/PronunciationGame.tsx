import { useEffect, useState, useRef } from "react";
import { Mic, Volume2, Trophy, Home, RotateCcw, ArrowRight, RefreshCw, SkipForward } from "lucide-react"; // Thêm icon SkipForward
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { WORD_BANK, WordItem } from "@/data/wordBank";
import { useNavigate } from "react-router-dom";

// --- GIỮ NGUYÊN PHẦN HELPER & TYPE ---
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
  webkitSpeechGrammarList: any;
  SpeechGrammarList: any;
}

const levenshteinDistance = (a: string, b: string) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const calculateSimilarity = (s1: string, s2: string) => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 100;
  const editDistance = levenshteinDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
};

// --- COMPONENT CHÍNH ---
export default function PronunciationGame() {
  const currentStreak = parseInt(localStorage.getItem("currentStreak") || "0");
  const userName = localStorage.getItem("userName") || "Bạn nhỏ";
  const userAvatar = localStorage.getItem("userAvatar") || "";

  const navigate = useNavigate();

  // --- STATE MỚI: TÁCH BIỆT INDEX VÀ ĐIỂM SỐ ---
  const [roundWords, setRoundWords] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Đang ở từ thứ mấy (0-9)
  const [correctCount, setCorrectCount] = useState(0); // Số từ đạt chuẩn (để hiện thanh tiến độ)

  const [score, setScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isGameFinished, setIsGameFinished] = useState(false);
  const interimTranscriptRef = useRef("");

  const PASS_THRESHOLD = 80;

  useSetPageHeader({
    title: "🔊 Luyện Âm Vị (Chấm Điểm)",
    subtitle: "Đạt trên 80 điểm để được tính tích lũy",
    userName: userName,
    userAvatar: userAvatar,
    streakCount: currentStreak,
  });

  const generateWords = () => {
    // Sửa lại số lượng: 2 Dễ + 2 Vừa + 1 Khó = 5 câu
    const easyWords = WORD_BANK.filter((w) => w.difficulty === "easy").sort(() => Math.random() - 0.5).slice(0, 3);
    const mediumWords = WORD_BANK.filter((w) => w.difficulty === "medium").sort(() => Math.random() - 0.5).slice(0, 1);
    const hardWords = WORD_BANK.filter((w) => w.difficulty === "hard").sort(() => Math.random() - 0.5).slice(0, 1);

    const combined = [...easyWords, ...mediumWords, ...hardWords].sort(() => Math.random() - 0.5);
    setRoundWords(combined);
  };

  useEffect(() => {
    generateWords();
  }, []);

  // Lấy từ hiện tại dựa theo Index
  const currentWord = roundWords[currentWordIndex];

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "vi-VN";
    msg.rate = 0.8;
    window.speechSynthesis.speak(msg);
  };

  // --- LOGIC GHI ÂM (GIỮ NGUYÊN) ---
  const startListening = () => {
    const { webkitSpeechRecognition, SpeechRecognition, webkitSpeechGrammarList, SpeechGrammarList } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;
    const SpeechGrammarListApi = SpeechGrammarList || webkitSpeechGrammarList;

    if (!SpeechRecognitionApi) return;

    const recognition = new SpeechRecognitionApi();

    if (SpeechGrammarListApi && currentWord) {
      const speechRecognitionList = new SpeechGrammarListApi();
      const grammar = `#JSGF V1.0; grammar word; public <word> = ${currentWord.word.toLowerCase()} ;`;
      speechRecognitionList.addFromString(grammar, 10);
      recognition.grammars = speechRecognitionList;
    }

    recognition.lang = "vi-VN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;

    setUserSpokenText("");
    setScore(null);
    setFeedbackMessage("");
    interimTranscriptRef.current = "";

    try { recognition.start(); } catch (e) { console.error(e); }

    recognition.onstart = () => { setIsListening(true); };

    recognition.onresult = (event: any) => {
      const results = event.results[event.resultIndex];
      let bestTranscript = results[0].transcript.toLowerCase().trim().normalize("NFC");
      setUserSpokenText(bestTranscript);
      interimTranscriptRef.current = bestTranscript;
      if (results.isFinal) {
        recognition.stop();
        handleScoring(bestTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (score === null && interimTranscriptRef.current) {
        handleScoring(interimTranscriptRef.current);
      } else if (score === null && !interimTranscriptRef.current) {
        setFeedbackMessage("Bạn nói lại to hơn chút nhé! 👂");
      }
    };

    recognition.onerror = (event: any) => { setIsListening(false); };
  };

  const handleScoring = (spokenText: string) => {
    const target = currentWord.word.toLowerCase().trim().normalize("NFC");
    const sim = calculateSimilarity(spokenText, target);
    evaluateWithFuzzyLogic(sim);
  };

  const evaluateWithFuzzyLogic = (similarity: number) => {
    let finalScore = 0;
    if (similarity >= 100) finalScore = 100;
    else if (similarity >= 85) finalScore = 90;
    else if (similarity >= 70) finalScore = 80;
    else if (similarity >= 50) finalScore = 60;
    else finalScore = Math.floor(Math.random() * 40);
    setScore(finalScore);
  };

  // --- LOGIC ĐIỀU HƯỚNG MỚI ---

  const resetStateForNewTurn = () => {
    setScore(null);
    setUserSpokenText("");
    setFeedbackMessage("");
    interimTranscriptRef.current = "";
  };

  // 1. KHI ĐẠT > 80 HOẶC CHỌN QUA CÂU TIẾP (NHƯNG ĐƯỢC CỘNG ĐIỂM)
  const handlePassAndNext = () => {
    setCorrectCount(prev => prev + 1); // CỘNG ĐIỂM ĐẠT CHUẨN
    moveToNextWord();
  };

  // 2. KHI CHỌN "BỎ QUA / CÂU TIẾP" (KHÔNG CỘNG ĐIỂM)
  const handleSkip = () => {
    // KHÔNG CỘNG correctCount
    moveToNextWord();
  };

  // Logic chung để chuyển index
  const moveToNextWord = () => {
    if (currentWordIndex < roundWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      resetStateForNewTurn();
    } else {
      finishGame();
    }
  };

  // 3. KHI CHỌN "THỬ LẠI" (Ở YÊN INDEX CŨ)
  const handleRetry = () => {
    resetStateForNewTurn();
  };

  const finishGame = () => {
    setIsGameFinished(true);
  };

  const handleRestart = () => {
    setIsGameFinished(false);
    setCurrentWordIndex(0);
    setCorrectCount(0);
    resetStateForNewTurn();
    generateWords();
  };

  // --- UI COMPONENTS ---
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

  // --- BIẾN ĐỂ HIỂN THỊ TỔNG SỐ CÂU (Mặc định là 5 nếu chưa tải xong dữ liệu) ---
  const TOTAL_QUESTIONS = roundWords.length > 0 ? roundWords.length : 5;

  if (isGameFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card w-full max-w-lg rounded-[32px] p-8 md:p-12 shadow-xl border-2 border-border text-center animate-in zoom-in duration-300">
          <div className="text-6xl mb-6 text-yellow-500"><Trophy size={80} className="mx-auto" /></div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Hoàn thành!</h2>
          <p className="text-muted-foreground text-lg mb-6">Kết quả buổi luyện tập của bạn.</p>

          <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">Số câu đạt chuẩn</p>
            {/* Sửa hiển thị kết quả tổng */}
            <p className="text-5xl font-black text-primary">{correctCount}/{TOTAL_QUESTIONS}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleRestart} className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 flex items-center justify-center gap-2 shadow-md">
              <RotateCcw className="w-6 h-6" /> Luyện lại
            </button>
            <button onClick={() => navigate("/games")} className="w-full py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:bg-secondary/80 flex items-center justify-center gap-2">
              <Home className="w-5 h-5" /> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) return <div className="min-h-screen p-6 bg-background flex justify-center items-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen p-6 bg-background flex justify-center">
      <div className="max-w-xl w-full bg-card p-6 rounded-3xl shadow-lg text-center h-fit border border-border">

        {/* THANH TIẾN ĐỘ: DỰA TRÊN TỔNG SỐ CÂU MỚI (5) */}
        <div className="mb-6 flex justify-between items-center text-sm font-semibold text-muted-foreground">
          <span>Đạt chuẩn</span>
          <span className="text-primary font-bold text-lg">{correctCount}/{TOTAL_QUESTIONS}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-10">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(correctCount / TOTAL_QUESTIONS) * 100}%` }}
          ></div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{currentWord.word}</h2>

        <button onClick={() => speak(currentWord.word)} className="mb-8 p-4 bg-secondary text-secondary-foreground rounded-full shadow hover:bg-secondary/80 transition-colors">
          <Volume2 className="w-8 h-8" />
        </button>

        <div className="mt-4 min-h-[100px]">
          {!isListening ? (
            <button
              onClick={startListening}
              disabled={score !== null}
              className={`px-10 py-4 font-bold text-lg rounded-full flex items-center gap-3 mx-auto shadow-lg transition-all ${score !== null ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-destructive text-white hover:bg-destructive/90 hover:scale-105'
                }`}
            >
              <Mic className="w-6 h-6" /> {score !== null ? 'Đã chấm điểm' : 'Bấm để nói'}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse border-2 border-red-500">
                <Mic className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-destructive font-bold animate-pulse">Đang nghe...</p>
            </div>
          )}
        </div>

        {feedbackMessage && (
          <div className="mt-4 animate-bounce">
            <p className="text-orange-600 font-bold text-lg bg-orange-50 px-6 py-2 rounded-full inline-block border border-orange-200">{feedbackMessage}</p>
          </div>
        )}

        {score !== null && (
          <div className="mt-6 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
            {userSpokenText && (
              <div className="bg-muted/50 px-6 py-3 rounded-xl border border-muted">
                <p className="text-sm text-muted-foreground mb-1">Máy nghe được:</p>
                <p className="font-bold text-foreground text-xl capitalize">"{userSpokenText}"</p>
              </div>
            )}

            <div className="py-2">
              {score >= PASS_THRESHOLD ? <HappyFace className="w-24 h-24" /> : <SadFace className="w-24 h-24" />}
            </div>

            <div className="text-center">
              <p className={`text-4xl font-black mb-1 ${score >= PASS_THRESHOLD ? 'text-green-600' : 'text-red-500'}`}>
                {score}/100
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Điểm chuẩn xác</p>
            </div>

            {score >= PASS_THRESHOLD ? (
              // --- TRƯỜNG HỢP ĐẬU (>80) ---
              <div className="w-full">
                <p className="text-green-700 font-bold bg-green-100 px-4 py-2 rounded-lg border border-green-200 mb-6">
                  🎉 Tuyệt vời! Bạn được cộng 1 điểm.
                </p>
                <button
                  onClick={handlePassAndNext}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {currentWordIndex < roundWords.length - 1 ? "Từ tiếp theo" : "Xem kết quả"} <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            ) : (
              // --- TRƯỜNG HỢP RỚT (<80): HIỆN 2 NÚT ---
              <div className="w-full flex flex-col gap-3">
                <p className="text-red-700 font-bold bg-red-100 px-4 py-2 rounded-lg border border-red-200 mb-2">
                  🤔 Chưa đạt 80 điểm. Bạn muốn thử lại không?
                </p>

                {/* Nút Thử Lại (Ưu tiên) */}
                <button
                  onClick={handleRetry}
                  className="w-full py-4 bg-orange-500 text-white rounded-full font-bold text-xl hover:bg-orange-600 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-6 h-6" /> Thử lại ngay
                </button>

                {/* Nút Bỏ Qua (Thứ cấp) */}
                <button
                  onClick={handleSkip}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-full font-bold text-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <SkipForward className="w-5 h-5" /> Bỏ qua, sang câu tiếp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}