import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PendingBook } from "./ModerationCard";

interface BookDetailModalProps {
    book: PendingBook | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove?: (bookId: string) => void;
    onReject?: (bookId: string, reason: string) => void;
    bookDetails?: {
        description: string;
        fullText: string;
    };
}

export function BookDetailModal({
    book,
    open,
    onOpenChange,
    onApprove,
    onReject,
    bookDetails,
}: BookDetailModalProps) {
    const [isChildFriendly, setIsChildFriendly] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleApprove = () => {
        onApprove?.(book?.id || "");
        onOpenChange(false);
    };

    const handleRejectSubmit = () => {
        if (book) {
            onReject?.(book.id, rejectReason);
            onOpenChange(false);
        }
    };

    if (!book) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{book.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Book Meta Information */}
                    <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                        <p>
                            <span className="font-semibold">Tác giả:</span> {book.author}
                        </p>
                        <p>
                            <span className="font-semibold">Tải lên bởi:</span>{" "}
                            {book.uploadedBy}
                        </p>
                    </div>

                    {/* Book Thumbnail */}
                    <div className="flex justify-center">
                        <div className="w-32 h-40 bg-muted rounded-2xl flex items-center justify-center shadow-sm">
                            <div className="text-6xl">{book.thumbnail}</div>
                        </div>
                    </div>

                    {/* Description */}
                    {bookDetails?.description && (
                        <div>
                            <h3 className="font-bold text-lg mb-2">Mô tả</h3>
                            <p className="text-muted-foreground bg-muted/20 p-4 rounded-2xl">
                                {bookDetails.description}
                            </p>
                        </div>
                    )}

                    {/* Full Text Preview */}
                    {bookDetails?.fullText && (
                        <div>
                            <h3 className="font-bold text-lg mb-2">Nội dung sách</h3>
                            <div className="bg-muted/20 p-4 rounded-2xl max-h-64 overflow-y-auto">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {bookDetails.fullText}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Moderation Tool */}
                    <div className="border-t pt-6">
                        <h3 className="font-bold text-lg mb-4">Công cụ kiểm duyệt</h3>
                        <div className="flex items-center space-x-3 bg-accent/20 p-4 rounded-2xl">
                            <Checkbox
                                id="child-friendly"
                                checked={isChildFriendly}
                                onCheckedChange={(checked) => setIsChildFriendly(checked as boolean)}
                            />
                            <label
                                htmlFor="child-friendly"
                                className="text-base font-semibold cursor-pointer flex-1"
                            >
                                Phù hợp với trẻ em?
                            </label>
                        </div>
                    </div>

                    {/* Reject Reason Form */}
                    {showRejectForm && (
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Lý do từ chối (không bắt buộc)
                            </label>
                            <Textarea
                                placeholder="Nhập lý do từ chối..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-24 rounded-2xl"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-3 pt-6 border-t">
                    {!showRejectForm ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowRejectForm(true)}
                                className="flex-1 font-bold py-2 h-auto"
                            >
                                Từ chối
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="flex-1 bg-success text-white hover:bg-success/90 font-bold py-2 h-auto"
                            >
                                Đồng ý đăng
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowRejectForm(false)}
                                className="flex-1 font-bold py-2 h-auto"
                            >
                                Quay lại
                            </Button>
                            <Button
                                onClick={handleRejectSubmit}
                                className="flex-1 bg-destructive text-white hover:bg-destructive/90 font-bold py-2 h-auto"
                            >
                                Xác nhận từ chối
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
