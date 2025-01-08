// client/components/shopping-cart.js

import { CartService } from '../js/cart-service.js'; // Ensure this path is correct

function addToCart(bookId) {
  const items = CartService.getItems();
  CartService.updateQuantity(items, bookId, 1); // +1
  renderCart(); 
}

// 2. updateCartItem(bookId, delta): -1 or +1 from the UI
function updateCartItem(bookId, delta) {
  const items = CartService.getItems();
  CartService.updateQuantity(items, bookId, delta);
  renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById("cart-container");
    if (!cartContainer) {
        console.error("Error: 'cart-container' element not found in the DOM.");
        return;
    }

    const cartItems = CartService.getItems();
    if (!cartItems || cartItems.length === 0) {
        cartContainer.innerHTML = `<p>Your cart is empty.</p>`;
        return;
    }

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    cartContainer.innerHTML = `
        <div class="cart-items">
            ${
                cartItems.length
                    ? cartItems
                          .map(
                              (item) => `
                                  <div class="cart-item">
                                      <div class="item-info">
                                          <p class="item-title">${item.title}</p>
                                          <div class="item-controls">
                                              <button onclick="updateCartItem(${item.id}, -1)" class="plus-buttons">
                                                  <i class="fa-solid fa-minus"></i>
                                              </button>
                                              <p class="item-quantity">${item.quantity}</p>
                                              <button onclick="updateCartItem(${item.id}, 1)" class="plus-buttons">
                                                  <i class="fa-solid fa-plus"></i>
                                              </button>
                                          </div>
                                      </div>
                                      <div class="item-info">
                                          <p class="item-author">${item.author}</p>
                                          <p>${item.price * item.quantity}₮</p>
                                      </div>
                                  </div>
                              `
                          )
                          .join("")
                    : "<p>Your cart is empty.</p>"
            }
        </div>
        <div class="cart-line"></div>
        <div class="cart-summary">
            <p>Subtotal:</p>
            <p>${subtotal}₮</p>
        </div>
        <button class="checkout-button">Checkout</button>
    `;
}

class ShoppingCart extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div id="cart-container" class="hidden cart-container"></div>`;

    const cartButton = document.getElementById("cart-button");
    const cartContainer = document.getElementById("cart-container");
    const body = document.body;

    if (cartButton && cartContainer) {
      cartButton.addEventListener("click", () => {
          cartContainer.classList.toggle("hidden");
          body.classList.toggle("no-scroll");
      });
  }
  renderCart();

  }
}

// Export `renderCart` explicitly for use in other modules
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.renderCart = renderCart;

export { renderCart };

customElements.define("shopping-cart", ShoppingCart);