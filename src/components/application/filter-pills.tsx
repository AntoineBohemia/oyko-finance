"use client";

import { cx } from "@/utils/cx";

interface FilterPill {
  id: string;
  label: string;
  count?: number;
}

interface FilterPillsProps {
  pills: FilterPill[];
  selected: string;
  onChange: (id: string) => void;
}

export function FilterPills({ pills, selected, onChange }: FilterPillsProps) {
  return (
    <div className="flex items-center gap-2">
      {pills.map((pill) => (
        <button
          key={pill.id}
          className={cx(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            selected === pill.id
              ? "bg-gray-900 text-white"
              : "text-tertiary hover:bg-gray-100"
          )}
          onClick={() => onChange(pill.id)}
        >
          {pill.label}
          {pill.count !== undefined && (
            <span className="ml-1.5 text-xs opacity-70">{pill.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
