"use client";

import { useTranslations } from "next-intl";

// Placeholder cards while a list loads (same grid as the real cards).
export function ListSkeleton({ count = 6, className = "directory-grid" }) {
  const t = useTranslations("state");
  return (
    <div className={className} role="status" aria-busy="true" aria-label={t("loading")}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="min-h-[260px] animate-pulse rounded-2xl bg-white/70 p-7 ring-1 ring-black/5">
          <div className="size-14 rounded-2xl bg-slate-200" />
          <div className="mt-6 h-5 w-3/4 rounded bg-slate-200" />
          <div className="mt-5 h-px w-full bg-slate-200" />
          <div className="mt-5 h-3 w-full rounded bg-slate-200" />
          <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
        </div>
      ))}
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}

// Shown when the API cannot be reached; "Try again" refetches.
export function ErrorState({ onRetry, retrying = false, title, text }) {
  const t = useTranslations("state");
  return (
    <div className="directory-empty" role="alert">
      <h3>{title || t("errorTitle")}</h3>
      <p>{text || t("errorText")}</p>
      {onRetry && (
        <button type="button" className="button-secondary" onClick={onRetry} disabled={retrying}>
          {retrying ? t("retrying") : t("retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  const t = useTranslations("state");
  return (
    <div className="directory-empty">
      <h3>{title || t("emptyTitle")}</h3>
      <p>{text || t("emptyText")}</p>
      {action}
    </div>
  );
}

// One wrapper for the four states of a list query (see hooks/list-state.js):
// loading -> skeleton, error (and nothing to show) -> retry, empty -> message,
// otherwise the children. A background refresh keeps the list on screen.
export function QueryState({ query, skeletonCount, errorTitle, errorText, emptyTitle, emptyText, children }) {
  if (query.isPending && !query.items?.length) return <ListSkeleton count={skeletonCount} />;
  if (query.isError && !query.items?.length)
    return <ErrorState title={errorTitle} text={errorText} onRetry={() => query.refetch()} retrying={query.isFetching} />;
  if (query.isEmpty) return <EmptyState title={emptyTitle} text={emptyText} />;
  return children;
}
