/**
 * Доорх глобал функцууд (normalizeString, applyFiltersFromQuery, clearFilters, attachListeners) 
 * нь url query string-д тулгуурлан фильтр, хайлтын утгыг уншиж, 
 * window.books-ыг шүүж, тухайн хэсгийг renderBooks(...) дуудаж байна.
 * 
 * filterTemplate нь шүүлтүүрийн UI-г shadowRoot-д оруулахад ашиглагдана.
 */

function normalizeString(str) {
  // Энэ функц: том жижиг үсгийг жигдлэх, хоосон зайг "-" болгож солих
  // Жишээ: "Science Fiction" => "science-fiction"
  return str.toLowerCase().replace(/\s+/g, "-");
}

function applyFiltersFromQuery() {
  // URL query string-ийг (window.location.search) уншиж, түүнээс "page", "search", бусад фильтрүүдийг гаргаж авна
  const params = new URLSearchParams(window.location.search); 
  // "search" параметр байгаа бол авч, байхгүй бол ""
  const searchInput = params.get("search") || ""; 

  // "search", "page" -оос бусад query параметрүүдийг бүгдийг filters массивт байршуулна
  const selectedFilters = Array.from(params.keys()).filter(
    (key) => key !== "search" && key !== "page"
  );

  // page параметрээс хуудсыг унших, байхгүй бол 1
  const page = parseInt(params.get("page"), 10) || 1;
  window.currentPage = page;

  // Энд window.books дээрх өгөгдлийг шүүж filteredBooks үүсгэж байна
  const filteredBooks = (window.books || []).filter((book) => {
    // Хайх утгыг book.title.includes(...) ашиглан шалгах
    const matchesSearch = book.title.toLowerCase().includes(searchInput.toLowerCase());
    // Бусад filters-ийг бүрэн хангаж буй эсэх
    const matchesFilters = selectedFilters.every((filter) => {
      if (filter === "price1") return book.price >= 0 && book.price <= 10000;
      if (filter === "price2") return book.price > 10000 && book.price <= 20000;
      if (filter === "price3") return book.price > 20000 && book.price <= 30000;
      if (filter === "price4") return book.price > 30000;
      if (filter.startsWith("rating-")) {
        // "rating-3" гэх мэтээс 3 гэсэн тоог салган авч, номын rating-тай харьцуулна
        const ratingThreshold = parseInt(filter.split("-")[1], 10);
        const numericValue = parseFloat(book.review ?? book.rating ?? "0") || 0;
        return numericValue >= ratingThreshold;
      }
      // Ангилалтай харьцуулахдаа normalizeString(book.category) ашиглана
      const normalizedCategory = normalizeString(book.category || "");
      return normalizedCategory === filter;
    });
    // хайлтын утга болон бүх фильтр таарч байвал true
    return matchesSearch && matchesFilters;
  });

  // Хуудаслалт: тохирох номнуудын эхлэл болон төгсгөлийг бодож, pageOfBooks үүсгэнэ
  const startIndex = (page - 1) * window.booksPerPage;
  const endIndex = startIndex + window.booksPerPage;
  const pageOfBooks = filteredBooks.slice(startIndex, endIndex);

  // renderBooks функц байгаа эсэхийг шалгаад pageOfBooks-г илгээж зурна
  if (typeof renderBooks === "function") {
    renderBooks(pageOfBooks);
  }

  // Нийт хуудсыг тооцож, window.totalPages-д хадгална
  window.totalPages = Math.ceil(filteredBooks.length / window.booksPerPage);

  // Хэрэв renderPagination тодорхойлогдсон байвал дуудаж pagination контролыг шинэчлэх
  if (typeof renderPagination === "function") {
    renderPagination();
  }
}

function clearFilters() {
  // Бүх шүүлтүүр, "search" query-г устгаж, page-ийг 1 болгож, applyFiltersFromQuery() дахин дуудаж байна
  const params = new URLSearchParams(window.location.search);
  params.delete("search");
  Array.from(params.keys()).forEach((key) => params.delete(key));

  // DOM дээрх checkbox-г цэвэрлэх (unchecked болгох)
  const filters = document.querySelectorAll("aside input[type='checkbox']");
  filters.forEach((checkbox) => {
    checkbox.checked = false;
  });

  params.set("page", "1");
  window.history.replaceState({}, "", `?${params.toString()}`);
  applyFiltersFromQuery();
}

function attachListeners() {
  // Энэ функц: DOM дээрх шүүлтүүр checkbox, search input зэрэгт event listener залгана
  const filters = document.querySelectorAll("aside input[type='checkbox']");
  
  // <store-header> элементийг хайж, shadowRoot дахь .search-input-г олох гэж оролдож байна
  const storeHeader = document.querySelector("store-header");
  let searchInput;

  if (storeHeader && storeHeader.shadowRoot) {
    searchInput = storeHeader.shadowRoot.querySelector(".search-input");
  }

  // Хэрэв searchInput олдвол input эвентэд хариу өгч, query string-д "search" параметр set/delete хийж байна
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const params = new URLSearchParams(window.location.search);
      if (searchInput.value) {
        params.set("search", searchInput.value);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      window.history.replaceState({}, "", `?${params.toString()}`);
      applyFiltersFromQuery();
    });
  }

  // Бүх checkbox-д change эвент нэмнэ
  filters.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      if (checkbox.checked) {
        // checkbox.id-г query string-д set
        params.set(checkbox.id, "true");
      } else {
        params.delete(checkbox.id);
      }
      params.set("page", "1");
      // URL-ийг шинэчлэх, дараа нь applyFiltersFromQuery() дуудаж шүүсэн номыг үзүүлэх
      window.history.replaceState({}, "", `?${params.toString()}`);
      applyFiltersFromQuery();
    });
  });

  // Дахин давтаж бичсэн хэсэг: searchInput байгаа эсэхийг шалгаад addEventListener
  // Энэ нь адилхан үйлдэл хийх тул давхар шалгаж байна
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const params = new URLSearchParams(window.location.search);
      if (searchInput.value) {
        params.set("search", searchInput.value);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      window.history.replaceState({}, "", `?${params.toString()}`);
      applyFiltersFromQuery();
    });
  }
}

// Эдгээр функцийг глобал болгож, бусад файлууд ч window.xxx гэж дуудаж чадна
window.applyFiltersFromQuery = applyFiltersFromQuery;
window.clearFilters = clearFilters;
window.attachListeners = attachListeners;
window.normalizeString = normalizeString;

// clearCart(): cartItems-ийг localStorage дээрээс цэвэрлэж, renderCart() дуудах
function clearCart() {
  localStorage.setItem('cartItems', JSON.stringify([]));
  if (typeof renderCart === 'function') {
    renderCart();
  }
}
window.clearCart = clearCart;

// filterTemplate: Shadow DOM-д ашиглах template
const filterTemplate = document.createElement('template');
filterTemplate.innerHTML = `
  <style>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

    * {
          font-family: "Finlandica", system-ui, sans-serif;
          margin: 0; 
          padding: 0; 
    }
    .clear-filters {
      margin-bottom: 20px;
      background-color: var(--text-color);
      color: var(--bg-color);
      width: 100%;
      height: 55px;
      border-radius: 10px;
      border: 0px solid var(--text-color);
      font-size: 24px;
      font-weight: 600;
      transition: background-color 0.3s ease;
    }
    .clear-filters:hover {
      background-color: #2F2F2F;
    }
    .filter-group {
      padding-top: 20px;
      padding-bottom: 20px;
      border-top: 2px solid var(--text-color);
    }
    .filter-summary {
      font-size: 32px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .summary-icon {
      font-size: 28px;
      transition: transform 0.2s;
    }
    details[open] .summary-icon {
      transform: rotate(180deg);
    }
    .filter-list {
      display: flex;
      flex-direction: column;
      row-gap: 8px;
      font-size: 26px;
      margin-top: 16px;
    }
    .filter-item {
      display: flex;
      align-items: center;
    }
    .filter-checkbox {
      width: 30px;
      height: 30px;
      background-color: transparent;
      border: 1px solid var(--text-color);
      border-radius: 5px;
      -webkit-appearance: none;
      appearance: none;
    }
    .filter-checkbox:checked {
      background-color: var(--text-color);
    }
    .filter-label {
      margin-left: 12px;
    }
    .cart-aside {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .clear-cart-button {
      background-color: var(--text-color);
      color: var(--bg-color);
      border: none;
      border-radius: 10px;
      width: 50%;
      height: 55px;
      padding: 10px 20px;
      font-size: 20px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .clear-filters:hover {
      background-color: #2F2F2F;
    }
    .cart-total-display {
      font-size: 24px;
      font-weight: bold;
    }
  </style>
  <button id="clear-filters" class="clear-filters" onclick="clearFilters()">Clear Filters</button>
  <div class="cart-aside">
    <button id="clear-cart-button" class="clear-cart-button">Clear Cart</button>
    <span id="cart-total-display" class="cart-total-display">₮0</span>
  </div>
  <details class="filter-group" open>
    <summary class="filter-summary">
      Ангилал
      <span class="summary-icon"><i class="fa-solid fa-chevron-down"></i></span>
    </summary>
    <ul class="filter-list">
      <li class="filter-item">
        <input type="checkbox" id="fiction" class="filter-checkbox">
        <label for="fiction" class="filter-label">
          <slot name="fiction-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="non-fiction" class="filter-checkbox">
        <label for="non-fiction" class="filter-label">
          <slot name="non-fiction-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="romance" class="filter-checkbox">
        <label for="romance" class="filter-label">
          <slot name="romance-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="mystery" class="filter-checkbox">
        <label for="mystery" class="filter-label">
          <slot name="mystery-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="historical" class="filter-checkbox">
        <label for="historical" class="filter-label">
          <slot name="historical-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="classic" class="filter-checkbox">
        <label for="classic" class="filter-label">
          <slot name="classic-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="biography" class="filter-checkbox">
        <label for="biography" class="filter-label">
          <slot name="biography-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="language" class="filter-checkbox">
        <label for="language" class="filter-label">
          <slot name="language-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="fantasy" class="filter-checkbox">
        <label for="fantasy" class="filter-label">
          <slot name="fantasy-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="horror" class="filter-checkbox">
        <label for="horror" class="filter-label">
          <slot name="horror-label"></slot>
        </label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="anthology" class="filter-checkbox">
        <label for="anthology" class="filter-label">
          <slot name="anthology-label"></slot>
        </label>
      </li>
    </ul>
  </details>
  <details class="filter-group">
    <summary class="filter-summary">
      Үнэлгээ
      <span class="summary-icon"><i class="fa-solid fa-chevron-down"></i></span>
    </summary>
    <ul class="filter-list">
      <li class="filter-item">
        <input type="checkbox" id="rating-5" class="filter-checkbox">
        <label for="rating-5" class="filter-label">★★★★★</label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="rating-4" class="filter-checkbox">
        <label for="rating-4" class="filter-label">★★★★☆</label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="rating-3" class="filter-checkbox">
        <label for="rating-3" class="filter-label">★★★☆☆</label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="rating-2" class="filter-checkbox">
        <label for="rating-2" class="filter-label">★★☆☆☆</label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="rating-1" class="filter-checkbox">
        <label for="rating-1" class="filter-label">★☆☆☆☆</label>
      </li>
    </ul>
  </details>
  <details class="filter-group">
    <summary class="filter-summary">
      Үнэ
      <span class="summary-icon"><i class="fa-solid fa-chevron-down"></i></span>
    </summary>
    <ul class="filter-list">
      <li class="filter-item">
        <input type="checkbox" id="price1" class="filter-checkbox">
        <label for="price1" class="filter-label">0-10000₮</label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="price2" class="filter-checkbox">
        <label for="price2" class="filter-label">10000-20000₮</label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="price3" class="filter-checkbox">
        <label for="price3" class="filter-label">20000-30000₮</label>
      </li>
      <li class="filter-item">
        <input type="checkbox" id="price4" class="filter-checkbox">
        <label for="price4" class="filter-label">30000+₮</label>
      </li>
    </ul>
  </details>
  <slot name="footer"></slot>
`;

class FilterList extends HTMLElement {
  connectedCallback() {
    // Shadow DOM үүсгэх
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    // filterTemplate-г хуулж аван shadowRoot-д нэмэх
    this.shadowRoot.appendChild(filterTemplate.content.cloneNode(true));

    // shadowRoot доторх checkbox-н change эвентыг сонсож, URL query-г шинэчилнэ
    const checkboxes = this.shadowRoot.querySelectorAll(".filter-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const params = new URLSearchParams(window.location.search);
        if (checkbox.checked) {
          params.set(checkbox.id, "true");
        } else {
          params.delete(checkbox.id);
        }
        params.set("page", "1");
        // URL-ийг replaceState ашиглан шинэчилж, applyFiltersFromQuery() дуудаж байна
        window.history.replaceState({}, "", `?${params.toString()}`);
        applyFiltersFromQuery();
      });
    });

    // "Clear Filters" товч (shadowRoot дотор) дарсан үед бүх шүүлтүүрийг цэвэрлэх
    const clearBtn = this.shadowRoot.getElementById("clear-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        // shadowRoot дахь checkbox-уудыг reset
        const checkboxes = this.shadowRoot.querySelectorAll(".filter-checkbox");
        checkboxes.forEach((cb) => cb.checked = false);

        const params = new URLSearchParams(window.location.search);
        params.delete("search");
        Array.from(params.keys()).forEach((key) => params.delete(key));
        params.set("page", "1");
        window.history.replaceState({}, "", `?${params.toString()}`);
        applyFiltersFromQuery();
      });
    }

    // "Clear Cart" товч дарахад clearCart() дуудах
    const clearCartButton = this.shadowRoot.getElementById("clear-cart-button");
    if (clearCartButton) {
      clearCartButton.addEventListener("click", () => {
        clearCart();
      });
    }

    // cart-updated эвентэд сонсогч нэмж, subtotal-ыг cart-total-display-д харуулна
    document.addEventListener('cart-updated', (e) => {
      const cartTotalDisplay = this.shadowRoot.getElementById("cart-total-display");
      if (cartTotalDisplay && e.detail && typeof e.detail.subtotal !== 'undefined') {
        cartTotalDisplay.textContent = `₮${e.detail.subtotal}`;
      }
    });
  }
}

// "filter-list" нэртэй custom element болгон бүртгэнэ
customElements.define("filter-list", FilterList);
