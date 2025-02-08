import { CartService } from '../js/cart-service.js'; 
// CartService-г ашиглаж localStorage дахь сагсны өгөгдөлтэй харьцана

/**
 * addToCart(bookId):
 * - Номын ID-г 1 ширхгээр сагсанд нэмэх
 */
function addToCart(bookId) {
  const items = CartService.getItems(); 
  CartService.updateQuantity(items, bookId, 1);
  renderCart();
}

/**
 * updateCartItem(bookId, delta):
 * - Номын тоо ширхгийг delta (/+1, -1/) аар шинэчилнэ
 */
function updateCartItem(bookId, delta) {
  const items = CartService.getItems();
  CartService.updateQuantity(items, bookId, delta);
  renderCart();
}

/**
 * renderCart():
 * - <shopping-cart> элементэд сагсны UI-г зурах
 * - "cart-updated" гэх custom эвент dispatch хийж бусад компонентэд мэдэгдэнэ
 */
function renderCart() {
  const shoppingCartEl = document.querySelector("shopping-cart");
  if (!shoppingCartEl) {
    console.error("Error: 'shopping-cart' element not found.");
    return;
  }
  // -> Shadow DOM ашигладаг тул shadowRoot дотороос хайна (✔ Shadow DOM requirement)
  const cartContainer = shoppingCartEl.shadowRoot.getElementById("cart-container");
  if (!cartContainer) {
    console.error("Error: 'cart-container' not found in shadow DOM.");
    return;
  }
  
  const cartItems = CartService.getItems();
  const subtotalElem = shoppingCartEl.shadowRoot.getElementById("subtotal");
  
  if (!cartItems || cartItems.length === 0) {
    cartContainer.querySelector(".cart-items").innerHTML = `<p>Таны сагс хоосон байна.</p>`;
    if (subtotalElem) subtotalElem.textContent = "0₮";
    // -> "cart-updated" custom эвент ашиглаж байна 
    document.dispatchEvent(new CustomEvent('cart-updated', {
      bubbles: true,
      composed: true,
      detail: { subtotal: 0 }
    }));
    return;
  }
  
  // -> array.reduce(...) ашиглаж нийт үнэ бодож байна 
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const itemsHTML = cartItems.map(item => `
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
  `).join("");
  
  cartContainer.querySelector(".cart-items").innerHTML = itemsHTML;
  if (subtotalElem) subtotalElem.textContent = `${subtotal}₮`;
  
  // -> "cart-updated" эвент (✔ CustomEvent, communication between components)
  document.dispatchEvent(new CustomEvent('cart-updated', {
    bubbles: true,
    composed: true,
    detail: { subtotal }
  }));
}

// -> Глобал функц болгож байна (✔ module usage)
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.renderCart = renderCart;
export { renderCart };

class ShoppingCart extends HTMLElement {
  connectedCallback() {
    // -> connectedCallback: <shopping-cart> DOM-д орох үед автоматаар дуудагдана
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    // -> Shadow DOM дотор HTML, CSS байрлуулж байна (✔ Shadow DOM usage)
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
        * {
              font-family: "Finlandica", system-ui, sans-serif;
              margin: 0; 
              padding: 0; 
        }
        .cart-container {
          display: none;
          position: fixed;
          top: 103px;
          right: 0;
          height: calc(100% - 90px);
          width: 344px;
          padding: 20px;
          background-color: var(--bg-color);
          border-left: 3px solid var(--text-color);
          z-index: 50;
          color: var(--text-color);
          font-size: 24px;
          font-weight: bold;
          line-height: 1;
        }
        .cart-container:not(.hidden) {
          display: block;
        }
        .cart-items {
          overflow-y: auto;
          row-gap: 20px;
          height: calc(100% - 200px);
          display: flex;
          flex-direction: column;
        }
        .cart-item {
          display: flex;
          flex-direction: column;
          row-gap: 10px;
        }
        .item-info {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          font-size: 20px;
        }
        .item-title {
          width: 198px;
          font-size: 22px;
        }
        .item-controls {
          display: flex;
          align-items: center;
        }
        .plus-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          border: none;
          box-shadow: none;
          outline: none;
          cursor: pointer;
        }
        .item-quantity {
          margin-left: 15px;
          margin-right: 15px;
        }
        .item-author {
          width: 198px;
          font-weight: 500;
        }
        .cart-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cart-line {
          background-color: var(--text-color);
          height: 2px;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .checkout-button {
          background-color: var(--text-color);
          color: var(--bg-color);
          width: 100%;
          height: 55px;
          border-radius: 6px;
          border: 0px solid var(--text-color);
          font-size: 24px;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
      <div id="cart-container" class="cart-container hidden">
        <div class="cart-items"></div>
        <div class="cart-line"></div>
        <div class="cart-summary">
          <p>Нийт:</p>
          <p id="subtotal"></p>
        </div>
        <button class="checkout-button">Төлбөр хийх</button>
      </div>
    `;
    
    // -> "toggle-cart" эвентэд сонсогч: бусад газар document.dispatchEvent(new CustomEvent('toggle-cart')) 
    //   хийж сагсны UI-г нээх/хаах
    document.addEventListener('toggle-cart', () => {
      const cartContainer = this.shadowRoot.getElementById("cart-container");
      cartContainer.classList.toggle("hidden");
      document.body.classList.toggle("no-scroll");
    });
    
    // Эхний удаад renderCart() дуудаж, сагсыг зурна
    renderCart();
  }
}

// <shopping-cart> гэдэг custom element болгон бүртгэж байна
customElements.define("shopping-cart", ShoppingCart);
