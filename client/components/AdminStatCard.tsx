import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    highlight?: boolean;
    className?: string;
}

export function AdminStatCard({
    icon,
    label,
    value,
    highlight = false,
    className,
}: AdminStatCardProps) {
    return (
        <div
            className={cn(
                "aspect-square bg-card rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-center",
                highlight && "ring-2 ring-warning",
                className
            )}
        >
            {/* Icon */}
            <div className="text-5xl mb-6">{icon}</div>

            {/* Label */}
            <p className="text-base font-semibold text-muted-foreground mb-4">
                {label}
            </p>

            {/* Big Number */}
            <p className={cn("text-5xl font-bold", highlight ? "text-warning" : "text-foreground")}>
                {value}
            </p>
        </div>
    );
}
