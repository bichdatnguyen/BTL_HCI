import { useState, useEffect } from "react"; // 1. Thêm dòng này
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { useProfile } from "@/contexts/ProfileContext";
import { ProgressSection } from "@/components/ProgressSection";
import { GamesSection } from "@/components/GamesSection";
import { LibrarySection } from "@/components/LibrarySection";

export default function Index() {
  const { selectedProfile } = useProfile();

  // 2. Tạo biến lưu streak (mặc định là 0)
  const [streak, setStreak] = useState(0);

  // 3. Lấy dữ liệu từ bộ nhớ khi trang vừa tải xong
  useEffect(() => {
    const savedStreak = localStorage.getItem("currentStreak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak)); // Chuyển chữ thành số
    }
  }, []);

  // 4. Cập nhật Header với số streak thật
  useSetPageHeader({
    title: "Xin chào! 👋",
    subtitle: `Hôm nay ${selectedProfile?.name} sẽ học gì?`,
    userName: selectedProfile?.initials || "T",
    streakCount: streak, // <--- ĐỔI TỪ SỐ 5 THÀNH BIẾN streak
  });

  return (
    <div className="animate-fade-in">
      <ProgressSection />
      <GamesSection />
      <LibrarySection />
    </div>
  );
}