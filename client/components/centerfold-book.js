// client/components/centerfold-book.js

import { CartService } from '../js/cart-service.js';
// import { renderCart } from './shopping-cart.js'; // if needed

/**
 * <centerfold-book book-id="123"></centerfold-book>
 * 
 *  - Dynamically shows a "centerfold" section, styled via your global `.centerfold` CSS.
 *  - Observes changes to [book-id] attribute; re-renders if updated.
 */
class CenterfoldBook extends HTMLElement {
  static get observedAttributes() {
    return ['book-id'];
  }

  constructor() {
    super();
    /**
     * By default, we do NOT attach a Shadow DOM so that
     * your global CSS classes like .centerfold, .solo-book-title, etc.
     * can style this element.
     */
  }

  // A property "bookId" that reflects to the attribute "book-id"
  get bookId() {
    return this.getAttribute('book-id');
  }
  set bookId(value) {
    if (value) {
      this.setAttribute('book-id', value);
    } else {
      this.removeAttribute('book-id');
    }
  }

  connectedCallback() {
    // Once connected, load the current book
    this.updateBook();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'book-id' && oldVal !== newVal) {
      this.updateBook();
    }
  }

  /**
   * Looks up the book in `window.books` using the given bookId,
   * then calls render().
   */
  updateBook() {
    const id = parseInt(this.bookId, 10);
    if (!window.books || window.books.length === 0) {
        setTimeout(() => this.connectedCallback(), 100);
        return;
      }
    const found = window.books.find(b => b.id === id);
    if (!found) {
      this.innerHTML = `<p>Book with id ${id} not found.</p>`;
      return;
    }
    this.render(found);
  }

  render(book) {
    // We rely on your global CSS: .centerfold, .centerfold-content, .solo-book-title, etc.
    this.innerHTML = `
      <article class="centerfold">
        <img src="${book.cover_image}" alt="${book.title}" class="centerfold-image">
        <section class="centerfold-content">
          <h2 class="solo-book-title">${book.title}</h2>
          <section class="solo-book-details">
            <p class="solo-book-text">by ${book.author || ''}</p>
            <p class="solo-book-text">${book.category || ''}</p>
          </section>
          <p class="centerfold-description">${book.description || ''}</p>
          <section class="pricing">
            <p class="pricing-current">${book.price || 0}₮</p>
          </section>

          <div class="two-buttons">
            <button class="action-button" id="cfAddToCart">
              <i class="fa-solid fa-cart-shopping action-button-icon"></i>
              САГСЛАХ
            </button>

            <button class="action-button" id="cfDetail">
              <i class="fa-solid fa-circle-info action-button-icon"></i>
              ДЭЛГЭРЭНГҮЙ
            </button>
          </div>
        </section>
      </article>
    `;

    // Handle "Add to Cart"
    const addToCartBtn = this.querySelector('#cfAddToCart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const items = CartService.getItems();
        CartService.updateQuantity(items, book.id, 1);
        // If you use renderCart or dispatch an event:
        if (typeof window.renderCart === 'function') {
          window.renderCart();
        }
      });
    }

    // Handle "Detail" button -> go to detail page
    const detailBtn = this.querySelector('#cfDetail');
    if (detailBtn) {
      detailBtn.addEventListener('click', () => {
        window.location.href = `book-detail.html?id=${book.id}`;
      });
    }
  }
}

customElements.define('centerfold-book', CenterfoldBook);
