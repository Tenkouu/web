import { renderCart } from '../components/shopping-cart.js'; // Сагсны UI-г шинэчлэх зориулалттай функц
import { CartService } from '../js/cart-service.js';

class BookDetail extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM үүсгэх (open горимтой)
    this.attachShadow({ mode: 'open' });

    // Энэ элемент дээр үзүүлэх номын мэдээлэл
    this.book = null;
  }

  async connectedCallback() {
    /**
     * connectedCallback():
     * - <book-detail> элементийг DOM-д нэмэгдэнгүүт автоматаар дуудагдана.
     * - URL-ээс "id" параметрыг уншиж, тухайн номыг window.books-оос хайна.
     */

    // 1) URL параметрийн 'id'-г унших
    const params = new URLSearchParams(window.location.search);
    const bookId = parseInt(params.get("id"), 10);

    // 2) Хэрэв window.books глобал массиваар номын өгөгдөл хараахан ачаалагдаагүй байвал дахин оролдоно
    if (!window.books || window.books.length === 0) {
      // 100 миллисекунд хүлээгээд, дахин connectedCallback() дуудах
      setTimeout(() => this.connectedCallback(), 100);
      return;
    }

    // 3) Номын ID-г массив дотроос хайх
    const found = window.books.find(b => b.id === bookId);
    if (!found) {
      // Хэрэв олдохгүй бол алдааны UI-г үзүүлэх
      this.renderError();
      return;
    }
    this.book = found;

    // 4) "bookloaded" гэдэг CustomEvent зарлаж, номын гарчгийг дамжуулах
    // (Жишээ нь: document.addEventListener('bookloaded', ...) хийхэд ашиглаж болно)
    this.dispatchEvent(new CustomEvent("bookloaded", {
      bubbles: true,
      composed: true,
      detail: { title: this.book.title }
    }));

    // 5) Номын мэдээллийг дэлгэцэд үзүүлэх
    this.render();
  }

  renderError() {
    /**
     * - Хэрэв ном олдохгүй бол Shadow DOM дотроо алдааны HTML-ийг оруулж харагдуулах
     * - 404 гэсэн текст, буцах товч зэрэг UI
     */
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Finlandica', sans-serif;
        }
        .error-container {
          text-align: center;
          padding: 2rem;
        }
        .error-title {
          font-size: 3rem;
          color: var(--primary-color, #007bff);
        }
        .back-button {
          background: var(--primary-color, #007bff);
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 15px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.9em;
          transition: background 0.3s ease, transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .back-button:hover {
          background: var(--primary-color-dark, #0056b3);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .back-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      </style>
      <div class="error-container">
        <h2 class="error-title">404</h2>
        <p>Уучлаарай. Таны хайсан ном олдсонгүй.</p>
        <button class="back-button" onclick="window.history.back()">Буцах</button>
      </div>
    `;
  }

  render() {
    /**
     * - Хэрэв this.book байхгүй бол юу ч хийхгүй буцах
     * - Номын мэдээллийг HTML-д оруулж, Shadow DOM дотор HTML & CSS зурах
     */
    if (!this.book) return;

    // 1) Номын өгөгдлийг fallback-тайгаар нэг объект болгон бэлдэх
    const book = {
      title: this.book.title,
      author: this.book.author,
      price: this.book.price,
      category: this.book.category,
      description: this.book.description || "No description available.",
      isbn: this.book.isbn || "N/A",
      publisher: this.book.publisher || "N/A",
      publish_date: this.book.publish_date || "N/A",
      pages: this.book.pages || "N/A",
      language: this.book.language || "N/A",
      format: this.book.format || "Paperback",
      coverImage: this.book.cover_image
    };

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
        * {
          margin: 0; 
          padding: 0; 
          font-family: 'Finlandica', system-ui, sans-serif;
        }
        .solo-book-main {
          display: flex;
          flex-direction: row;
          margin-top: 40px;
          margin-left: 52px;
          margin-right: 52px;
          border: 3px solid var(--text-color);
          border-radius: 10px;
          padding: 35px;
        }
        .solo-book-image {
          width: auto;
          height: 658px;
          margin-right: 70px;
          border-radius: 10px;
          object-fit: cover;
        }
        .solo-book-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }
        .solo-book-price {
          font-size: 40px;
          color: var(--text-color);
          font-style: italic;
        }
        .solo-book-description {
          font-size: 32px;
          font-style: italic;
          line-height: 1.25;
          margin: 20px 0;
          color: var(--text-color);
        }
        .solo-book-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 35px;
        }
        .solo-book-additional {
          display: flex;
          flex-direction: column;
        }
        .solo-book-highlight {
          font-weight: bold;
          font-size: 36px;
        }
        .solo-book-title {
            font-size: 60px;
            font-weight: bold;
        }
        .solo-book-details {
            display: flex;
            flex-direction: row;
            column-gap: 180px;
        }
        .solo-book-text{
            font-size: 36px;
        }
        .solo-add-cart {
          grid-column: span 2 / span 2;
        }
        .solo-back, .solo-add-cart {
          background-color: var(--text-color);
          color: var(--bg-color);
          border: 0px solid var(--text-color);
          border-radius: 10px;
          transition: background-color 0.3s, color 0.3s;
          height: 74px;
          font-size: 32px;
          font-weight: 600;
        }
        .solo-back:hover, .solo-add-cart:hover {
          background-color: #595959;
        }
        .solo-back i, .solo-add-cart i {
          font-size: 32px;
          margin-right: 15px;
        }
        @media (max-width: 1024px) {
          .solo-book-main {
            flex-direction: column;
            margin: 20px;
            padding: 20px;
          }
          .solo-book-image {
            width: 100%;
            height: auto;
            margin-right: 0;
          }
        }
        @media (max-width: 768px) {
          :host {
            padding: 20px;
          }
          .solo-book-main {
            padding: 20px;
          }
          .solo-book-grid {
            grid-template-columns: 1fr;
          }
          .solo-book-title {
            font-size: 2em;
          }
        }
        @media (orientation: landscape) and (max-width: 1024px) {
          .solo-book-image {
            max-height: 70vh;
            width: auto;
            max-width: 100%;
          }
        }
      </style>
      <main class="solo-book-main">
        <img src="${book.coverImage}" alt="${book.title}" class="solo-book-image">
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
              <p class="solo-book-text">${book.isbn || "Байхгүй"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Хэвлэгдсэн:</h6>
              <p class="solo-book-text">${book.publish_date || "Байхгүй"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Хэл:</h6>
              <p class="solo-book-text">${book.language || "Байхгүй"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Хэвлэгч:</h6>
              <p class="solo-book-text">${book.publisher || "Байхгүй"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Хуудас:</h6>
              <p class="solo-book-text">${book.pages || "Байхгүй"}</p>
            </div>
            <div class="solo-book-additional">
              <h6 class="solo-book-highlight">Формат:</h6>
              <p class="solo-book-text">${book.format || "Байхгүй"}</p>
            </div>
            <button class="solo-add-cart">
              <i class="fa-solid fa-cart-shopping"></i> САГСЛАХ
            </button>
            <button class="solo-back" id="backBtn">
              <i class="fa-solid fa-backward"></i> БУЦАХ
            </button>
          </div>
        </div>
      </main>
    `;

    // 3) Дотроо Add to Cart болон Буцах товчнуудад eventListener залгах
    const addCartBtn = this.shadowRoot.querySelector('.solo-add-cart');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        /**
         * - 'САГСЛАХ' товч дарахад CartService ашиглан тухайн номыг 1 ширхэгээр нэмнэ.
         * - Дараа нь renderCart() байвал сагсны UI-г шинэчилнэ.
         */
        const items = CartService.getItems();
        CartService.updateQuantity(items, this.book.id, 1);
        if (typeof renderCart === 'function') {
          renderCart();
        }
      });
    }

    // 4) "Буцах" товч (id="backBtn") дээр дарвал түүхэнд буцах
    const backBtn = this.shadowRoot.querySelector('#backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => window.history.back());
    }
  }
}

// <book-detail> custom element болгон бүртгэх
customElements.define('book-detail', BookDetail);
