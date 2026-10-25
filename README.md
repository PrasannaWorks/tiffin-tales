# Tiffin Tales

A food-ordering website for a South Indian café, built with HTML, CSS and JavaScript (no frameworks).

**Live site:** https://YOUR-NAME.github.io/tiffin-tales/

## Features

- Menu rendered from data (12 dishes) with veg / non-veg marks, ratings and spice level
- Live search, category filter, veg-only filter and sorting
- Cart with + / − quantities, GST, delivery fee and coupon codes (TIFFIN10, FIRST50)
- Checkout form with validation and an order confirmation with an order ID

## How it works

- `menu.js` holds the data, `utils.js` the pure helper functions, `app.js` the state, rendering and events.
- Every event changes the `state` object and calls `render()`, which redraws the page from state.

## Run it locally

Open the folder in VS Code and start **Live Server** (ES modules need a server).

## What I learned

(write 3 to 5 lines in your own words)# Tiffin Tales

A food-ordering website for a South Indian café, built with HTML, CSS and JavaScript (no frameworks).

**Live site:** https://YOUR-NAME.github.io/tiffin-tales/

## Features

- Menu rendered from data (12 dishes) with veg / non-veg marks, ratings and spice level
- Live search, category filter, veg-only filter and sorting
- Cart with + / − quantities, GST, delivery fee and coupon codes (TIFFIN10, FIRST50)
- Checkout form with validation and an order confirmation with an order ID

## How it works

- `menu.js` holds the data, `utils.js` the pure helper functions, `app.js` the state, rendering and events.
- Every event changes the `state` object and calls `render()`, which redraws the page from state.

## Run it locally

Open the folder in VS Code and start **Live Server** (ES modules need a server).

## What I learned

Pure functions in `utils.js` (like `calcBill` and `validateOrder`) are easy to test in the console before using them on the page.
One click listener on a parent (event delegation) can handle many buttons.
