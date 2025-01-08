/**
 * String-ийг стандартчилах функц:
 *   - Том үсгийг жижиг болгон хувиргана
 *   - Хоосон зайг "-" болгон солино
 */
function normalizeString(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

/**
 * URL дээрх параметрүүдэд үндэслэн шүүлтүүрийг хэрэгжүүлэх.
 *   1) ?search=... болон checkbox-ууд (price1, rating-5 гэх мэт)-ийг унших
 *   2) Тэдгээр параметрүүдийг ашиглан массивыг шүүх
 *   3) Локал pagination-ийг (window.currentPage болон window.booksPerPage дээр үндэслэн) хийх
 *   4) `renderBooks(...)` функцээр шүүсэн массивыг зурах
 *   5) window.totalPages-г тохируулж, renderPagination() функцийг дуудах
 */
function applyFiltersFromQuery() {
  const params = new URLSearchParams(window.location.search); // URL-ийн query string унших
  const searchInput = params.get("search") || ""; // Хайлтын үг авах

  // "search" болон "page"-ээс бусад бүх query-г сонгосон шүүлтүүрт нэмэх
  const selectedFilters = Array.from(params.keys()).filter(
    (key) => key !== "search" && key !== "page"
  );

  // Page параметрийг унших, эсвэл анхдагч утга 1 болгох
  const page = parseInt(params.get("page"), 10) || 1;
  window.currentPage = page;

  // Номын жагсаалтыг шүүх
  const filteredBooks = (window.books || []).filter((book) => {
    // Хайлт хийх
    const matchesSearch = book.title
      .toLowerCase()
      .includes(searchInput.toLowerCase());

    // Сонгосон шүүлтүүр бүртэй таарч байгаа эсэхийг шалгах
    const matchesFilters = selectedFilters.every((filter) => {
      // Үнэ шүүлтүүр
      if (filter === "price1") return book.price >= 0 && book.price <= 10000;
      if (filter === "price2") return book.price > 10000 && book.price <= 20000;
      if (filter === "price3") return book.price > 20000 && book.price <= 30000;
      if (filter === "price4") return book.price > 30000;

      // Үнэлгээний шүүлтүүр (жишээ нь rating-5 => book.review >= 5)
      if (filter.startsWith("rating-")) {
        const ratingThreshold = parseInt(filter.split("-")[1], 10); // Үнэлгээний босго
        const numericValue = parseFloat(book.review ?? book.rating ?? "0") || 0;
        return numericValue >= ratingThreshold;
      }

      // Ангиллын шүүлтүүр
      const normalizedCategory = normalizeString(book.category || "");
      return normalizedCategory === filter;
    });

    return matchesSearch && matchesFilters;
  });

  // Локал pagination хийх
  const startIndex = (page - 1) * window.booksPerPage;
  const endIndex = startIndex + window.booksPerPage;
  const pageOfBooks = filteredBooks.slice(startIndex, endIndex);

  // Шүүсэн номыг зурах
  if (typeof renderBooks === "function") {
    renderBooks(pageOfBooks);
  }

  // Нийт хуудсын тоог шинэчлэх
  window.totalPages = Math.ceil(filteredBooks.length / window.booksPerPage);

  // Pagination-ийг дахин зурах
  if (typeof renderPagination === "function") {
    renderPagination();
  }
}

/**
 * Бүх шүүлтүүрийг цэвэрлэж, анхны төлөвт оруулах.
 */
function clearFilters() {
  const params = new URLSearchParams(window.location.search);

  // Query string-ээс бүх зүйлийг устгах
  params.delete("search");
  Array.from(params.keys()).forEach((key) => params.delete(key));

  // Checkbox-уудыг анхны төлөвт оруулах
  const filters = document.querySelectorAll("aside input[type='checkbox']");
  filters.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Page параметрийг 1 болгох
  params.set("page", "1");
  window.history.replaceState({}, "", `?${params.toString()}`);

  applyFiltersFromQuery();
}

/**
 * Checkbox болон хайлтын талбарт сонсогч нэмэх.
 * Шүүлтүүр өөрчлөгдөхөд URL-ийг шинэчилж applyFiltersFromQuery() дуудах.
 */
function attachListeners() {
  const filters = document.querySelectorAll("aside input[type='checkbox']"); // Checkbox-ууд
  const searchInput = document.querySelector(".group input"); // Хайлтын талбар

  // Checkbox бүрт сонсогч нэмэх
  filters.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      if (checkbox.checked) {
        params.set(checkbox.id, "true"); // Checkbox идэвхжсэн бол нэмэх
      } else {
        params.delete(checkbox.id); // Checkbox идэвхгүй бол устгах
      }
      params.set("page", "1"); // Page-г 1 болгох
      window.history.replaceState({}, "", `?${params.toString()}`);
      applyFiltersFromQuery();
    });
  });

  // Хайлтын талбарт сонсогч нэмэх
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const params = new URLSearchParams(window.location.search);
      if (searchInput.value) {
        params.set("search", searchInput.value); // Хайлтын утга нэмэх
      } else {
        params.delete("search"); // Хоосон бол устгах
      }
      params.set("page", "1"); // Page-г 1 болгох
      window.history.replaceState({}, "", `?${params.toString()}`);
      applyFiltersFromQuery();
    });
  }
}

// Глобал функц болгон зарлах
window.applyFiltersFromQuery = applyFiltersFromQuery;
window.clearFilters = clearFilters;
window.attachListeners = attachListeners;
window.normalizeString = normalizeString;

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

// Custom element бүртгэх
customElements.define("filter-list", FilterList);