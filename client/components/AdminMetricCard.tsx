import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminMetricCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  highlight?: boolean;
  className?: string;
}

export function AdminMetricCard({
  title,
  value,
  icon,
  highlight = false,
  className,
}: AdminMetricCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow",
        highlight && "ring-2 ring-warning",
        className
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>

      <p className="text-5xl font-bold text-foreground">{value}</p>

      {highlight && (
        <div className="mt-4 inline-block bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-semibold">
          Cần duyệt
        </div>
      )}
    </div>
  );
}
