// client/components/centerfold-book.js

import { CartService } from '../js/cart-service.js'; 
// -> ES Module ашиглаж буй мөр, cart-service.js-оос CartService импортолж байна

class CenterfoldBook extends HTMLElement {
  // -> Компонентдоо аттрибутын өөрчлөлтийг ажиглахыг зааж байна (book-id)
  static get observedAttributes() {
    return ['book-id'];
  }

  constructor() {
    super();
    // Shadow DOM хэрэглэж болох ч энэ жишээнд хэрэглээгүй (global CSS-т найдаж байна)
  }

  // -> get/set нь property ба аттрибутын хооронд шууд холбоо үүсгэж байна
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
    // Элемент DOM-д нэмэгдэх үед автоматаар дуудагдана
    this.updateBook();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    // -> Аттрибут book-id солигдоход энэ функц дуудна, тэгээд updateBook()
    if (name === 'book-id' && oldVal !== newVal) {
      this.updateBook();
    }
  }

  // updateBook(): bookId-г үндэслэн window.books-оос ном хайж, render(...)-т илгээнэ
  updateBook() {
    const id = parseInt(this.bookId, 10);
    if (!window.books || window.books.length === 0) {
      // Хэрэв номын өгөгдөл бэлэн биш бол багахан хугацааны дараа дахин шалгана
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
    // Энэ элементийн дотор глобал CSS-д нийцэх HTML-ийг оруулна
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

    // "САГСЛАХ" товч дарахад CartService ашиглаж сагсанд нэмнэ
    const addToCartBtn = this.querySelector('#cfAddToCart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const items = CartService.getItems(); 
        // -> CartService.getItems() ашиглаж localStorage дээрх сагс татаж байна
        CartService.updateQuantity(items, book.id, 1); 
        // -> Өөр компонент/service-тэй холбогдож байгаа жишээ (сагс)

        if (typeof window.renderCart === 'function') {
          window.renderCart(); 
          // Хэрэв renderCart() функц байвал сагс UI-г шинэчилнэ
        }
      });
    }

    // "ДЭЛГЭРЭНГҮЙ" товч дарахад detail хуудас руу шилжинэ
    const detailBtn = this.querySelector('#cfDetail');
    if (detailBtn) {
      detailBtn.addEventListener('click', () => {
        window.location.href = `book-detail.html?id=${book.id}`;
      });
    }
  }
}

// -> <centerfold-book> гэдэг нэртэй custom element болгон бүртгэж байна
customElements.define('centerfold-book', CenterfoldBook);
