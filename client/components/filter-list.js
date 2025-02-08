// Global functions – DO NOT change these
function normalizeString(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

function applyFiltersFromQuery() {
  const params = new URLSearchParams(window.location.search); // Read URL query string
  const searchInput = params.get("search") || ""; // Get search term

  // Add all query parameters except "search" and "page" as selected filters
  const selectedFilters = Array.from(params.keys()).filter(
    (key) => key !== "search" && key !== "page"
  );

  // Read the page parameter; default to 1
  const page = parseInt(params.get("page"), 10) || 1;
  window.currentPage = page;

  // Filter the books
  const filteredBooks = (window.books || []).filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchInput.toLowerCase());
    const matchesFilters = selectedFilters.every((filter) => {
      if (filter === "price1") return book.price >= 0 && book.price <= 10000;
      if (filter === "price2") return book.price > 10000 && book.price <= 20000;
      if (filter === "price3") return book.price > 20000 && book.price <= 30000;
      if (filter === "price4") return book.price > 30000;
      if (filter.startsWith("rating-")) {
        const ratingThreshold = parseInt(filter.split("-")[1], 10);
        const numericValue = parseFloat(book.review ?? book.rating ?? "0") || 0;
        return numericValue >= ratingThreshold;
      }
      const normalizedCategory = normalizeString(book.category || "");
      return normalizedCategory === filter;
    });
    return matchesSearch && matchesFilters;
  });

  // Pagination: slice the filtered books
  const startIndex = (page - 1) * window.booksPerPage;
  const endIndex = startIndex + window.booksPerPage;
  const pageOfBooks = filteredBooks.slice(startIndex, endIndex);

  if (typeof renderBooks === "function") {
    renderBooks(pageOfBooks);
  }

  window.totalPages = Math.ceil(filteredBooks.length / window.booksPerPage);

  if (typeof renderPagination === "function") {
    renderPagination();
  }
}

function clearFilters() {
  const params = new URLSearchParams(window.location.search);
  params.delete("search");
  Array.from(params.keys()).forEach((key) => params.delete(key));

  // Reset checkbox states (if the checkboxes are in the light DOM, this code might need updating)
  const filters = document.querySelectorAll("aside input[type='checkbox']");
  filters.forEach((checkbox) => {
    checkbox.checked = false;
  });

  params.set("page", "1");
  window.history.replaceState({}, "", `?${params.toString()}`);

  applyFiltersFromQuery();
}

function attachListeners() {
  const filters = document.querySelectorAll("aside input[type='checkbox']");
// Find <store-header> in the light DOM
const storeHeader = document.querySelector("store-header");
let searchInput;

// If <store-header> exists and has a shadowRoot, find the input inside it
if (storeHeader && storeHeader.shadowRoot) {
  searchInput = storeHeader.shadowRoot.querySelector(".search-input");
}

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

  filters.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      if (checkbox.checked) {
        params.set(checkbox.id, "true");
      } else {
        params.delete(checkbox.id);
      }
      params.set("page", "1");
      window.history.replaceState({}, "", `?${params.toString()}`);
      applyFiltersFromQuery();
    });
  });

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

window.applyFiltersFromQuery = applyFiltersFromQuery;
window.clearFilters = clearFilters;
window.attachListeners = attachListeners;
window.normalizeString = normalizeString;

// --- New Functionality for Cart Clearing ---
function clearCart() {
  // Clear the cart by setting an empty array in localStorage
  localStorage.setItem('cartItems', JSON.stringify([]));
  if (typeof renderCart === 'function') {
    renderCart();
  }
}
window.clearCart = clearCart;

// --- Template with Named Slots for Filter List and Cart Summary ---
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
    /* New CSS for cart summary section in aside */
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
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    // Append template content
    this.shadowRoot.appendChild(filterTemplate.content.cloneNode(true));

    // Attach event listeners for checkboxes within the shadow DOM.
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
        window.history.replaceState({}, "", `?${params.toString()}`);
        applyFiltersFromQuery();
      });
    });

    // Attach listener for the clear filters button.
    const clearBtn = this.shadowRoot.getElementById("clear-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        // Reset checkboxes in shadow DOM.
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

    // Attach event listener for the clear cart button.
    const clearCartButton = this.shadowRoot.getElementById("clear-cart-button");
    if (clearCartButton) {
      clearCartButton.addEventListener("click", () => {
        clearCart();
      });
    }

    // Listen for global "cart-updated" events to update the cart total in the aside.
    document.addEventListener('cart-updated', (e) => {
      const cartTotalDisplay = this.shadowRoot.getElementById("cart-total-display");
      if (cartTotalDisplay && e.detail && typeof e.detail.subtotal !== 'undefined') {
        cartTotalDisplay.textContent = `₮${e.detail.subtotal}`;
      }
    });
  }
}

customElements.define("filter-list", FilterList);
