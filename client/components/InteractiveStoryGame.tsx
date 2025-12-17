import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { stories, Story } from "@/data/storyData";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// CẤU HÌNH
const POINTS_PER_CORRECT = 10;

export function InteractiveStoryGame() {
    const navigate = useNavigate();

    // --- STATE QUẢN LÝ ---
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [currentSceneId, setCurrentSceneId] = useState("");
    const [score, setScore] = useState(0);

    // --- STATE AI VOICE ---
    const [isPlaying, setIsPlaying] = useState(false);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [showEndModal, setShowEndModal] = useState(false);

    // Thiết lập Header trang
    useSetPageHeader({
        title: selectedStory ? selectedStory.title : "📚 Thư Viện Truyện",
        subtitle: "Đọc và lựa chọn con đường cho câu chuyện",
        userName: "T",
        streakCount: 5,
    });

    // --- LOGIC TÍNH SAO (Chỉ để hiển thị kết quả cuối game) ---
    const calculateResult = () => {
        const stars = Math.floor(score / POINTS_PER_CORRECT);
        return { stars };
    };
    const result = calculateResult();

    // --- XỬ LÝ KHI KẾT THÚC GAME ---
    const currentScene = selectedStory?.scenes.find((s) => s.id === currentSceneId);
    const isEndScene = currentScene?.type === 'victory' || currentScene?.type === 'game_over';

    useEffect(() => {
        if (isEndScene) {
            setShowEndModal(true);
            stopTTS();
        }
    }, [isEndScene]);

    // --- CÁC HÀM HỖ TRỢ (Voice, Logic chọn) ---
    const stopTTS = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    const speakText = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlaying(false);
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
    };

    const toggleTTS = () => {
        if (isPlaying) stopTTS();
        else if (currentScene) speakText(currentScene.text);
    };

    useEffect(() => stopTTS(), [currentSceneId, selectedStory]);

    const handleSelectStory = (story: Story) => {
        setSelectedStory(story);
        setCurrentSceneId(story.scenes[0].id);
        setScore(0);
        setShowEndModal(false);
        stopTTS();
    };

    const handleBackToMenu = () => {
        stopTTS();
        setSelectedStory(null);
        setScore(0);
        setShowEndModal(false);
    };

    const handleChoice = (nextSceneId: string, isCorrect?: boolean) => {
        if (isCorrect) setScore((prev) => prev + POINTS_PER_CORRECT);
        setCurrentSceneId(nextSceneId);
    };

    // ==========================================
    // RENDER UI
    // ==========================================

    // 1. MÀN HÌNH MENU CHỌN TRUYỆN
    if (!selectedStory) {
        return (
            <div className="p-4 w-full max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
                {/* NÚT QUAY LẠI TRANG TRƯỚC */}
                <div className="mb-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/games")} // Quay về trang danh sách Game
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-2 pl-0 hover:bg-transparent"
                    >
                        <ArrowLeft className="h-6 w-6" />
                        <span className="text-lg font-semibold">Quay lại Games</span>
                    </Button>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Chọn câu chuyện của bé</h2>
                    <p className="text-slate-500 mt-1">Lựa chọn 1 trong các truyện dưới đây để bắt đầu</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            onClick={() => handleSelectStory(story)}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-500 flex flex-col h-full group"
                        >
                            <div className="h-56 overflow-hidden relative">
                                <img
                                    src={story.coverImage}
                                    alt={story.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-green-600 transition-colors">{story.title}</h3>
                                <p className="text-sm text-slate-500 flex-grow leading-relaxed">{story.description}</p>
                                <Button className="mt-6 w-full bg-slate-800 group-hover:bg-green-600 transition-colors">
                                    Đọc ngay
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!currentScene) return <div className="p-10 text-center">Đang tải câu chuyện...</div>;

    // 2. MÀN HÌNH GAMEPLAY
    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto pb-10 animate-in fade-in zoom-in duration-300">
            <div className="w-full flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={handleBackToMenu} className="text-slate-600">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Chọn truyện khác
                </Button>
                <div className="font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                    Điểm: <span className="text-green-600">{score}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md w-full mb-6 relative border border-slate-100">
                <div className="w-full h-72 overflow-hidden rounded-xl mb-6 bg-slate-50 shadow-inner">
                    <img src={currentScene.image} alt="Scene" className="w-full h-full object-cover" />
                </div>

                <div className="absolute top-8 right-8 z-10">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={toggleTTS}
                        className={`rounded-full shadow-lg border border-slate-100 ${isPlaying ? 'bg-green-100 text-green-600 ring-2 ring-green-400' : 'bg-white text-slate-700'}`}
                    >
                        {isPlaying ? <Volume2 className="h-6 w-6 animate-pulse" /> : <VolumeX className="h-6 w-6" />}
                    </Button>
                </div>

                <h3 className="text-2xl font-bold mb-3 text-slate-800">{currentScene.title}</h3>
                <p className="text-lg text-slate-600 leading-8 min-h-[80px]">{currentScene.text}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {currentScene.choices?.map((choice, index) => (
                    <Button
                        key={index}
                        onClick={() => handleChoice(choice.nextSceneId, choice.isCorrect)}
                        className="py-8 text-lg h-auto justify-start px-6 border-2 hover:border-green-500 whitespace-normal text-left shadow-sm bg-white hover:bg-green-50 text-slate-700"
                        variant="outline"
                    >
                        <span className="mr-3 font-bold text-white bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-sm shrink-0">
                            {String.fromCharCode(65 + index)}
                        </span>
                        {choice.text}
                    </Button>
                ))}
            </div>

            {/* Modal Kết Thúc */}
            <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <DialogTitle className="text-3xl text-center mb-2">
                            {result.stars === 5 ? "🎉 Xuất sắc! 🎉" : "🏁 Hoàn thành!"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-center gap-2 py-6 animate-in zoom-in duration-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={48}
                                className={`transition-all duration-700 ${star <= result.stars ? "fill-yellow-400 text-yellow-400 scale-110 drop-shadow-md" : "text-slate-200"}`}
                            />
                        ))}
                    </div>

                    <p className="text-lg text-slate-600 mb-6 px-4">
                        Bạn đạt được {result.stars} sao. {result.stars === 5 ? "Bé thật giỏi!" : "Cố gắng lên nhé!"}
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={() => { setScore(0); setCurrentSceneId(selectedStory.scenes[0].id); setShowEndModal(false); }}
                            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-200"
                        >
                            Chơi lại truyện này
                        </Button>
                        <Button onClick={handleBackToMenu} variant="outline" className="w-full py-6 text-lg border-slate-300">
                            Chọn truyện khác
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}