// app.js (top of the file)
import menu, { coupons } from "./menu.js";

console.log(menu);
console.log(coupons);
console.log(Object.keys(coupons).length); // 3.2 check: number of coupon keys

// ===== 3.3 Answer 8 questions with array methods =====

// a. How many dishes are on the menu?
console.log(menu.length);

// b. How many are vegetarian?
console.log(menu.filter((d) => d.veg).length);

// c. NAMES of dishes that are out of stock
//    (assumes the stock field is called `inStock`; change it if yours differs)
console.log(menu.filter((d) => !d.inStock).map((d) => d.name));

// d. Total of all 12 prices
console.log(menu.reduce((sum, d) => sum + d.price, 0));

// e. NAME of the most expensive dish
console.log(menu.reduce((max, d) => (d.price > max.price ? d : max)).name);

// f. NAMES of dishes with spice level 2 or more (some have no spice object)
//    (assumes spice looks like { level: 2 }; change `level` if yours differs)
console.log(menu.filter((d) => d.spice?.level >= 2).map((d) => d.name));

// g. Badge of dish id 6, and of dish id 2 ("none" if it has no badge)
console.log(menu.find((d) => d.id === 6)?.badge ?? "none");
console.log(menu.find((d) => d.id === 2)?.badge ?? "none");

// h. Destructure name and price out of menu[3]
const { name, price } = menu[3];
console.log(name, price);
