// api.js: all communication with the Tiffin Tales backend lives here.

// Local development talks to your own machine. After you host the backend,
// paste its public URL below (for example "https://tiffin-tales-api.onrender.com/api").
const PRODUCTION_API = "https://tiffin-tales-api.onrender.com/api";

const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
export const API_BASE = isLocal ? "http://localhost:4000/api" : PRODUCTION_API;

// Error that carries the server's message and per-field errors (if any)
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new ApiError(data.error ?? "Request failed", res.status, data.fields);
  return data;
}

export const fetchMenu = () => request("/menu").then((d) => d.items);

// cart: [{ id, qty }]  ->  server-calculated bill
export const fetchQuote = (cart, coupon) =>
  request("/quote", {
    method: "POST",
    body: JSON.stringify({ items: cart, coupon }),
  });

export const placeOrder = (details, cart, coupon) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify({ ...details, items: cart, coupon }),
  });
