// client/components/book-list.js
import { CartService } from '../js/cart-service.js';

function renderBooks(bookList) {
  const bookGrid = document.getElementById("book-grid");
  if (!bookGrid) {
    console.error("Error: 'book-grid' element not found in the DOM.");
    return;
  }

  bookGrid.innerHTML = bookList.length
    ? bookList
        .map((book) => {
          // Convert review or rating to a float if present, fallback to 0
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
    : `<p class="not-available">No books available</p>`;

  // If you do local pagination, slice here. Otherwise, if the server does pagination, no need.
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        const bookId = parseInt(event.target.dataset.id, 10);
        const book = bookList.find(b => b.id === bookId);
        if (book) {
            CartService.addToCart(book);
        }
    });
});
}

// Expose globally so other scripts can call them
window.renderBooks = renderBooks;

// The custom element that provides the #book-grid container
class BookList extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="book-grid" class="book-grid"></section>
    `;
  }
}

function goToDetail(bookId) {
  window.location = `book-detail.html?id=${bookId}`;
}

window.renderBooks = renderBooks;
window.goToDetail = goToDetail;


customElements.define("book-list", BookList);