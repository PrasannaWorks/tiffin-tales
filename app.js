// app.js: the brain of the website. Data -> state -> render -> events.
import menu, { coupons } from "./menu.js";
import {
  formatPrice,
  findItem,
  spiceDots,
  calcBill,
  validateOrder,
  makeOrderId,
} from "./utils.js";

// ===== 5.1 Find every element once =====
const searchInput = document.querySelector("#search");
const sortSelect = document.querySelector("#sort");
const vegOnly = document.querySelector("#veg-only");
const chips = document.querySelector("#chips");
const resultInfo = document.querySelector("#result-info");
const menuGrid = document.querySelector("#menu-grid");

const cartCount = document.querySelector("#cart-count");
const cartList = document.querySelector("#cart-list");
const couponForm = document.querySelector("#coupon-form");
const couponInput = document.querySelector("#coupon-input");
const couponMsg = document.querySelector("#coupon-msg");
const bill = document.querySelector("#bill");

const checkoutForm = document.querySelector("#checkout-form");
const placeBtn = document.querySelector("#place-btn");
const confirmation = document.querySelector("#confirmation");

// ===== 5.2 dishHTML: one card from one dish =====
function dishHTML(item) {
  const { id, name, price, veg, rating, inStock } = item;
  const badge = item.badge ?? "";
  const level = item.spice?.level ?? 0;

  return `
    <li class="dish${inStock ? "" : " sold-out"}" data-id="${id}">
      <div class="dish-top">
        <span class="diet ${veg ? "veg" : "nonveg"}" title="${veg ? "Veg" : "Non-veg"}"></span>
        ${badge ? `<span class="badge">${badge}</span>` : ""}
      </div>
      <h3>${name}</h3>
      <p class="meta">★ ${rating.toFixed(1)} · <span class="spice">${spiceDots(level)}</span></p>
      <div class="dish-bottom">
        <span class="price">${formatPrice(price)}</span>
        <button class="add-btn"${inStock ? "" : " disabled"}>${inStock ? "Add" : "Sold out"}</button>
      </div>
    </li>
  `;
}

console.log(dishHTML(menu[6])); // 5.2 test (delete after checking)

// ===== 5.3 renderMenu: all the cards =====
function renderMenu(list = menu) {
  resultInfo.textContent = `Showing ${list.length} of ${menu.length} dishes`;

  menuGrid.innerHTML = list.length
    ? list.map(dishHTML).join("")
    : `<li class="empty">No dishes match your search.</li>`;
}

renderMenu();
