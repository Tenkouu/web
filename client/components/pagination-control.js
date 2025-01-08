/****
 * pagination-control.js
 *
 * - Pagination UI-ийг харуулна
 * - Нийт хуудсын тоо болон одоогийн хуудасны мэдээлэлд тулгуурлана
 * - Хуудасны өөрчлөлт хийхэд URL болон дэлгэц шинэчлэгдэнэ
 ****/

/**
 * Pagination UI-г #pagination контейнерт оруулна.
 * Хүлээж авах параметрүүд:
 *   - window.currentPage  (тоон утга: одоогийн хуудас)
 *   - window.totalPages   (тоон утга: нийт хуудсууд)
 */
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) {
    console.error("Алдаа: 'pagination' контейнер олдсонгүй.");
    return;
  }

  const totalPages = window.totalPages || 1; // Нийт хуудсууд, анхдагч 1
  const currentPage = window.currentPage || 1; // Одоогийн хуудас, анхдагч 1

  let paginationHTML = "";

  // Зүүн сум
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
    // Хэрэв нийт хуудас бага байвал бүгдийг харуулах
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
        <button
          class="pagination-number ${currentPage === i ? "active" : ""}"
          onclick="changePage(${i})"
        >${i}</button>
      `;
    }
  } else {
    // Эхний хуудас
    paginationHTML += `
      <button
        class="pagination-number ${currentPage === 1 ? "active" : ""}"
        onclick="changePage(1)"
      >1</button>
    `;

    if (currentPage <= 3) {
      // Ойролцоох хуудаснуудыг харуулах
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
      // Төгсгөлд ойрхон бол
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
      // Дунд хэсэгт байгаа тохиолдолд
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

    // Сүүлийн хуудас
    paginationHTML += `
      <button
        class="pagination-number ${currentPage === totalPages ? "active" : ""}"
        onclick="changePage(${totalPages})"
      >${totalPages}</button>
    `;
  }

  // Баруун сум
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

  paginationContainer.innerHTML = paginationHTML; // HTML-ийг контейнерт оруулах
}

/**
 * URL дэх page параметрийг шинэчлэх
 * @param {number} pageNumber Хуудасны дугаар
 */
function setPageParamInURL(pageNumber) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", pageNumber); // Page параметрийг тохируулах
  window.history.replaceState({}, "", `?${params.toString()}`); // URL-г шинэчлэх
}

/**
 * Pagination товчлуур дээр дарагдсан үед дуудагдана.
 * - window.currentPage-г шинэчлэх
 * - URL-г шинэчлэх
 * - window.onPaginationChange() функцыг дуудах
 * @param {number} pageNumber Хуудасны дугаар
 */
function changePage(pageNumber) {
  window.currentPage = pageNumber;
  setPageParamInURL(pageNumber);

  if (typeof window.onPaginationChange === "function") {
    window.onPaginationChange(); // Хуудасны өөрчлөлтөд тохирох функц
  }
}

// Глобал функц болгон бүртгэх
window.renderPagination = renderPagination;
window.changePage = changePage;

/**
 * <pagination-control> custom элемент
 * Pagination-г харуулах <div> үүсгэнэ.
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

// <pagination-control> элементийг бүртгэх
customElements.define("pagination-control", PaginationControl);
