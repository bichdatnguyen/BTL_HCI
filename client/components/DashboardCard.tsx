import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DashboardCard({
  children,
  className,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200",
        onClick && "cursor-pointer hover:bg-secondary/20",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({ title, children, className }: SectionProps) {
  return (
    <section className={className}>
      <h2 className="text-2xl font-bold text-foreground mb-5">{title}</h2>
      {children}
    </section>
  );
}
