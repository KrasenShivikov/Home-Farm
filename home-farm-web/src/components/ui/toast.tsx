"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-[min(100%-2rem,22rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}