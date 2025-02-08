/**
 * setPageParamInURL(pageNumber):
 * - URL дээрх "page" параметрийн утгыг солих замаар одоогийн хуудсыг шинэчилнэ
 * - window.history.replaceState() ашиглан URL-г reload хийлгүй өөрчлөх
 */
function setPageParamInURL(pageNumber) {
  const params = new URLSearchParams(window.location.search);
  // -> "page" гэдэг query параметрийг шинэ pageNumber утгаар солих
  params.set("page", pageNumber);
  // -> window.history.replaceState ашиглан refresh хийлгүйгээр URL-г шинэчилж байна
  window.history.replaceState({}, "", `?${params.toString()}`);
}

/**
 * changePage(pageNumber):
 * - Хуудасны дугаарыг change хийхэд дуудагдах функц
 * - window.currentPage-г шинэчлэх,
 * - URL дахь "page" параметрийг setPageParamInURL(...) -ээр шинэчлэх,
 * - onPaginationChange() функцийг дуудах (хэрэв тодорхойлсон бол)
 */
function changePage(pageNumber) {
  // -> Global хувьсагч window.currentPage-д шинэ утга оноож байна
  window.currentPage = pageNumber;
  // -> URL дээрх "page" параметрыг шинэ утгаар солино
  setPageParamInURL(pageNumber);

  // -> Хэрэв window.onPaginationChange тодорхойлогдсон бол дуудна (pagination refresh)
  if (typeof window.onPaginationChange === "function") {
    window.onPaginationChange();
  }
}

/**
 * renderPagination():
 * - <pagination-control> элемент дотроо pagination товчлууруудыг үүсгэх,
 * - Өмнөх/дараагийн хуудас, ... гэх мэтийг HTML болгон харуулна
 */
function renderPagination() {
  // <pagination-control> custom element-ийг хайна
  const paginationControl = document.querySelector("pagination-control");
  if (!paginationControl) {
    console.error("Алдаа: 'pagination-control' элемент олдсонгүй.");
    return;
  }

  // paginationControl-ийн shadowRoot доторх #pagination элементийг олох
  const paginationContainer = paginationControl.shadowRoot.getElementById("pagination");
  if (!paginationContainer) {
    console.error("Алдаа: 'pagination' контейнер олдсонгүй.");
    return;
  }

  // -> Нийт хуудас, одоогийн хуудсыг global хувьсагчаас авна
  const totalPages = window.totalPages || 1;
  const currentPage = window.currentPage || 1;

  let paginationHTML = "";

  // Зүүн (←) сум (өмнөх хуудас) товч
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
    // Хуудас цөөн байвал бүгдийг дараалан гаргана
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
      // Ойролцоо эхэнд байна
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
      // Ойролцоо төгсгөлд байна
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
      // Гол хэсэгт байна
      paginationHTML += `<button class="pagination-ellipsis" disabled>...</button>`;
      paginationHTML += `
        <button class="pagination-number active" onclick="changePage(${currentPage})">
          ${currentPage}
        </button>
      `;
      paginationHTML += `<button class="pagination-ellipsis" disabled>...</button>`;
    }

    // Сүүлийн хуудас
    paginationHTML += `
      <button
        class="pagination-number ${currentPage === totalPages ? "active" : ""}"
        onclick="changePage(${totalPages})"
      >${totalPages}</button>
    `;
  }

  // Баруун (→) сум (дараагийн хуудас) товч
  paginationHTML += `
    <button 
      class="pagination-arrow"
      onclick="${currentPage < totalPages ? `changePage(${currentPage + 1})` : ""}"
      ${currentPage === totalPages ? "disabled" : ""}
    >
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  `;

  // Эцэст нь paginationContainer-ийн HTML-ийг уг бүтээгдсэн HTML-ээр солих
  paginationContainer.innerHTML = paginationHTML;
}

// -> Эдгээр функцуудыг глобал болгоно
window.renderPagination = renderPagination;
window.changePage = changePage;

/**
 * PaginationControl класс нь <pagination-control> custom element
 * Shadow DOM ашиглан дотор нь pagination-container үүсгэж, renderPagination() түүнийг populate хийнэ
 */
class PaginationControl extends HTMLElement {
  constructor() {
    super();
    // -> shadow DOM үүсгэх, ингэснээр доторх style нь глобал CSS-ээс тусгаарлагдана
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // -> connectedCallback үед shadowRoot дотор pagination-container бүхий HTML оруулна
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

// <pagination-control> гэдэг custom element-ийг бүртгэх
customElements.define("pagination-control", PaginationControl);
