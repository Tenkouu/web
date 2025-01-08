/***
 * book-detail.js
 *
 * - Номын дэлгэрэнгүй мэдээллийг харуулах
 * - Сагсанд ном нэмэх функцтэй
 * - Буцах товчоор өмнөх хуудас руу шилжих
 */
import { CartService } from '../js/cart-service.js'; // Сагстай харилцах
import { renderCart } from '../components/shopping-cart.js'; // Сагсны UI-г шинэчлэх

class BookDetail extends HTMLElement {
  // <book-detail> элемент DOM-д нэмэгдэх үед дуудагдана
  connectedCallback() {
    this.renderSoloBook(); // Номын дэлгэрэнгүй мэдээллийг харуулах
  }

  /**
   * Номын дэлгэрэнгүй мэдээллийг харуулах функц
   */
  renderSoloBook() {
    // URL-аас номын ID-г авах
    const params = new URLSearchParams(window.location.search);
    const bookId = parseInt(params.get("id"), 10);

    // Хэрэв window.books хоосон байвал 100мс-ийн дараа дахин шалгах
    if (!window.books || window.books.length === 0) {
      setTimeout(() => this.renderSoloBook(), 100);
      return;
    }

    // ID-аар номыг хайх
    const book = window.books.find((b) => b.id === bookId);
    if (!book) {
      this.innerHTML = `<p>Уучлаарай, ийм ном олдсонгүй.</p>`;
      return;
    }
    
    // Номын дэлгэрэнгүй мэдээллийн HTML-ийг үүсгэх
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
            <button class="solo-back" onclick="history.back()">
              <i class="fa-solid fa-backward"></i> БУЦАХ
            </button>
          </div>
        </div>
      </main>
    `;

    // Сагсанд нэмэх товчны үйлдлийг холбох
    const addToCartButton = this.querySelector('.solo-add-cart');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
        const cartItems = CartService.getItems();
        // Хэрэв ном сагсанд байхгүй бол нэмнэ
        CartService.updateQuantity(cartItems, bookId, 1);
        renderCart(); // Сагсны UI-г шинэчлэх
      });
    }
  }
}

// <book-detail> элементийг бүртгэх
customElements.define("book-detail", BookDetail);
