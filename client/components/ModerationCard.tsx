import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PendingBook {
    id: string;
    title: string;
    author: string;
    uploadedBy: string;
    thumbnail: string;
    status: "pending";
}

interface ModerationCardProps {
    book: PendingBook;
    onApprove?: (bookId: string) => void;
    onReject?: (bookId: string) => void;
    onView?: (bookId: string) => void;
}

export function ModerationCard({
    book,
    onApprove,
    onReject,
    onView,
}: ModerationCardProps) {
    return (
        <div
            className={cn(
                "bg-card rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center gap-6",
                onView && "cursor-pointer"
            )}
            onClick={() => onView?.(book.id)}
        >
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-24 h-32 bg-muted rounded-2xl flex items-center justify-center shadow-sm">
                <div className="text-5xl">{book.thumbnail}</div>
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-foreground truncate">
                    {book.title}
                </h3>
                <p className="text-base text-muted-foreground mt-1">
                    Tác giả: <span className="font-semibold">{book.author}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Tải lên bởi: <span className="font-semibold">{book.uploadedBy}</span>
                </p>

                {/* Status Badge */}
                <div className="mt-3">
                    <Badge className="bg-warning/20 text-warning hover:bg-warning/30">
                        Chờ duyệt
                    </Badge>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex gap-3">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onApprove?.(book.id);
                    }}
                    className="bg-success text-white hover:bg-success/90 font-bold px-6 py-2 h-auto"
                >
                    Duyệt
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onReject?.(book.id);
                    }}
                    variant="outline"
                    className="border-muted-foreground text-foreground hover:bg-muted font-bold px-6 py-2 h-auto"
                >
                    Từ chối
                </Button>
            </div>
        </div>
    );
}
