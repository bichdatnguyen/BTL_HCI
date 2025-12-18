import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { useSetPageHeader } from "@/contexts/HeaderContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react"; // Bỏ useEffect thừa
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const AVATAR_OPTIONS = ["🐶", "🐱", "🐰", "🐻", "🐨", "🐯", "🦁"];

export default function ManageProfiles() {
    const navigate = useNavigate();
    const { selectedProfile } = useProfile();
    const { toast } = useToast();
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

    // 1. SỬA Ở ĐÂY: Khởi tạo dữ liệu trực tiếp từ localStorage
    // Logic: Nếu trong bộ nhớ có tên mới thì lấy, nếu không thì mới lấy từ profile cũ
    const [formData, setFormData] = useState({
        name: localStorage.getItem("userName") || selectedProfile?.name || "",
        avatar: localStorage.getItem("userAvatar") || selectedProfile?.avatar || "🐶",
        birthday: localStorage.getItem("userBirthday") || "",
    });

    // 2. XÓA BỎ đoạn useEffect cũ (đoạn gây ra lỗi tự reset về tên cũ)
    /* useEffect(() => {
        if (selectedProfile) { ... } 
    }, ...); 
    --> XÓA ĐOẠN NÀY ĐI
    */

    useSetPageHeader({
        title: "Hồ sơ của tớ",
        subtitle: "",
        userName: formData.name.charAt(0).toUpperCase() || "T", // Lấy luôn từ form cho nhanh
        userAvatar: formData.avatar,
        streakCount: parseInt(localStorage.getItem("currentStreak") || "0"),
    });

    const handleAvatarSelect = (avatar: string) => {
        setFormData({ ...formData, avatar });
        setIsAvatarPickerOpen(false);
    };

    const handleSave = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        try {
            // Gọi API cập nhật vào Database (để lần sau đăng nhập vẫn còn)
            const response = await fetch("http://localhost:5000/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    name: formData.name,
                    avatar: formData.avatar,
                    birthday: formData.birthday
                }),
            });

            if (response.ok) {
                // QUAN TRỌNG: Cập nhật ngay vào localStorage
                localStorage.setItem("userName", formData.name);
                localStorage.setItem("userAvatar", formData.avatar);
                localStorage.setItem("userBirthday", formData.birthday);

                // Bắn sự kiện để cập nhật Header/Avatar Menu
                const event = new CustomEvent('user-updated', {
                    detail: { profile: { name: formData.name, avatar: formData.avatar } }
                });
                window.dispatchEvent(event);

                toast({
                    title: "Thành công!",
                    description: "Hồ sơ của bạn đã được cập nhật.",
                    className: "bg-green-600 text-white border-none"
                });
            } else {
                toast({ title: "Lỗi", description: "Không thể lưu hồ sơ." });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Lỗi", description: "Lỗi kết nối server." });
        }
    };

    const handleLogout = () => {
        // Xóa thông tin khi đăng xuất để tránh nhầm lẫn user khác
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userAvatar");
        localStorage.removeItem("userBirthday");
        localStorage.removeItem("role");
        localStorage.removeItem("streak");
        localStorage.removeItem("currentStreak");

        navigate("/login");
    };

    return (
        <div className="animate-fade-in min-h-screen flex items-center justify-center py-12">
            <div className="w-full max-w-md bg-card rounded-3xl shadow-lg p-8">
                {/* Avatar Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-muted rounded-full mb-4 text-6xl shadow-inner">
                        {formData.avatar}
                    </div>
                    <button
                        onClick={() => setIsAvatarPickerOpen(true)}
                        className="text-primary font-semibold hover:opacity-80 transition-opacity block w-full"
                    >
                        Đổi ảnh đại diện
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Tên của tớ
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full bg-background rounded-2xl px-6 py-3 text-lg font-medium text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Nhập tên của tớ"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Ngày sinh nhật
                        </label>
                        <input
                            type="date"
                            value={formData.birthday}
                            onChange={(e) =>
                                setFormData({ ...formData, birthday: e.target.value })
                            }
                            className="w-full bg-background rounded-2xl px-6 py-3 text-lg font-medium text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={localStorage.getItem("username_login") || "Chưa cập nhật"}
                            disabled
                            className="w-full bg-muted rounded-2xl px-6 py-3 text-lg font-medium text-muted-foreground border border-border cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3 mt-8">
                    <Button
                        onClick={handleSave}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Lưu thay đổi
                    </Button>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full border-red-200 text-red-500 hover:bg-red-50 py-6 rounded-2xl font-bold text-lg"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Đăng xuất
                    </Button>
                </div>
            </div>

            <Dialog open={isAvatarPickerOpen} onOpenChange={setIsAvatarPickerOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">Chọn bạn đồng hành</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4 py-4">
                        {AVATAR_OPTIONS.map((avatar) => (
                            <button
                                key={avatar}
                                onClick={() => handleAvatarSelect(avatar)}
                                className={`aspect-square text-4xl rounded-2xl transition-all hover:scale-110 active:scale-95 ${formData.avatar === avatar
                                    ? "bg-primary/20 ring-2 ring-primary"
                                    : "bg-gray-50 hover:bg-gray-100"
                                    }`}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}