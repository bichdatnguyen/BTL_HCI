import { ScrollArea } from "@/components/ui/scroll-area"; // Nếu bạn có shadcn/ui, nếu không dùng div thường
import { cn } from "@/lib/utils";

export interface Activity {
    id: string;
    message: string;
    timestamp: string;
    type: "user" | "book" | "system" | "exercise";
}

interface ActivityLogProps {
    activities: Activity[];
}

const typeIcons = {
    user: "👤",
    book: "📚",
    system: "⚙️",
    exercise: "🎮",
};

export function ActivityLog({ activities }: ActivityLogProps) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border h-[600px] flex flex-col">
            {/* 1. Header nhỏ bên trong để trang trí (Optional) */}
            <div className="mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Nhật ký hệ thống</span>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                    {activities.length} bản ghi
                </span>
            </div>

            {/* 2. Vùng hiển thị danh sách có thanh cuộn */}
            {/* max-h-[500px]: Giới hạn chiều cao khoảng 500px */}
            {/* overflow-y-auto: Tự động hiện thanh cuộn nếu dài hơn */}
            {/* pr-2: Cách lề phải một chút để nội dung không dính vào thanh cuộn */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        // 3. Chỉnh lại Style thẻ cho gọn (Compact Design)
                        // - Giảm p-6 xuống p-3 hoặc p-4
                        // - Thêm items-center để căn giữa theo chiều dọc
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                    >
                        {/* Thu nhỏ Icon: text-4xl -> text-2xl */}
                        <div className="text-2xl flex-shrink-0 bg-white p-2 rounded-full shadow-sm">
                            {typeIcons[activity.type]}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Chữ nhỏ lại một chút text-sm */}
                            <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                                {activity.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 font-medium">
                                {activity.timestamp}
                            </p>
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="text-center py-12 flex flex-col items-center justify-center text-gray-400">
                        <span className="text-4xl mb-2">📭</span>
                        <p className="text-sm">Không có hoạt động nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}