import { useState, useEffect } from "react";
import { Users, BookOpen, FileText } from "lucide-react";
import { ModerationCard, PendingBook } from "@/components/ModerationCard";
import { BookDetailModal } from "@/components/BookDetailModal";
import { ActivityLog, Activity } from "@/components/ActivityLog";
import { AdminStatCard } from "@/components/AdminStatCard";

// Mock data for recent activities
const RECENT_ACTIVITIES: Activity[] = [
    {
        id: "1",
        message: "User A vừa đăng ký tài khoản.",
        timestamp: "2 phút trước",
        type: "user",
    },
    // ... các activity mẫu khác giữ nguyên
];

// 👉 SỬA LỖI Ở ĐÂY: Tạo một interface mới kế thừa PendingBook và thêm các trường còn thiếu
interface ExtendedPendingBook extends PendingBook {
    fullText?: string;
    description?: string;
}

export default function AdminDashboard() {
    // Sử dụng ExtendedPendingBook thay vì PendingBook gốc
    const [pendingBooks, setPendingBooks] = useState<ExtendedPendingBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<ExtendedPendingBook | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userCount, setUserCount] = useState<number | string>("...");

    // Gọi API lấy số lượng người dùng
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/stats/users");
                const data = await response.json();
                setUserCount(data.count);
            } catch (error) {
                console.error("Lỗi lấy thống kê:", error);
            }
        };
        fetchStats();
    }, []);

    // Gọi API lấy danh sách sách chờ duyệt
    useEffect(() => {
        const fetchPendingBooks = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/admin/pending-books");
                const data = await response.json();

                // Map dữ liệu và ép kiểu sang ExtendedPendingBook
                const formattedBooks: ExtendedPendingBook[] = data.map((book: any) => ({
                    id: book._id,
                    title: book.title,
                    author: book.author || "Đóng góp",
                    uploadedBy: book.uploadedBy || "Ẩn danh",
                    thumbnail: book.coverUrl || "📚",
                    status: book.status,
                    // Bây giờ thêm fullText sẽ không bị lỗi nữa
                    description: "Mô tả sách (đang cập nhật chức năng này).",
                    fullText: book.content || "Chưa có nội dung chi tiết.",
                }));

                setPendingBooks(formattedBooks);
            } catch (error) {
                console.error("Lỗi tải sách chờ duyệt:", error);
            }
        };
        fetchPendingBooks();
    }, []);

    const handleViewBook = (bookId: string) => {
        const book = pendingBooks.find((b) => b.id === bookId);
        if (book) {
            setSelectedBook(book);
            setIsModalOpen(true);
        }
    };

    // Xử lý Duyệt sách
    const handleApprove = async (bookId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/approve/${bookId}`, {
                method: "PUT",
            });

            if (response.ok) {
                setPendingBooks((prev) => prev.filter((b) => b.id !== bookId));
                setIsModalOpen(false);
                setSelectedBook(null);
            }
        } catch (error) {
            console.error("Lỗi kết nối server khi duyệt:", error);
        }
    };

    // Xử lý Từ chối sách
    const handleReject = async (bookId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/reject/${bookId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setPendingBooks((prev) => prev.filter((b) => b.id !== bookId));
                setIsModalOpen(false);
                setSelectedBook(null);
            }
        } catch (error) {
            console.error("Lỗi kết nối server khi từ chối:", error);
        }
    };

    return (
        <div className="animate-fade-in space-y-12">
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <AdminStatCard
                    icon={<Users className="w-16 h-16" />}
                    label="Người dùng hệ thống"
                    value={userCount}
                />
                <AdminStatCard
                    icon={<BookOpen className="w-16 h-16" />}
                    label="Tổng số sách"
                    value="340"
                />
                <AdminStatCard
                    icon={<FileText className="w-16 h-16" />}
                    label="Sách chờ duyệt"
                    value={pendingBooks.length}
                    highlight={true}
                />
            </div>

            {/* Book Moderation Section */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Duyệt sách đóng góp</h2>
                <div className="space-y-4">
                    {pendingBooks.map((book) => (
                        <ModerationCard
                            key={book.id}
                            book={book} // Truyền vào component con vẫn ok vì nó chỉ lấy những trường nó cần
                            onView={handleViewBook}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>

                {pendingBooks.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            Không có sách nào cần duyệt 🎉
                        </p>
                    </div>
                )}
            </section>

            {/* Recent Activity Section */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Hoạt động gần đây</h2>
                <ActivityLog activities={RECENT_ACTIVITIES} />
            </section>

            {/* Book Detail Modal */}
            <BookDetailModal
                book={selectedBook}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onApprove={handleApprove}
                onReject={handleReject}
                bookDetails={
                    selectedBook ? {
                        description: selectedBook.description || "",
                        fullText: selectedBook.fullText || "", // Lấy từ object mở rộng
                    } : undefined
                }
            />
        </div>
    );
}