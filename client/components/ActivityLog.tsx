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
        <div className="space-y-4">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="flex items-start gap-4 p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-shadow"
                >
                    <div className="text-4xl flex-shrink-0">
                        {typeIcons[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-foreground leading-relaxed">
                            {activity.message}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {activity.timestamp}
                        </p>
                    </div>
                </div>
            ))}

            {activities.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                        Không có hoạt động nào 📭
                    </p>
                </div>
            )}
        </div>
    );
}
