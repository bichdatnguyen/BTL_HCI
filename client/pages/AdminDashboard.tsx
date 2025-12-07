import { useState } from "react";
import { Users, BookOpen, FileText } from "lucide-react";
import { ModerationCard, PendingBook } from "@/components/ModerationCard";
import { BookDetailModal } from "@/components/BookDetailModal";
import { ActivityLog, Activity } from "@/components/ActivityLog";
import { AdminStatCard } from "@/components/AdminStatCard";

// Mock data for pending books
const PENDING_BOOKS: PendingBook[] = [
    {
        id: "1",
        title: "Câu chuyện con gà",
        author: "Nguyễn Văn A",
        uploadedBy: "user_123",
        thumbnail: "🐔",
        status: "pending",
    },
    {
        id: "2",
        title: "Phiêu lưu trong rừng",
        author: "Trần Thị B",
        uploadedBy: "user_456",
        thumbnail: "🌲",
        status: "pending",
    },
    {
        id: "3",
        title: "Những ngôi sao trong đêm",
        author: "Hoàng Văn C",
        uploadedBy: "user_789",
        thumbnail: "⭐",
        status: "pending",
    },
];

// Mock data for recent activities
const RECENT_ACTIVITIES: Activity[] = [
    {
        id: "1",
        message: "User A vừa đăng ký tài khoản.",
        timestamp: "2 phút trước",
        type: "user",
    },
    {
        id: "2",
        message: "Sách \"Dế Mèn\" đã được duyệt và xuất bản.",
        timestamp: "15 phút trước",
        type: "book",
    },
    {
        id: "3",
        message: "User B hoàn thành bài tập \"Ghép Từ\".",
        timestamp: "30 phút trước",
        type: "exercise",
    },
    {
        id: "4",
        message: "Hệ thống sao lưu dữ liệu thành công.",
        timestamp: "1 giờ trước",
        type: "system",
    },
    {
        id: "5",
        message: "User C tải lên 3 cuốn sách mới.",
        timestamp: "2 giờ trước",
        type: "book",
    },
];

export default function AdminDashboard() {
    const [selectedBook, setSelectedBook] = useState<PendingBook | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewBook = (bookId: string) => {
        const book = PENDING_BOOKS.find((b) => b.id === bookId);
        if (book) {
            setSelectedBook(book);
            setIsModalOpen(true);
        }
    };

    const handleApprove = (bookId: string) => {
        console.log("Book approved:", bookId);
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    const handleReject = (bookId: string) => {
        console.log("Book rejected:", bookId);
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    return (
        <div className="animate-fade-in space-y-12">
            {/* Statistics Section - Square Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <AdminStatCard
                    icon={<Users className="w-16 h-16" />}
                    label="Người dùng hệ thống"
                    value="1,250"
                />
                <AdminStatCard
                    icon={<BookOpen className="w-16 h-16" />}
                    label="Tổng số sách"
                    value="340"
                />
                <AdminStatCard
                    icon={<FileText className="w-16 h-16" />}
                    label="Sách chờ duyệt"
                    value="5"
                    highlight={true}
                />
            </div>

            {/* Book Moderation Section */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Duyệt sách đóng góp</h2>
                <div className="space-y-4">
                    {PENDING_BOOKS.map((book) => (
                        <ModerationCard
                            key={book.id}
                            book={book}
                            onView={handleViewBook}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>

                {PENDING_BOOKS.length === 0 && (
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
                        description: "Đây là mô tả sách mẫu. Sách này kể về những cuộc phiêu lưu thú vị.",
                        fullText:
                            "Nội dung đầy đủ của sách sẽ được hiển thị ở đây. Đây là văn bản mẫu để minh họa cách hiển thị nội dung sách trong modal kiểm duyệt.",
                    } : undefined
                }
            />
        </div>
    );
}
