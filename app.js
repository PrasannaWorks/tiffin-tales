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

// ===== 6.1 State: everything that can change lives in one object =====
const state = {
  category: "all",
  vegOnly: false,
  query: "",
  sort: "default",
  cart: [], // [{ id, qty }]
  coupon: "", // coupon code typed by the user, used in the next phase
};

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

// ===== 6.1 visibleItems: the list to show, worked out from state =====
function visibleItems() {
  const query = state.query.trim().toLowerCase();

  const list = menu
    .filter(
      (dish) => state.category === "all" || dish.category === state.category,
    )
    .filter((dish) => !state.vegOnly || dish.veg)
    .filter((dish) => dish.name.toLowerCase().includes(query));

  // sort a copy, never the original list
  switch (state.sort) {
    case "price-low":
      return [...list].sort((a, b) => a.price - b.price);
    case "price-high":
      return [...list].sort((a, b) => b.price - a.price);
    case "rating":
      return [...list].sort((a, b) => b.rating - a.rating);
    default:
      return list;
  }
}

// ===== 7.1 changeQty: one function for add, + and - =====
function changeQty(id, change) {
  const line = state.cart.find((l) => l.id === id);

  if (line) {
    line.qty += change;
  } else if (change > 0) {
    state.cart.push({ id, qty: 1 });
  }

  // remove every line whose qty dropped to 0
  state.cart = state.cart.filter((l) => l.qty > 0);
}

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

// ===== 5.3 + 6.2 renderMenu: cards and the active chip =====
function renderMenu() {
  const list = visibleItems();

  resultInfo.textContent = `Showing ${list.length} of ${menu.length} dishes`;

  menuGrid.innerHTML = list.length
    ? list.map(dishHTML).join("")
    : `<li class="empty">No dishes match your search.</li>`;

  chips.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.cat === state.category);
  });
}

// ===== 7.3 cartItemHTML and renderCart: rows, bill and badge =====
function cartItemHTML({ id, qty }) {
  const { name, price } = findItem(menu, id);

  return `
    <li data-id="${id}">
      <span>${name}</span>
      <span class="qty">
        <button type="button" data-action="dec" aria-label="Remove one">−</button>
        <b>${qty}</b>
        <button type="button" data-action="inc" aria-label="Add one">+</button>
      </span>
      <span>${formatPrice(price * qty)}</span>
    </li>
  `;
}

function renderCart() {
  const { itemCount, subtotal, discount, gst, delivery, total, message } =
    calcBill(state.cart, menu, state.coupon, coupons);
  const isEmpty = state.cart.length === 0;

  cartCount.textContent = itemCount;

  cartList.innerHTML = isEmpty
    ? `<li>Your cart is empty</li>`
    : state.cart.map(cartItemHTML).join("");

  couponMsg.textContent = message;
  couponMsg.classList.toggle("ok", discount > 0);

  bill.innerHTML = `
    <dt>Subtotal</dt><dd>${formatPrice(subtotal)}</dd>
    ${discount > 0 ? `<dt>Discount</dt><dd>−${formatPrice(discount)}</dd>` : ""}
    <dt>GST (5%)</dt><dd>${formatPrice(gst)}</dd>
    <dt>Delivery</dt><dd>${delivery === 0 && !isEmpty ? "FREE" : formatPrice(delivery)}</dd>
    <dt class="total">Total</dt><dd class="total">${formatPrice(total)}</dd>
  `;

  placeBtn.disabled = isEmpty;
}

// ===== 6.2 render: one place that redraws everything =====
function render() {
  renderMenu();
  renderCart();
}

// ===== 6.3 Four listeners, one pattern: change state, then render() =====
searchInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

sortSelect.addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});

vegOnly.addEventListener("change", (e) => {
  state.vegOnly = e.target.checked;
  render();
});

// one listener on the parent (event delegation)
chips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  state.category = chip.dataset.cat;
  render();
});

// ===== 7.2 The Add buttons (delegation on the grid) =====
menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;

  const id = Number(btn.closest(".dish").dataset.id);
  changeQty(id, 1);
  render();

  console.log(JSON.stringify(state.cart)); // 7.2 test (delete after checking)
});

// ===== 7.4 The + and - buttons (delegation on the cart list) =====
cartList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.closest("li").dataset.id);
  changeQty(id, btn.dataset.action === "inc" ? 1 : -1);
  render();
});

// ===== 8.2 The coupon form =====
couponForm.addEventListener("submit", (e) => {
  e.preventDefault(); // stop the browser from reloading the page
  state.coupon = couponInput.value.trim().toUpperCase();
  render();
});

render();
