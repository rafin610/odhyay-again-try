import React from "react";
import { Link } from "wouter";
import { Mark } from "@/components/OdhyayShell";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-sm border border-dashed border-[#4a4052] bg-[#151219] px-8 py-16 text-center">
      {icon ? (
        <div className="mx-auto flex h-12 w-12 items-center justify-center text-amethyst">
          {icon}
        </div>
      ) : (
        <Mark />
      )}
      <h3 className="font-display mt-6 text-2xl text-[#f3eee6]">{title}</h3>
      <p className="mt-3 max-w-md mx-auto text-sm leading-6 text-[#8f8996]">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="focus-ring mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-amethyst transition-colors hover:text-[#cbbbe3]"
        >
          {actionLabel} <ArrowRight size={14} />
        </Link>
      )}
      {!actionHref && onAction && actionLabel && (
        <button
          onClick={onAction}
          className="focus-ring mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-amethyst transition-colors hover:text-[#cbbbe3]"
        >
          {actionLabel} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
