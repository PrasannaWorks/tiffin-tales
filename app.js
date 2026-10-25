// app.js: temporary Phase 4 tests (delete everything except the menu import after this phase)
import menu, { coupons } from "./menu.js";
import {
  formatPrice,
  findItem,
  spiceDots,
  getDiscount,
  calcBill,
  validateOrder,
  makeOrderId,
} from "./utils.js";

// 4.1
console.log(formatPrice(1250)); // 1
console.log(formatPrice(90)); // 2

// 4.2
console.log(findItem(menu, 9).name); // 1
console.log(spiceDots(2)); // 2
console.log(spiceDots()); // 3
console.log(findItem(menu, 99)); // 4

// 4.3
console.log(getDiscount(600, "TIFFIN10", coupons).amount); // 1
console.log(getDiscount(1500, "TIFFIN10", coupons).amount); // 2
console.log(getDiscount(170, "FIRST50", coupons).message); // 3
console.log(getDiscount(400, "SAVE99", coupons).message); // 4

// 4.4
const cartA = [
  { id: 1, qty: 2 },
  { id: 10, qty: 2 },
]; // 2 dosa, 2 coffee
const cartB = [
  { id: 4, qty: 2 },
  { id: 9, qty: 1 },
]; // 2 biryani, 1 chicken 65
const cartC = [
  { id: 8, qty: 3 },
  { id: 11, qty: 2 },
]; // 3 samosa, 2 chai

console.log(calcBill(cartA, menu)); // A
console.log(calcBill(cartB, menu, "TIFFIN10", coupons)); // B
console.log(calcBill(cartC, menu, "FIRST50", coupons)); // C
console.log(calcBill([], menu)); // D

// 4.5
console.log(
  validateOrder({ name: "Ra", phone: "98765", address: "Gandhipuram" }),
);
console.log(
  validateOrder({
    name: "Ravi Kumar",
    phone: "98765 43210",
    address: "12 Gandhipuram, Coimbatore",
  }),
);
console.log(
  validateOrder({
    name: "Ravi Kumar",
    phone: "9876543210",
    address: "12 Gandhipuram, Coimbatore",
  }),
);

// 4.6
console.log(makeOrderId("ravi kumar", 7)); // 1
console.log(makeOrderId("  Priya  ", 12)); // 2
console.log(makeOrderId("anu mary joseph", 125)); // 3
