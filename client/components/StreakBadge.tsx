interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-warning/20 rounded-full px-3 py-2 border border-warning">
      <span className="text-xl">🔥</span>
      <span className="font-bold text-foreground text-sm">{count}</span>
    </div>
  );
}
