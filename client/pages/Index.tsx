import { useState, useEffect } from "react";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { useProfile } from "@/contexts/ProfileContext";
import { ProgressSection } from "@/components/ProgressSection";
import { GamesSection } from "@/components/GamesSection";
import { LibrarySection } from "@/components/LibrarySection";

export default function Index() {
  const { selectedProfile } = useProfile();

  // 1. Tạo state để lưu tên và streak
  const [streak, setStreak] = useState(0);
  const [displayName, setDisplayName] = useState("bạn nhỏ"); // Tên mặc định

  // 2. Lấy dữ liệu từ localStorage khi trang vừa tải
  useEffect(() => {
    // Lấy Streak
    const savedStreak = localStorage.getItem("currentStreak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }

    // --- MỚI THÊM: Lấy Tên hiển thị ---
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setDisplayName(savedName);
    } else if (selectedProfile?.name) {
      // Nếu không có trong bộ nhớ thì lấy từ Profile Context (nếu có)
      setDisplayName(selectedProfile.name);
    }
    // ----------------------------------
  }, [selectedProfile]);

  // 3. Cập nhật Header với tên thật
  useSetPageHeader({
    title: "Xin chào! 👋",
    // Sửa dòng này: Thay chữ cứng hoặc biến cũ bằng biến `displayName`
    subtitle: `Hôm nay ${displayName} sẽ học gì?`,
    userName: selectedProfile?.initials || displayName.charAt(0).toUpperCase() || "T",
    streakCount: streak,
  });

  return (
    <div className="animate-fade-in">
      <ProgressSection />
      <GamesSection />
      <LibrarySection />
    </div>
  );
}