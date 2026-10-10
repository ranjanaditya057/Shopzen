import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckIcon, CloseIcon } from "../components/Icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message, type = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((t) => [...t.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
      info: (m) => push(m, "info"),
    }),
    [push]
  );

  const tone = {
    success: "bg-slate-900 text-white",
    error: "bg-red-600 text-white",
    info: "bg-brand-700 text-white",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-toast-in ${tone[t.type]}`}
          >
            {t.type === "success" && <CheckIcon className="h-4 w-4 shrink-0" />}
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="ml-1 opacity-70 hover:opacity-100">
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
