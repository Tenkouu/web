// client/components/shopping-cart.js

import { CartService } from '../js/cart-service.js'; // CartService нь сагсны өгөгдөлтэй ажиллахад шаардлагатай үйлчилгээ юм.

/**
 * Номыг сагсанд нэмэх функц.
 * @param {number} bookId - Номын ID
 */
function addToCart(bookId) {
  const items = CartService.getItems(); // Одоогийн сагсны өгөгдлийг авах
  CartService.updateQuantity(items, bookId, 1); // Номын тоог 1-ээр нэмэх
  renderCart(); // Сагсны UI-г дахин зурах
}

/**
 * Сагсны барааны тоог өөрчлөх функц.
 * @param {number} bookId - Номын ID
 * @param {number} delta - Өөрчлөлтийн хэмжээ (-1 эсвэл +1)
 */
function updateCartItem(bookId, delta) {
  const items = CartService.getItems(); // Сагсны өгөгдлийг авах
  CartService.updateQuantity(items, bookId, delta); // Барааны тоог нэмэх эсвэл хасах
  renderCart(); // Сагсны UI-г дахин зурах
}

/**
 * Сагсны UI-г зурах функц.
 */
function renderCart() {
  const cartContainer = document.getElementById("cart-container"); // Сагсны үндсэн контейнер
  if (!cartContainer) {
    console.error("Error: 'cart-container' элемент олдсонгүй."); // Хэрэв элемент байхгүй бол алдаа хэвлэх
    return;
  }

  const cartItems = CartService.getItems(); // Сагсны бүх барааг авах
  if (!cartItems || cartItems.length === 0) {
    cartContainer.innerHTML = `<p>Таны сагс хоосон байна.</p>`; // Хэрэв сагс хоосон бол мессеж харуулах
    return;
  }

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0); // Нийт үнийг тооцоолох

  // Сагсны контентыг HTML-д зурах
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
          : "<p>Таны сагс хоосон байна.</p>" // Өөр сагсны бараа байхгүй тохиолдолд
      }
    </div>
    <div class="cart-line"></div>
    <div class="cart-summary">
      <p>Нийт:</p>
      <p>${subtotal}₮</p>
    </div>
    <button class="checkout-button">Төлбөр хийх</button>
  `;
}

/**
 * Сагсны custom element
 */
class ShoppingCart extends HTMLElement {
  connectedCallback() {
    // Эхлээд сагсны контейнерийг HTML-д оруулах
    this.innerHTML = `<div id="cart-container" class="hidden cart-container"></div>`;

    const cartButton = document.getElementById("cart-button"); // Сагс харуулах товч
    const cartContainer = document.getElementById("cart-container"); // Сагсны контейнер
    const body = document.body; // Бүх биеэ хянах

    if (cartButton && cartContainer) {
      // Сагс харуулах/нуух үйлдлийг хийх
      cartButton.addEventListener("click", () => {
        cartContainer.classList.toggle("hidden"); // Сагсны харагдах байдлыг өөрчлөх
        body.classList.toggle("no-scroll"); // Scroll-ыг хаах/нээх
      });
    }

    renderCart(); // Эхний удаад сагсыг зурах
  }
}

// addToCart, updateCartItem, renderCart функцуудыг глобал болгох
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.renderCart = renderCart;

export { renderCart }; // Бусад модулиудад ашиглагдах

// shopping-cart элементийг бүртгэх
customElements.define("shopping-cart", ShoppingCart);
