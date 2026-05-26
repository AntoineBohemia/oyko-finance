import { FC, ReactNode } from "react";
import { Button } from "@/components/base/buttons/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-[#E5E2DC] bg-white py-16 px-8">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="font-display text-lg font-semibold text-primary">{title}</p>
      <p className="max-w-sm text-center text-sm text-tertiary">{message}</p>
      {actionText && onAction && (
        <Button size="sm" color="link-color" onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
}
