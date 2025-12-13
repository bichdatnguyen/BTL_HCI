import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function BookReader() {
  const { bookId } = useParams(); // Lấy ID từ URL (ví dụ: /read/65a1b2...)
  const navigate = useNavigate();

  // State lưu thông tin sách
  const [bookTitle, setBookTitle] = useState("Đang tải...");
  const [sentences, setSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State điều khiển Player
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Ref cho giọng đọc và scroll
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentSentenceRef = useRef<HTMLSpanElement>(null);
  const synth = window.speechSynthesis;

  // --- 1. GỌI API LẤY NỘI DUNG SÁCH ---
  useEffect(() => {
    const fetchBookContent = async () => {
      try {
        setIsLoading(true);
        // Gọi API với ID lấy từ URL
        const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
        if (!response.ok) {
          throw new Error("Không tìm thấy sách");
        }
        const data = await response.json();

        if (data) {
          setBookTitle(data.title || "Không có tên");

          // Lấy nội dung thô
          let rawContent = data.content || "Nội dung cuốn sách này đang được cập nhật.";

          // --- 🛠️ BỔ SUNG: LÀM SẠCH VĂN BẢN PDF ---
          // File PDF thường bị ngắt dòng lung tung. 
          // Lệnh này sẽ thay thế dấu xuống dòng (\n) bằng dấu cách.
          rawContent = rawContent.replace(/\n/g, " ").replace(/\s+/g, " ");
          // ----------------------------------------

          // Logic tách câu cũ của bạn vẫn giữ nguyên
          const splitText = rawContent.match(/[^.?!]+[.?!]+["']?|[^.?!]+$/g) || [rawContent];
          const cleanSentences = splitText.map((s: string) => s.trim()).filter((s: string) => s.length > 0);

          setSentences(cleanSentences);
        }
      } catch (error) {
        console.error("Lỗi:", error);
        setSentences(["Không thể tải nội dung sách. Vui lòng thử lại sau."]);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      fetchBookContent();
    }
  }, [bookId]);

  // --- 2. AUTO-SCROLL KHI ĐỌC ĐẾN CÂU MỚI ---
  useEffect(() => {
    if (currentSentenceRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = currentSentenceRef.current;

      // Lấy vị trí của element so với container
      const elementTop = element.offsetTop;
      const containerHeight = container.clientHeight;

      // Scroll sao cho câu đang đọc ở vị trí 1/3 từ trên
      const scrollPosition = Math.max(0, elementTop - containerHeight / 3);

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentSentenceIndex]);

  // --- 3. XỬ LÝ GIỌNG ĐỌC (AI) ---
  useEffect(() => {
    if (sentences.length === 0) return;

    // Hủy lệnh đọc cũ trước khi đọc câu mới
    synth.cancel();

    const textToRead = sentences[currentSentenceIndex];
    const utterance = new SpeechSynthesisUtterance(textToRead);

    utterance.lang = "vi-VN"; // Giọng đọc tiếng Việt
    utterance.rate = playbackRate;
    utterance.volume = isMuted ? 0 : 1;

    // Khi đọc xong 1 câu -> Tự chuyển sang câu tiếp theo
    utterance.onend = () => {
      if (currentSentenceIndex < sentences.length - 1 && isPlaying) {
        setCurrentSentenceIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false); // Hết bài thì dừng
      }
    };

    speechRef.current = utterance;

    // Nếu đang Play thì đọc luôn
    if (isPlaying) {
      synth.speak(utterance);
    }

    // Dọn dẹp khi thoát trang
    return () => {
      synth.cancel();
    };
  }, [currentSentenceIndex, sentences, playbackRate, isMuted, isPlaying]);

  // --- HÀM ĐIỀU KHIỂN ---
  const togglePlay = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const changeSpeed = () => {
    if (playbackRate === 1) setPlaybackRate(1.5);
    else if (playbackRate === 1.5)
      setPlaybackRate(0.75); // Đọc chậm
    else setPlaybackRate(1);
  };

  const progressPercentage =
    sentences.length > 0
      ? ((currentSentenceIndex + 1) / sentences.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#FDFCF6] flex flex-col">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-[#FDFCF6]/90 backdrop-blur-sm px-4 py-4 flex items-center gap-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 font-medium hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <h1 className="text-xl font-bold text-gray-800 line-clamp-1">
          📖 {bookTitle}
        </h1>
      </div>

      {/* NỘI DUNG SÁCH */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth px-4 md:px-8 py-8 pb-44"
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100 min-h-[60vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 mt-20">
                <div className="animate-spin text-2xl">⏳</div>
                <p>Đang tải nội dung...</p>
              </div>
            ) : (
              <div className="text-lg md:text-2xl leading-loose text-gray-700 font-medium text-justify">
                {sentences.map((sentence, index) => (
                  <span
                    key={index}
                    ref={
                      index === currentSentenceIndex ? currentSentenceRef : null
                    }
                    onClick={() => {
                      setCurrentSentenceIndex(index);
                      setIsPlaying(true);
                    }}
                    className={`
                      transition-all duration-300 rounded px-1 py-0.5 cursor-pointer hover:bg-gray-50
                      ${
                        index === currentSentenceIndex
                          ? "bg-[#FFF9C4] text-gray-900 shadow-sm decoration-2 underline-offset-4"
                          : ""
                      }
                    `}
                  >
                    {sentence}{" "}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THANH ĐIỀU KHIỂN (PLAYER) */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-6 py-6 rounded-t-[32px] border-t border-gray-100">
        <div className="max-w-3xl mx-auto relative">
          {/* Thanh tiến trình */}
          <div className="relative w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Các nút bấm */}
          <div className="flex items-center justify-between h-16">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">
              AI Reading
            </span>

            {/* Cụm nút trung tâm */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6 md:gap-8">
              {/* Nút Tốc độ */}
              <button
                onClick={changeSpeed}
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors"
              >
                {playbackRate}x
              </button>

              {/* Nút Play/Pause Chính */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center text-white shadow-xl shadow-green-200 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              {/* Nút Âm lượng */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Thời gian (Số câu) */}
            <div className="text-sm font-semibold text-gray-500 tabular-nums">
              {currentSentenceIndex + 1} / {sentences.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
