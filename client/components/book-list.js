import { CartService } from '../js/cart-service.js'; 

class BookCardWrapper extends HTMLElement {
  constructor() {
    super();
    // attachInternals ашиглаж, бүх орчинд дэмжлэгтэй гэж үзэж байна.
    // Энэ нь уг элементийн дотоод төлөв (states)-г удирдах боломж олгодог.
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    // Энэ функц нь элемент DOM-д байрлах үед автоматаар дуудагдана.
    
    // 1. data-book-id аттрибутын утгыг уншиж байна (энэ нь тухайн номын ID байна).
    const bookId = this.getAttribute('data-book-id');
    
    // 2. localStorage-аас тухайн номыг өмнө нь хэрэглэгч "харсан" эсэхийг шалгаж байна.
    // Хэрэв localStorage-д "seenBook-<bookId>" түлхүүрийн утга "true" бол энэ номыг өмнө нь харсан гэж үзнэ.
    const wasSeen = localStorage.getItem(`seenBook-${bookId}`) === 'true';
    
    // 3. Хэрэв өмнө нь харсан бол "seen" төлөвийг идэвхжүүлнэ.
    if (wasSeen) {
      this._setSeenState(true);
    }

    // Бүхэл wrapper-д дарсан тохиолдолд "seen" төлөвийг идэвхжүүлэх
    this.addEventListener('click', () => {
      localStorage.setItem(`seenBook-${bookId}`, 'true');
      this._setSeenState(true);
    });
  }

  _setSeenState(enable) {
    // enable=true бол "seen" төлөвийг идэвхжүүлнэ,
    // enable=false бол "seen" төлөвийг устгана.
    if (enable) {
      this._internals.states.add('seen');
    } else {
      this._internals.states.delete('seen');
    }
  }
}

// book-card-wrapper гэдэг нэртэй custom element болгон бүртгэж байна
customElements.define('book-card-wrapper', BookCardWrapper);

// styleTag гэдэг <style> таг үүсгэн, document.head руу нэмнэ
const styleTag = document.createElement('style');
styleTag.textContent = `
book-card-wrapper:state(seen) .book-card {
  border: 2px solid orange !important;
}
`;
document.head.appendChild(styleTag);

// renderBooks: Номын массивыг авч, DOM дээр bookGrid дотор HTML-ээр үзүүлэх функц
function renderBooks(bookList) {
  const bookGrid = document.getElementById("book-grid");
  // Хэрэв book-grid элемент олдохгүй бол консолд мэдээлж return
  if (!bookGrid) {
    console.error("Алдаа: 'book-grid' элемент DOM-д олдсонгүй.");
    return;
  }

  // bookList массив хоосон биш бол map ашиглан тус бүрийг HTML рүү хөрвүүлнэ, эс бөгөөс "Ном алга" гэдэг бичиг гаргана
  bookGrid.innerHTML = bookList.length
    ? bookList
        .map((book) => { // -> array.map(...) ашиглаж байна
          // ratingValue: номд "review" эсвэл "rating" талбар байвал parseFloat хийж авч, байхгүй бол 0
          const ratingValue = parseFloat(
            book.review !== undefined
              ? book.review
              : book.rating !== undefined
              ? book.rating
              : "0"
          ) || 0;

          // <book-card-wrapper data-book-id="..."> дотор .book-card-аа байршуулна
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

  // ".add-to-cart" класстай товчнууд дээр listener нэмнэ (fallback)
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
// renderBooks функцыг глобал болгож, өөр газраас дуудах боломжтой
window.renderBooks = renderBooks;

// BookList гэдэг custom element
class BookList extends HTMLElement {
  connectedCallback() {
    // connectedCallback() үед #book-grid бүхий <section> үүсгэж байна
    this.innerHTML = `
      <section id="book-grid" class="book-grid"></section>
    `;
  }
}

// goToDetail(bookId): тухайн номын book-detail.html?id=... руу шилжих туслах функц
function goToDetail(bookId) {
  window.location = `book-detail.html?id=${bookId}`;
}
window.goToDetail = goToDetail;

// book-list нэрээр custom element бүртгэнэ
customElements.define("book-list", BookList);

// addToCart: сагсанд ном нэмэх функц, CartService ашиглана
window.addToCart = function(bookId) {
  const items = CartService.getItems();
  CartService.updateQuantity(items, bookId, 1); // -> CartService ашиглаж бусад компоненттэй холбоотой үйлдэл хийж байна
};
