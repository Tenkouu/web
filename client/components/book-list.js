import { CartService } from '../js/cart-service.js'; // Сагстай харилцах үйлчилгээ

//
// 1) A small wrapper custom element <book-card-wrapper>
//    This will toggle a custom state "seen" once clicked,
//    so we can style it with :state(seen).
//
class BookCardWrapper extends HTMLElement {
  constructor() {
    super();
    // Attach elementInternals if browser supports it
    if ('attachInternals' in this) {
      this._internals = this.attachInternals();
    }
  }

  connectedCallback() {
    // Check localStorage to see if this book was previously "seen"
    const bookId = this.getAttribute('data-book-id');
    const wasSeen = localStorage.getItem(`seenBook-${bookId}`) === 'true';

    // If already seen, add the custom state (or fallback class)
    if (wasSeen) {
      this._setSeenState(true);
    }

    // When user clicks anywhere in this wrapper, set "seen"
    this.addEventListener('click', () => {
      // Mark in localStorage
      localStorage.setItem(`seenBook-${bookId}`, 'true');
      // Toggle the state
      this._setSeenState(true);
    });
  }

  _setSeenState(enable) {
    if (!this._internals) {
      // Fallback for browsers that do not support states:
      if (enable) {
        this.classList.add('seen');
      } else {
        this.classList.remove('seen');
      }
      return;
    }
    if (enable) {
      this._internals.states.add('seen');
    } else {
      this._internals.states.delete('seen');
    }
  }
}

// Register the wrapper element
customElements.define('book-card-wrapper', BookCardWrapper);

//
// 2) We add a global style for :state(seen).
//    This does NOT override your existing CSS; it just
//    adds a red border if the wrapper is in state(seen).
//
const styleTag = document.createElement('style');
styleTag.textContent = `
/* 
  If the <book-card-wrapper> is in :state(seen),
  let's force its .book-card child to have a red border.
  This won't break your existing .book-card styles.
*/
book-card-wrapper:state(seen) .book-card {
  border: 2px solid orange !important;
}

`;
document.head.appendChild(styleTag);

//
// 3) The original "renderBooks" function, mostly unchanged.
//
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

          // We wrap the entire .book-card inside <book-card-wrapper>.
          // That wrapper is what toggles the :state(seen) or .seen class.
          return `
            <book-card-wrapper data-book-id="${book.id}">
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
                        <button
                          class="small-button"
                          onclick="addToCart(${book.id})"
                        >
                          <i class="fa-solid fa-cart-shopping"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </book-card-wrapper>
          `;
        })
        .join("")
    : `<p class="not-available">Номын мэдээлэл алга байна</p>`;

  // (Unchanged snippet) for adding to cart from .add-to-cart if you had that:
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

// Make renderBooks globally accessible
window.renderBooks = renderBooks;

//
// 4) <book-list> custom element, unchanged from your code.
//
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

// Make goToDetail globally accessible
window.goToDetail = goToDetail;

// Register the <book-list> element
customElements.define("book-list", BookList);

// Also expose addToCart if that was in your global scope
// (If you're already exporting or exposing it, ignore this)
window.addToCart = function(bookId) {
  const items = CartService.getItems();
  CartService.updateQuantity(items, bookId, 1);
};
