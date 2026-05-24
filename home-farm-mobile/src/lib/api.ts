import { Platform } from "react-native";

const DEFAULT_API_BASE_URL = "http://localhost:3000/api";
const CONFIGURED_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function getApiBaseUrl() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  }

  return CONFIGURED_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface OrderLine {
  lineId: number;
  cropId: number;
  cropName: string;
  cropVariety: string | null;
  quantity: string;
  price: string;
}

export interface Order {
  id: number;
  status: string;
  createdAt: string;
  totalItems: number;
  totalAmount: string;
  shippingCity?: string | null;
  shippingStreet?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  items: OrderLine[];
}

export interface Crop {
  id: number;
  name: string;
  variety: string | null;
  forSale: boolean;
  price: string | null;
}

interface ApiErrorBody {
  error?: string;
}

async function readError(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.error || "Заявката е неуспешна.";
  } catch {
    return "Заявката е неуспешна.";
  }
}

export async function apiFetch<T>(
  path: string,
  token?: string | null,
  options: RequestInit = {}
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as T;
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<{ token: string; user: ApiUser }>("/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getOrders(token: string) {
  return apiFetch<{ orders: Order[] }>("/orders", token);
}

export async function getOrder(token: string, id: string) {
  return apiFetch<{ order: Order }>(`/orders/${id}`, token);
}

export async function createOrder(token: string) {
  return apiFetch<{ success: boolean; order: { id: number; status: string; createdAt: string } }>(
    "/orders",
    token,
    { method: "POST" }
  );
}

export async function getCrops(token: string) {
  return apiFetch<{ crops: Crop[] }>("/crops?forSale=true", token);
}

export async function updateOrderStatus(token: string, id: string, status: string) {
  return apiFetch<{ success: boolean; order: { id: number; status: string } }>(
    `/orders/${id}/edit`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ status }),
    }
  );
}

export async function deleteOrder(token: string, id: string) {
  return apiFetch<{ success: boolean }>(`/orders/${id}`, token, {
    method: "DELETE",
  });
}

export async function createOrderLine(
  token: string,
  id: string,
  values: { cropId: number; quantity: string }
) {
  return apiFetch<{ success: boolean; lineId: number }>(`/orders/${id}/create_order_line`, token, {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export async function updateOrderLine(
  token: string,
  orderId: string,
  lineId: number,
  quantity: string
) {
  return apiFetch<{ success: boolean; line: { id: number; quantity: string } }>(
    `/orders/${orderId}/lines/${lineId}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }
  );
}

export async function deleteOrderLine(token: string, orderId: string, lineId: number) {
  return apiFetch<{ success: boolean }>(`/orders/${orderId}/lines/${lineId}`, token, {
    method: "DELETE",
  });
}
