// pagination-control.js

/**
 * Renders the pagination UI into the #pagination container.
 * Expects:
 *   window.currentPage  (number)
 *   window.totalPages   (number)
 */
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) {
    console.error("Error: 'pagination' container not found.");
    return;
  }

  const totalPages = window.totalPages || 1;
  const currentPage = window.currentPage || 1;

  let paginationHTML = "";

  // Left Arrow
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
    // Render all pages if the total is small
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

    // If current page is near the start
    if (currentPage <= 3) {
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
    }
    // If current page is near the end
    else if (currentPage >= totalPages - 2) {
      paginationHTML += `<button class="pagination-ellipsis" disabled>...</button>`;
      for (let i = totalPages - 2; i < totalPages; i++) {
        paginationHTML += `
          <button
            class="pagination-number ${currentPage === i ? "active" : ""}"
            onclick="changePage(${i})"
          >${i}</button>
        `;
      }
    }
    // Middle
    else {
      paginationHTML += `
        <button class="pagination-ellipsis" disabled>...</button>
        <button
          class="pagination-number active"
          onclick="changePage(${currentPage})"
        >
          ${currentPage}
        </button>
        <button class="pagination-ellipsis" disabled>...</button>
      `;
    }

    // Last page
    paginationHTML += `
      <button
        class="pagination-number ${currentPage === totalPages ? "active" : ""}"
        onclick="changePage(${totalPages})"
      >${totalPages}</button>
    `;
  }

  // Right Arrow
  paginationHTML += `
    <button 
      class="pagination-arrow"
      onclick="${
        currentPage < totalPages ? `changePage(${currentPage + 1})` : ""
      }"
      ${currentPage === totalPages ? "disabled" : ""}
    >
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  `;

  paginationContainer.innerHTML = paginationHTML;
}

/**
 * Utility: sets `?page=...` in URL.
 */
function setPageParamInURL(pageNumber) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", pageNumber);
  window.history.replaceState({}, "", `?${params.toString()}`);
}

/**
 * Called by the pagination buttons.  
 * - Updates global window.currentPage
 * - Updates URL
 * - Calls the global callback `window.onPaginationChange()`
 */
function changePage(pageNumber) {
  window.currentPage = pageNumber;
  setPageParamInURL(pageNumber);

  if (typeof window.onPaginationChange === "function") {
    window.onPaginationChange();
  }
}

// Expose to global
window.renderPagination = renderPagination;
window.changePage = changePage;

/**
 * <pagination-control> custom element
 * Renders a <div> with id="pagination" (where we insert our pagination HTML).
 */
class PaginationControl extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="pagination-aligner">
        <div class="pagination-container" id="pagination"></div>
      </div>
    `;
  }
}

customElements.define("pagination-control", PaginationControl);
