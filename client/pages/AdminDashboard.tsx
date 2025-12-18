import { useState, useEffect } from "react";
import { Users, BookOpen, FileText } from "lucide-react";
import { ModerationCard, PendingBook } from "@/components/ModerationCard";
import { BookDetailModal } from "@/components/BookDetailModal";
import { ActivityLog, Activity } from "@/components/ActivityLog";
import { AdminStatCard } from "@/components/AdminStatCard";

interface ExtendedPendingBook extends PendingBook {
    fullText?: string;
    description?: string;
}

interface AdminStats {
    totalUsers: number;
    totalBooks: number;
    pendingBooks: number;
    activities: Activity[];
}

export default function AdminDashboard() {
    const [pendingBooksList, setPendingBooksList] = useState<ExtendedPendingBook[]>([]);

    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalBooks: 0,
        pendingBooks: 0,
        activities: []
    });

    const [selectedBook, setSelectedBook] = useState<ExtendedPendingBook | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- API 1: Lấy số liệu thống kê ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/admin/stats");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Lỗi lấy thống kê:", error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // --- API 2: Lấy danh sách sách chờ duyệt ---
    useEffect(() => {
        const fetchPendingBooks = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/admin/pending-books");
                const data = await response.json();

                const formattedBooks: ExtendedPendingBook[] = data.map((book: any) => ({
                    id: book._id,
                    title: book.title,
                    author: book.author || "Đóng góp",
                    uploadedBy: book.uploadedBy || "Ẩn danh",
                    thumbnail: book.coverUrl || "📚",
                    status: book.status,
                    description: "Mô tả sách (đang cập nhật).",
                    fullText: book.content || "Chưa có nội dung chi tiết.",
                }));

                setPendingBooksList(formattedBooks);
            } catch (error) {
                console.error("Lỗi tải sách chờ duyệt:", error);
            }
        };
        fetchPendingBooks();
    }, []);

    const handleViewBook = (bookId: string) => {
        const book = pendingBooksList.find((b) => b.id === bookId);
        if (book) {
            setSelectedBook(book);
            setIsModalOpen(true);
        }
    };

    // Xử lý Duyệt sách
    const handleApprove = async (bookId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/approve/${bookId}`, { method: "PUT" });
            if (response.ok) {
                // 1. Cập nhật danh sách sách chờ duyệt (bỏ sách đó đi)
                setPendingBooksList((prev) => prev.filter((b) => b.id !== bookId));

                // 2. Cập nhật số liệu thống kê
                // SỬA Ở ĐÂY: Chỉ giảm pendingBooks, KHÔNG tăng totalBooks nữa
                setStats(prev => ({
                    ...prev,
                    pendingBooks: prev.pendingBooks - 1,
                    // totalBooks: prev.totalBooks + 1,  <-- ĐÃ XÓA DÒNG NÀY
                }));

                setIsModalOpen(false);
                setSelectedBook(null);
            }
        } catch (error) {
            console.error("Lỗi duyệt:", error);
        }
    };

    // Xử lý Từ chối sách
    const handleReject = async (bookId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/reject/${bookId}`, { method: "DELETE" });
            if (response.ok) {
                setPendingBooksList((prev) => prev.filter((b) => b.id !== bookId));
                setStats(prev => ({
                    ...prev,
                    pendingBooks: prev.pendingBooks - 1
                }));
                setIsModalOpen(false);
                setSelectedBook(null);
            }
        } catch (error) {
            console.error("Lỗi từ chối:", error);
        }
    };

    return (
        <div className="animate-fade-in space-y-12 pb-20">
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <AdminStatCard
                    icon={<Users className="w-16 h-16 text-blue-500" />}
                    label="Người dùng hệ thống"
                    value={stats.totalUsers}
                />
                <AdminStatCard
                    icon={<BookOpen className="w-16 h-16 text-green-500" />}
                    label="Tổng số sách hệ thống"
                    value={stats.totalBooks} // Chỉ hiện sách hệ thống
                />
                <AdminStatCard
                    icon={<FileText className="w-16 h-16 text-orange-500" />}
                    label="Sách chờ duyệt"
                    value={stats.pendingBooks}
                    highlight={stats.pendingBooks > 0}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Book Moderation Section */}
                <section className="xl:col-span-2 space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">Duyệt sách đóng góp</h2>

                    {/* 1. TẠO CONTAINER KHUNG TRẮNG (GIỐNG ACTIVITY LOG) */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-border h-[600px] flex flex-col">

                        {/* Header nhỏ bên trong để hiển thị số lượng (Tùy chọn cho đẹp) */}
                        <div className="mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Danh sách chờ
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${pendingBooksList.length > 0
                                ? "bg-orange-100 text-orange-600"
                                : "bg-green-100 text-green-600"
                                }`}>
                                {pendingBooksList.length} yêu cầu
                            </span>
                        </div>

                        {/* 2. VÙNG CUỘN (SCROLLABLE AREA) */}
                        {/* max-h-[600px]: Cho phép vùng này cao hơn ActivityLog một chút vì thẻ sách to hơn */}
                        <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
                            {pendingBooksList.length > 0 ? (
                                pendingBooksList.map((book) => (
                                    <ModerationCard
                                        key={book.id}
                                        book={book}
                                        onView={handleViewBook}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                    />
                                ))
                            ) : (
                                // Giao diện khi trống
                                <div className="text-center py-20 flex flex-col items-center justify-center opacity-60">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
                                        🎉
                                    </div>
                                    <p className="text-gray-500 font-medium text-lg">
                                        Tuyệt vời! Không còn sách nào cần duyệt.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Recent Activity Section */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">Hoạt động gần đây</h2>
                    <ActivityLog activities={stats.activities} />
                </section>
            </div>

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
                        fullText: selectedBook.fullText || "",
                    } : undefined
                }
            />
        </div>
    );
}