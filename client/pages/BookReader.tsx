import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Settings } from "lucide-react";

// Dữ liệu giả lập nội dung sách (Vì database của bạn có thể chưa có nội dung text dài)
const SAMPLE_CONTENT = `Ngày xưa, trong một khu rừng xanh tươi, có một chú gấu nhỏ tên là Teddy. 
Chú là một chú gấu vui vẻ, thích khám phá những điều mới lạ và tìm kiếm những người bạn mới. 
Một hôm, Teddy gặp một chú sóc nhỏ tên là Squirrel đang ẩn trốn hạt dẻ. 
"Chào bạn!" Teddy nói. "Tôi tên là Teddy, bạn tên là gì?" 
Squirrel cười vui vẻ và trả lời: "Tôi là Squirrel, rất vui được gặp bạn mới!"`;

export default function BookReader() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ ---
  const [bookTitle, setBookTitle] = useState("Đang tải tên sách...");
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); // Tốc độ đọc (1x, 0.5x...)
  const [isMuted, setIsMuted] = useState(false);

  // Ref để điều khiển giọng đọc
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synth = window.speechSynthesis;

  // --- 2. MỚI THÊM: GỌI API LẤY THÔNG TIN SÁCH ---
  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
        const data = await response.json();

        if (data.title) {
          setBookTitle(data.title); // Cập nhật tên sách thật
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin sách:", error);
        setBookTitle("Không tìm thấy sách");
      }
    };

    if (bookId) {
      fetchBookDetail();
    }
  }, [bookId]);

  // --- 1. XỬ LÝ VĂN BẢN ĐẦU VÀO ---
  useEffect(() => {
    // Tách đoạn văn thành từng câu dựa vào dấu chấm, chấm hỏi, chấm than
    // (Đây là cách đơn giản, thực tế có thể phức tạp hơn)
    const splitText = SAMPLE_CONTENT.match(/[^.?!]+[.?!]+["']?|[^.?!]+$/g) || [];
    const cleanSentences = splitText.map(s => s.trim()).filter(s => s.length > 0);
    setSentences(cleanSentences);
  }, []);

  // --- 2. XỬ LÝ GIỌNG ĐỌC (AI) ---
  useEffect(() => {
    if (sentences.length === 0) return;

    // Hủy giọng đọc cũ nếu có
    synth.cancel();

    // Tạo đối tượng đọc mới cho câu hiện tại
    const textToRead = sentences[currentSentenceIndex];
    const utterance = new SpeechSynthesisUtterance(textToRead);

    utterance.lang = "vi-VN"; // Đặt ngôn ngữ tiếng Việt
    utterance.rate = playbackRate; // Tốc độ đọc
    utterance.volume = isMuted ? 0 : 1;

    // Sự kiện khi đọc xong 1 câu
    utterance.onend = () => {
      if (currentSentenceIndex < sentences.length - 1 && isPlaying) {
        setCurrentSentenceIndex(prev => prev + 1); // Chuyển sang câu tiếp theo
      } else {
        setIsPlaying(false); // Hết bài thì dừng
      }
    };

    speechRef.current = utterance;

    // Nếu đang trạng thái Play thì đọc luôn
    if (isPlaying) {
      synth.speak(utterance);
    }

    // Cleanup khi component bị hủy
    return () => {
      synth.cancel();
    };
  }, [currentSentenceIndex, sentences, playbackRate, isMuted, isPlaying]); // Chạy lại khi index hoặc setting thay đổi

  // --- CÁC HÀM ĐIỀU KHIỂN ---
  const togglePlay = () => {
    if (isPlaying) {
      synth.cancel(); // Dừng đọc
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // useEffect sẽ tự kích hoạt synth.speak()
    }
  };

  const changeSpeed = () => {
    // Vòng lặp tốc độ: 0.5 -> 1 -> 1.5 -> 0.5
    if (playbackRate === 0.5) setPlaybackRate(1);
    else if (playbackRate === 1) setPlaybackRate(1.5);
    else setPlaybackRate(0.5);
  };

  // Tính phần trăm tiến độ
  const progressPercentage = ((currentSentenceIndex + 1) / sentences.length) * 100;

  return (
    <div className="min-h-screen bg-[#FDFCF6] flex flex-col">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-[#FDFCF6] px-4 py-4 flex items-center gap-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 font-medium hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <h1 className="text-xl font-bold text-gray-800">
            {bookTitle}
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT (VĂN BẢN) */}
      <div className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full pb-40">
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 min-h-[500px]">
          <div className="text-lg md:text-xl leading-loose text-gray-600 font-medium space-y-4">
            {/* Render từng câu và kiểm tra để tô màu */}
            {sentences.map((sentence, index) => (
              <span
                key={index}
                onClick={() => {
                  // Cho phép click vào câu để đọc từ đó
                  setCurrentSentenceIndex(index);
                  setIsPlaying(true);
                }}
                className={`
                  transition-colors duration-300 rounded px-1 cursor-pointer
                  ${index === currentSentenceIndex
                    ? "bg-[#FFF9C4] text-gray-900" // Màu vàng highlight giống ảnh
                    : "hover:bg-gray-50"}
                `}
              >
                {sentence}{" "}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM PLAYER (THANH ĐIỀU KHIỂN) */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 py-6 rounded-t-3xl">
        <div className="max-w-3xl mx-auto relative"> {/* Thêm relative vào đây cho chắc chắn */}

          {/* Progress Bar */}
          {/* 👇 SỬA Ở ĐÂY: Đổi mb-4 thành mb-10 để tạo khoảng cách rộng hơn */}
          <div className="relative w-full h-2 bg-gray-200 rounded-full mb-10 cursor-pointer group">
            {/* Thêm vùng click ảo to hơn để dễ bấm tua trên điện thoại */}
            <div className="absolute -top-2 -bottom-2 w-full bg-transparent" />

            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />

            {/* Thêm cục tròn ở đầu thanh tiến trình cho đẹp (Optional) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white border-2 border-green-500 rounded-full shadow-sm"
              style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between h-14"> {/* Set chiều cao cố định h-14 để giữ khung */}
            {/* Left Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span>⏱ Thời gian đọc của AI</span>
            </div>

            {/* Center Play Button */}
            {/* Vẫn giữ absolute để nó luôn ở chính giữa màn hình bất kể 2 bên text dài ngắn */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
              {/* Speed Button */}
              <button
                onClick={changeSpeed}
                className="w-10 h-10 rounded-full border border-blue-500 text-blue-600 font-bold text-xs flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                {playbackRate}x
              </button>

              {/* Play/Pause Main Button */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center text-white shadow-xl shadow-green-200 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              {/* Volume Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Right Time Info */}
            <div className="text-sm font-medium text-gray-500 tabular-nums">
              {Math.floor(currentSentenceIndex / 2)}:{currentSentenceIndex % 2 === 0 ? "00" : "30"} / 05:00
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}