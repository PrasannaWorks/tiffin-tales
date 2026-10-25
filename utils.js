// utils.js: pure helper functions (same input, same output, no page access)

// ===== 4.1 Constants and formatPrice =====
export const GST_RATE = 0.05;
export const FREE_DELIVERY_ABOVE = 499;
export const DELIVERY_FEE = 40;

export const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;

// ===== 4.2 findItem and spiceDots =====
export function findItem(menu, id) {
  return menu.find((dish) => dish.id === id);
}

export function spiceDots(level = 0) {
  let dots = "";
  for (let i = 1; i <= 3; i++) {
    dots += i <= level ? "●" : "○";
  }
  return dots;
}

// ===== 4.3 getDiscount =====
export function getDiscount(subtotal, code, coupons) {
  if (!code) return { amount: 0, message: "" };

  const coupon = coupons[code];
  if (!coupon) return { amount: 0, message: "Invalid coupon" };

  if (subtotal < coupon.minOrder) {
    const needed = coupon.minOrder - subtotal;
    return {
      amount: 0,
      message: `Add ${formatPrice(needed)} more to use ${code}`,
    };
  }

  switch (coupon.type) {
    case "percent": {
      const amount = Math.min(
        Math.round((subtotal * coupon.value) / 100),
        coupon.max,
      );
      return { amount, message: `${code} applied: ${coupon.value}% off` };
    }
    case "flat":
      return {
        amount: coupon.value,
        message: `${code} applied: ${formatPrice(coupon.value)} off`,
      };
    default:
      return { amount: 0, message: "Invalid coupon" };
  }
}

// ===== 4.4 calcBill =====
export function calcBill(cart, menu, code = "", coupons = {}) {
  const subtotal = cart.reduce(
    (sum, { id, qty }) => sum + findItem(menu, id).price * qty,
    0,
  );
  const itemCount = cart.reduce((sum, { qty }) => sum + qty, 0);

  const { amount: discount, message } = getDiscount(subtotal, code, coupons);

  const taxable = subtotal - discount;
  const gst = Math.round(taxable * GST_RATE);
  const delivery =
    itemCount === 0 || taxable >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = taxable + gst + delivery;

  return { itemCount, subtotal, discount, gst, delivery, total, message };
}

// ===== 4.5 validateOrder =====
export function validateOrder({ name, phone, address }) {
  const errors = {};

  if (name.trim().length < 3) {
    errors.name = "Please enter your full name";
  }

  const allDigits = [...phone].every((ch) => ch >= "0" && ch <= "9");
  if (phone.length !== 10 || !allDigits) {
    errors.phone = "Phone number must be exactly 10 digits";
  }

  if (address.trim().length < 10) {
    errors.address = "Please enter your full address";
  }

  return errors;
}

// ===== 4.6 makeOrderId =====
export function makeOrderId(name, orderNumber) {
  const initials = name
    .trim()
    .split(" ")
    .filter((word) => word !== "")
    .map((word) => word[0].toUpperCase())
    .join("");

  return `TT-${initials}-${String(orderNumber).padStart(4, "0")}`;
}
