// filter-list.js

/**
 * Normalizes a string by:
 *   - making it lowercase
 *   - replacing whitespace with "-"
 */
function normalizeString(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Applies local filters to window.books:
 *   1) Reads URL params: ?search=... & checkboxes (price1, rating-5, etc.)
 *   2) Filters the array based on those params
 *   3) Performs local pagination (based on window.currentPage and window.booksPerPage)
 *   4) Renders that sub-array with `renderBooks(...)`
 *   5) Sets window.totalPages, calls renderPagination()
 */
function applyFiltersFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const searchInput = params.get("search") || "";

  // Collect everything except "search" and "page" as a "selectedFilters" array
  const selectedFilters = Array.from(params.keys()).filter(
    (key) => key !== "search" && key !== "page"
  );

  // Read page from URL or default to 1
  const page = parseInt(params.get("page"), 10) || 1;
  window.currentPage = page;

  // Filter window.books
  const filteredBooks = (window.books || []).filter((book) => {
    // Title search
    const matchesSearch = book.title
      .toLowerCase()
      .includes(searchInput.toLowerCase());

    // Check if all selected filters match
    const matchesFilters = selectedFilters.every((filter) => {
      // Price filter
      if (filter === "price1") return book.price >= 0 && book.price <= 10000;
      if (filter === "price2") return book.price > 10000 && book.price <= 20000;
      if (filter === "price3") return book.price > 20000 && book.price <= 30000;
      if (filter === "price4") return book.price > 30000;

      // Rating filter (e.g. rating-5 => book.review >= 5)
      if (filter.startsWith("rating-")) {
        const ratingThreshold = parseInt(filter.split("-")[1], 10);
        const numericValue = parseFloat(book.review ?? book.rating ?? "0") || 0;
        return numericValue >= ratingThreshold;
      }

      // Category filter: compare normalized category with filter
      const normalizedCategory = normalizeString(book.category || "");
      return normalizedCategory === filter;
    });

    return matchesSearch && matchesFilters;
  });

  // Now we do local pagination
  const startIndex = (page - 1) * window.booksPerPage;
  const endIndex = startIndex + window.booksPerPage;
  const pageOfBooks = filteredBooks.slice(startIndex, endIndex);

  // Render this "page" of filtered books
  if (typeof renderBooks === "function") {
    renderBooks(pageOfBooks);
  }

  // Update total pages for pagination
  window.totalPages = Math.ceil(filteredBooks.length / window.booksPerPage);

  // Re-draw pagination if available
  if (typeof renderPagination === "function") {
    renderPagination();
  }
}

/**
 * Clear all filters from the URL, reset checkboxes in the UI,
 * reset page to 1, then re-run applyFiltersFromQuery().
 */
function clearFilters() {
  const params = new URLSearchParams(window.location.search);

  // Remove everything from the query
  params.delete("search");
  Array.from(params.keys()).forEach((key) => params.delete(key));

  // Reset all checkboxes
  const filters = document.querySelectorAll("aside input[type='checkbox']");
  filters.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Reset page to 1
  params.set("page", "1");
  window.history.replaceState({}, "", `?${params.toString()}`);

  applyFiltersFromQuery();
}

/**
 * Attaches event listeners to checkboxes and search input,
 * so that changing them updates the URL and calls applyFiltersFromQuery().
 */
function attachListeners() {
  const filters = document.querySelectorAll("aside input[type='checkbox']");
  const searchInput = document.querySelector(".group input");

  // For each checkbox
  filters.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      if (checkbox.checked) {
        params.set(checkbox.id, "true");
      } else {
        params.delete(checkbox.id);
      }
      // Reset page to 1
      params.set("page", "1");
      window.history.replaceState({}, "", `?${params.toString()}`);
      applyFiltersFromQuery();
    });
  });

  // For the search input (if it exists)
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

// Expose to global (so they can be called elsewhere)
window.applyFiltersFromQuery = applyFiltersFromQuery;
window.clearFilters = clearFilters;
window.attachListeners = attachListeners;
window.normalizeString = normalizeString;

/**
 * The custom element <filter-list> that provides the checkboxes, etc.
 */
class FilterList extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button id="clear-filters" class="clear-filters" onclick="clearFilters()">
        Remove Filters
      </button>

      <details class="filter-group" open>
        <summary class="filter-summary">
          Ангилал
          <span class="summary-icon"><i class="fa-solid fa-chevron-down"></i></span>
        </summary>
        <ul class="filter-list">
          <li class="filter-item">
            <input type="checkbox" id="fiction" class="filter-checkbox">
            <label for="fiction" class="filter-label">Fiction</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="non-fiction" class="filter-checkbox">
            <label for="non-fiction" class="filter-label">Non-Fiction</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="romance" class="filter-checkbox">
            <label for="romance" class="filter-label">Romance</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="mystery" class="filter-checkbox">
            <label for="mystery" class="filter-label">Mystery</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="historical" class="filter-checkbox">
            <label for="historical" class="filter-label">Historical</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="classic" class="filter-checkbox">
            <label for="classic" class="filter-label">Classic</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="biography" class="filter-checkbox">
            <label for="biography" class="filter-label">Biography</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="language" class="filter-checkbox">
            <label for="language" class="filter-label">Language</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="fantasy" class="filter-checkbox">
            <label for="fantasy" class="filter-label">Fantasy</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="horror" class="filter-checkbox">
            <label for="horror" class="filter-label">Horror</label>
          </li>
          <li class="filter-item">
            <input type="checkbox" id="anthology" class="filter-checkbox">
            <label for="anthology" class="filter-label">Anthology</label>
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
    `;
  }
}

customElements.define("filter-list", FilterList);
