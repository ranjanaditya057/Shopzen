import { Link } from "react-router-dom";

export default function EmptyState({ emoji = "🛍️", title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-4xl">{emoji}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      {message && <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 font-semibold underline">
          Try again
        </button>
      )}
    </div>
  );
}
