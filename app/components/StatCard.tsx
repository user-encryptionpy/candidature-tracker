export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "navy" | "green" | "red" | "amber";
}) {
  const chip = {
    navy: "bg-blue-50 text-navy",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </div>
        {icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${chip}`}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-navy-ink">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs font-medium text-gray-400">{sub}</div>}
    </div>
  );
}
