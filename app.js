import { formatPrice, findItem, spiceDots, validateOrder } from "./utils.js";
import { fetchMenu, fetchQuote, placeOrder } from "./api.js";

// The menu now comes from the backend (loaded in init() at the bottom).
let menu = [];
const EMPTY_BILL = {
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  gst: 0,
  delivery: 0,
  total: 0,
  message: "",
};
const state = {
  category: "all",
  vegOnly: false,
  query: "",
  sort: "default",
  cart: [],
  coupon: "",
  bill: EMPTY_BILL, // calculated by the server
  loading: true,
  loadError: "",
  placing: false,
};

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
const nameInput = document.querySelector("#name");
const phoneInput = document.querySelector("#phone");
const addressInput = document.querySelector("#address");
const placeBtn = document.querySelector("#place-btn");
const confirmation = document.querySelector("#confirmation");

function visibleItems() {
  const query = state.query.trim().toLowerCase();

  const list = menu
    .filter(
      (dish) => state.category === "all" || dish.category === state.category,
    )
    .filter((dish) => !state.vegOnly || dish.veg)
    .filter((dish) => dish.name.toLowerCase().includes(query));

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
function changeQty(id, change) {
  const line = state.cart.find((l) => l.id === id);

  if (line) {
    line.qty += change;
  } else if (change > 0) {
    state.cart.push({ id, qty: 1 });
  }

  state.cart = state.cart.filter((l) => l.qty > 0);
}
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

function renderMenu() {
  if (state.loading || state.loadError) {
    resultInfo.textContent = "";
    menuGrid.innerHTML = `<li class="empty">${
      state.loading ? "Loading menu…" : state.loadError
    }</li>`;
    return;
  }

  const list = visibleItems();

  resultInfo.textContent = `Showing ${list.length} of ${menu.length} dishes`;

  menuGrid.innerHTML = list.length
    ? list.map(dishHTML).join("")
    : `<li class="empty">No dishes match your search.</li>`;

  chips.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.cat === state.category);
  });
}

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
    state.bill;
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

  placeBtn.disabled = isEmpty || state.placing;
  placeBtn.textContent = state.placing ? "Placing order…" : "Place order";
}
function render() {
  renderMenu();
  renderCart();
}

// Ask the server for the bill whenever the cart or coupon changes.
// A request counter makes sure an older, slower answer never overwrites a newer one.
let quoteRequestId = 0;
async function refreshBill() {
  const myId = ++quoteRequestId;
  if (state.cart.length === 0) {
    state.bill = EMPTY_BILL;
    return render();
  }
  try {
    const bill = await fetchQuote(state.cart, state.coupon);
    if (myId !== quoteRequestId) return;
    state.bill = bill;
  } catch (err) {
    if (myId !== quoteRequestId) return;
    state.bill = { ...state.bill, message: err.message };
  }
  render();
}

// Shows a general (non-field) problem just above the Place order button
const orderError = document.createElement("p");
orderError.className = "coupon-msg";
placeBtn.before(orderError);

function showConfirmation(order) {
  const box = document.createElement("div");
  box.className = "confirm-box";

  const title = document.createElement("h2");
  title.textContent = "Order placed!";

  const orderId = document.createElement("p");
  orderId.className = "order-id";
  orderId.textContent = order.id;
  const thanks = document.createElement("p");
  thanks.textContent =
    `Thank you, ${order.name}! Your total is ${formatPrice(order.bill.total)}. ` +
    `We are delivering to ${order.address}.`;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => {
    confirmation.hidden = true;
    box.remove();
  });

  box.append(title, orderId, thanks, closeBtn);
  confirmation.append(box);
  confirmation.hidden = false;
}

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
chips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  state.category = chip.dataset.cat;
  render();
});
menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;

  const id = Number(btn.closest(".dish").dataset.id);
  changeQty(id, 1);
  render();
  refreshBill();
});
cartList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const id = Number(btn.closest("li").dataset.id);
  changeQty(id, btn.dataset.action === "inc" ? 1 : -1);
  render();
  refreshBill();
});

couponForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.coupon = couponInput.value.trim().toUpperCase();
  refreshBill();
});

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (state.placing) return;
  orderError.textContent = "";

  const details = {
    name: nameInput.value,
    phone: phoneInput.value,
    address: addressInput.value,
  };

  function showFieldErrors(errors) {
    checkoutForm.querySelectorAll(".error").forEach((small) => {
      const field = small.dataset.errorFor;
      small.textContent = errors[field] ?? "";
      document
        .querySelector(`#${field}`)
        .classList.toggle("invalid", field in errors);
    });
  }

  // Quick check in the browser first, the server checks again
  const errors = validateOrder(details);
  showFieldErrors(errors);
  if (Object.keys(errors).length > 0) return;

  state.placing = true;
  renderCart();

  try {
    const order = await placeOrder(details, state.cart, state.coupon);
    showConfirmation(order);

    state.cart = [];
    state.coupon = "";
    state.bill = EMPTY_BILL;
    couponInput.value = "";
    checkoutForm.reset();
  } catch (err) {
    if (err.fields && Object.keys(err.fields).length > 0) {
      showFieldErrors(err.fields);
    } else {
      orderError.textContent = err.message;
    }
    // Stock or prices may have changed, so reload the menu and the bill
    loadMenu();
    refreshBill();
  } finally {
    state.placing = false;
    render();
  }
});
checkoutForm.addEventListener("input", (e) => {
  const small = checkoutForm.querySelector(`[data-error-for="${e.target.id}"]`);
  if (small) small.textContent = "";
  e.target.classList.remove("invalid");
});

async function loadMenu() {
  try {
    menu = await fetchMenu();
    state.loadError = "";
  } catch (err) {
    state.loadError = err.message;
  }
  state.loading = false;
  render();
}

render();
loadMenu();
