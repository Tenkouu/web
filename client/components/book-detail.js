import { CartService } from '../js/cart-service.js';
import { renderCart } from '../components/shopping-cart.js'; // to update cart UI

class BookDetail extends HTMLElement {
  connectedCallback() {
    this.renderSoloBook();
  }

  renderSoloBook() {
    const params = new URLSearchParams(window.location.search);
    const bookId = parseInt(params.get("id"), 10);

    if (!window.books || window.books.length === 0) {
      setTimeout(() => this.renderSoloBook(), 100);
      return;
    }

    const book = window.books.find((b) => b.id === bookId);
    if (!book) {
      this.innerHTML = `<p>Sorry, book not found.</p>`;
      return;
    }
    
    this.innerHTML = `
      <main class="solo-book-main">
        <img src="${book.cover_image}" alt="${book.title}" class="solo-book-image"/>
        <div class="solo-book-info">
          <h1 class="solo-book-title">${book.title}</h1>
          <section class="solo-book-details">
            <p class="solo-book-text">by ${book.author}</p>
            <p class="solo-book-text">${book.category}</p>
          </section>
          <h2 class="solo-book-price">Үнэ: ${book.price}₮</h2>
          <p class="solo-book-description">${book.description}</p>
          <div class="solo-book-grid">
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">ISBN:</h6>
              <p class="solo-book-text">${book.isbn || "N/A"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Published:</h6>
              <p class="solo-book-text">${book.publish_date || "N/A"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Language:</h6>
              <p class="solo-book-text">${book.language || "N/A"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Publisher:</h6>
              <p class="solo-book-text">${book.publisher || "N/A"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Pages:</h6>
              <p class="solo-book-text">${book.pages || "N/A"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Format:</h6>
              <p class="solo-book-text">${book.format || "N/A"}</p>
            </div>
            <button class="solo-add-cart">
              <i class="fa-solid fa-cart-shopping"></i> САГСЛАХ
            </button>
            <button class="solo-back" onclick="history.back()">
              <i class="fa-solid fa-backward"></i> БУЦАХ
            </button>
          </div>
        </div>
      </main>
    `;

    const addToCartButton = this.querySelector('.solo-add-cart');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
        const cartItems = CartService.getItems();
        // This will now add an item if it doesn't exist already.
        CartService.updateQuantity(cartItems, bookId, 1);
        renderCart(); // Refresh cart UI
      });
    }
  }
}

customElements.define("book-detail", BookDetail); 
