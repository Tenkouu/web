/*******************************************************
 * book-list.js
 *
 * - Номын жагсаалтыг харуулах
 * - Номын дэлгэрэнгүй хуудас руу шилжих функцтэй
 * - Сагсанд нэмэх товчтой
 *******************************************************/
import { CartService } from '../js/cart-service.js'; // Сагстай харилцах үйлчилгээ

/**
 * Номын жагсаалтыг харуулах
 * @param {Array} bookList Номын массив
 */
function renderBooks(bookList) {
  const bookGrid = document.getElementById("book-grid");
  if (!bookGrid) {
    console.error("Алдаа: 'book-grid' элемент DOM-д олдсонгүй.");
    return;
  }

  // Номын жагсаалтыг HTML-ээр харуулах
  bookGrid.innerHTML = bookList.length
    ? bookList
        .map((book) => {
          // Үнэлгээ эсвэл дүнг тооцоолох, байхгүй бол 0-г сонгох
          const ratingValue = parseFloat(
            book.review !== undefined
              ? book.review
              : book.rating !== undefined
              ? book.rating
              : "0"
          ) || 0;

          return `
            <div class="book-card">
              <img
                src="${book.cover_image}"
                alt="${book.title}"
                style="cursor: pointer;"
                onclick="goToDetail(${book.id})"
              />
              <div class="book-card-details">
                <div class="book-card-wrapped">
                  <div class="book-card-justify">
                    <p class="category">${book.category}</p>
                    <p class="rating">★ ${ratingValue.toFixed(1)}</p>
                  </div>
                  <h3 class="book-card-title">${book.title}</h3>
                  <p class="book-card-author">by ${book.author || "Unknown"}</p>
                  <div class="book-card-bottoms">
                    <p class="book-card-price">${book.price}₮</p>
                    <div class="book-card-buttons">
                      <button class="small-button" onclick="addToCart(${book.id})">
                        <i class="fa-solid fa-cart-shopping"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("")
    : `<p class="not-available">Номын мэдээлэл алга байна</p>`;

  // Хэрэв локал pagination ашиглаж байгаа бол энд slice хийх.
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        const bookId = parseInt(event.target.dataset.id, 10);
        const book = bookList.find(b => b.id === bookId);
        if (book) {
            CartService.addToCart(book); // Сагсанд нэмэх
        }
    });
  });
}

// Глобал функц болгон бүртгэх, бусад скриптээс дуудах боломжтой
window.renderBooks = renderBooks;

/**
 * <book-list> хэрэглэгчийн элементийг тодорхойлох
 * Номын жагсаалтыг харуулахад зориулсан book-grid контейнерыг үүсгэдэг
 */
class BookList extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="book-grid" class="book-grid"></section>
    `;
  }
}

/**
 * Номын дэлгэрэнгүй мэдээлэл рүү шилжих функц
 * @param {number} bookId Номын ID
 */
function goToDetail(bookId) {
  window.location = `book-detail.html?id=${bookId}`; // Номын дэлгэрэнгүй хуудас руу чиглүүлэх
}

// Глобал функц болгон бүртгэх
window.renderBooks = renderBooks;
window.goToDetail = goToDetail;

// <book-list> элементийг бүртгэх
customElements.define("book-list", BookList);
