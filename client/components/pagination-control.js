/**
 * Updates the URL’s “page” parameter.
 * @param {number} pageNumber - The new page number.
 */
function setPageParamInURL(pageNumber) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", pageNumber);
  window.history.replaceState({}, "", `?${params.toString()}`);
}

/**
 * Called when a pagination button is clicked.
 * - Updates window.currentPage.
 * - Updates the URL.
 * - Calls the onPaginationChange handler.
 * @param {number} pageNumber - The new page number.
 */
function changePage(pageNumber) {
  window.currentPage = pageNumber;
  setPageParamInURL(pageNumber);
  if (typeof window.onPaginationChange === "function") {
    window.onPaginationChange();
  }
}

/**
 * Renders the pagination controls inside the <pagination-control> custom element.
 */
function renderPagination() {
  // Get the custom element
  const paginationControl = document.querySelector("pagination-control");
  if (!paginationControl) {
    console.error("Алдаа: 'pagination-control' элемент олдсонгүй.");
    return;
  }
  // Query the shadow root for the container with id "pagination"
  const paginationContainer = paginationControl.shadowRoot.getElementById("pagination");
  if (!paginationContainer) {
    console.error("Алдаа: 'pagination' контейнер олдсонгүй.");
    return;
  }

  const totalPages = window.totalPages || 1;
  const currentPage = window.currentPage || 1;
  let paginationHTML = "";

  // Left arrow button
  paginationHTML += `
    <button 
      class="pagination-arrow"
      onclick="${currentPage > 1 ? `changePage(${currentPage - 1})` : ""}"
      ${currentPage === 1 ? "disabled" : ""}
    >
      <i class="fa-solid fa-arrow-left"></i>
    </button>
  `;

  if (totalPages <= 3) {
    // If there are few pages, display them all.
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
        <button
          class="pagination-number ${currentPage === i ? "active" : ""}"
          onclick="changePage(${i})"
        >${i}</button>
      `;
    }
  } else {
    // First page
    paginationHTML += `
      <button
        class="pagination-number ${currentPage === 1 ? "active" : ""}"
        onclick="changePage(1)"
      >1</button>
    `;

    if (currentPage <= 3) {
      // Near the beginning
      for (let i = 2; i <= Math.min(3, totalPages - 1); i++) {
        paginationHTML += `
          <button
            class="pagination-number ${currentPage === i ? "active" : ""}"
            onclick="changePage(${i})"
          >${i}</button>
        `;
      }
      if (totalPages > 4) {
        paginationHTML += `<button class="pagination-ellipsis" disabled>...</button>`;
      }
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      paginationHTML += `<button class="pagination-ellipsis" disabled>...</button>`;
      for (let i = totalPages - 2; i < totalPages; i++) {
        paginationHTML += `
          <button
            class="pagination-number ${currentPage === i ? "active" : ""}"
            onclick="changePage(${i})"
          >${i}</button>
        `;
      }
    } else {
      // In the middle
      paginationHTML += `<button class="pagination-ellipsis" disabled>...</button>`;
      paginationHTML += `
        <button class="pagination-number active" onclick="changePage(${currentPage})">
          ${currentPage}
        </button>
      `;
      paginationHTML += `<button class="pagination-ellipsis" disabled>...</button>`;
    }

    // Last page
    paginationHTML += `
      <button
        class="pagination-number ${currentPage === totalPages ? "active" : ""}"
        onclick="changePage(${totalPages})"
      >${totalPages}</button>
    `;
  }

  // Right arrow button
  paginationHTML += `
    <button 
      class="pagination-arrow"
      onclick="${currentPage < totalPages ? `changePage(${currentPage + 1})` : ""}"
      ${currentPage === totalPages ? "disabled" : ""}
    >
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  `;

  // Set the container's innerHTML
  paginationContainer.innerHTML = paginationHTML;
}

// Expose the functions globally.
window.renderPagination = renderPagination;
window.changePage = changePage;

/**
 * <pagination-control> custom element using Shadow DOM.
 * It renders a container for the pagination controls.
 */
class PaginationControl extends HTMLElement {
  constructor() {
    super();
    // Attach shadow DOM immediately
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
        
        * {
          font-family: "Finlandica", system-ui, sans-serif;
        }
        .pagination-aligner {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }
        .pagination-container {
          display: flex;
          column-gap: 10px;
        }
        .pagination-arrow {
          background-color: var(--text-color);
          color: var(--bg-color);
          width: 55px;
          height: 55px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          font-size: 30px;
        }
        .pagination-arrow:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .pagination-number {
          background-color: var(--text-color);
          color: var(--bg-color);
          width: 55px;
          height: 55px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          font-size: 24px;
        }
        .pagination-number.active {
          font-weight: bold;
        }
        .pagination-ellipsis {
          background-color: var(--text-color);
          color: var(--bg-color);
          width: 55px;
          height: 55px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: default;
        }
      </style>
      <div class="pagination-aligner">
        <div class="pagination-container" id="pagination"></div>
      </div>
    `;
  }
}

customElements.define("pagination-control", PaginationControl);
