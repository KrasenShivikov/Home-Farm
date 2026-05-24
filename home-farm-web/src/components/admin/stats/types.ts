import type { AdminStats } from "@/actions/admin-stats";

export type AdminStatsViewProps = {
  stats: AdminStats;
  startDate: string | null;
  endDate: string | null;
  initialMainTab: MainTab;
  initialCatalogTab: CatalogTab;
  initialOrdersTab: OrdersTab;
};

export type MainTab = "catalog" | "orders";
export type CatalogTab = "summary" | "crops" | "products";
export type OrdersTab = "status" | "products" | "users";

export type TotalsChartValue = {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "sky" | "amber" | "slate";
};

export type RankedChartItem = {
  label: string;
  value: number;
};

export type FormulaKey =
  | "productionValue"
  | "wasteValue"
  | "usedCropsValue"
  | "productsValue"
  | "addedValue"
  | "expensesValue"
  | "endTotalValue"
  | "orderValue";
