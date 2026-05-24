"use client";

import { useId } from "react";

import type { FormulaKey } from "./types";

const formulaMessages: Record<FormulaKey, string> = {
  addedValue: "Добавена стойност = стойност на продуктите - стойност на използваните култури.",
  endTotalValue: "Крайна стойност = общо производство - загуби + добавена стойност - разходи.",
  expensesValue: "Разходи = сбор на всички въведени разходи за избрания период.",
  orderValue: "Стойност на поръчките = количество по реда * единична цена, сумирано за поръчките.",
  productsValue: "Стойност на продуктите = произведено количество * цена на продукта.",
  productionValue: "Стойност на реколтата = прибрано количество * цена на културата.",
  usedCropsValue: "Използвани култури = използвано количество култура * цена на културата.",
  wasteValue: "Стойност на загубите = количество загуби в кг * цена на културата.",
};

export function formatStatNumber(value: string | number, fractionDigits = 2) {
  return Number(value || 0).toFixed(fractionDigits);
}

export function FormulaHintButton({
  formula,
  align = "center",
  side = "top",
}: {
  formula: FormulaKey;
  align?: "center" | "start";
  side?: "top" | "bottom";
}) {
  const tooltipId = useId();
  const horizontalPosition =
    align === "start"
      ? "left-0"
      : "left-1/2 -translate-x-1/2";
  const verticalPosition =
    side === "bottom"
      ? "top-full mt-2"
      : "bottom-full mb-2";

  return (
    <span className="group relative ml-2 inline-flex align-middle">
      <button
        aria-describedby={tooltipId}
        aria-label="Покажи формулата"
        className="inline-flex size-5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[0.7rem] font-extrabold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
        type="button"
      >
        ?
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute z-30 w-72 rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 text-left text-xs font-semibold normal-case leading-relaxed tracking-normal text-white opacity-0 shadow-xl transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${horizontalPosition} ${verticalPosition}`}
      >
        {formulaMessages[formula]}
      </span>
    </span>
  );
}

export function formatOrderStatusLabel(status: string) {
  switch (status) {
    case "Pending":
      return "Чакаща";
    case "Accepted":
      return "Приета";
    case "Completed":
      return "Завършена";
    case "Cancelled":
      return "Отказана";
    default:
      return status;
  }
}

export function getOrderStatusStatsClasses(status: string) {
  const styles: Record<string, { card: string; pill: string; title: string }> = {
    Pending: {
      card: "border-amber-200 bg-amber-50/40",
      pill: "border-amber-200 bg-amber-100 text-amber-900",
      title: "text-amber-950",
    },
    Accepted: {
      card: "border-sky-200 bg-sky-50/40",
      pill: "border-sky-200 bg-sky-100 text-sky-900",
      title: "text-sky-950",
    },
    Completed: {
      card: "border-emerald-200 bg-emerald-50/50",
      pill: "border-emerald-200 bg-emerald-100 text-emerald-900",
      title: "text-emerald-950",
    },
    Cancelled: {
      card: "border-rose-200 bg-rose-50/40",
      pill: "border-rose-200 bg-rose-100 text-rose-900",
      title: "text-rose-950",
    },
  };

  return styles[status] ?? {
    card: "border-slate-200 bg-white",
    pill: "border-slate-200 bg-slate-100 text-slate-800",
    title: "text-slate-900",
  };
}
