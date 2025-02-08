import { BookService } from "../js/bookservice.js"; // 

class AdminBooks extends HTMLElement {
  constructor() {
    super();
    this.localBooksPerPage = 5;
  
    // Add/Edit формын төлөв 
    this.showForm = false; // showForm: Форм харагдах/харагдахгүй эсэхийг илэрхийлэх boolean утга
    this.editingBook = null; // editingBook: Одоогоор засварлаж буй номын объект (null бол засварлах горимд биш)
    this.errorMessage = null; // errorMessage: Алдаа гарсан үед энэ хувьсагчид алдааны мэдээлэл хадгалагдана

  }

  connectedCallback() {
    setTimeout(() => this.initializeAdminBooks(), 0);
  }

  async initializeAdminBooks() {
    // 1) URL-аас page=? параметр унших эсвэл анхдагч утга 1-г тохируулах
    const params = new URLSearchParams(window.location.search);
    window.currentPage = parseInt(params.get("page"), 10) || 1;
    /**
     * window.currentPage:
     * - Глобал хувьсагч, "page" query param-аас авсан утгыг тоон хэлбэрт шилжүүлж оноож байна.
     * - Хэрэв query param байхгүй бол 1-р хуудас гэж үзнэ.
     */

    // 2) Pagination солигдох үед renderBooks-г дуудах
    window.onPaginationChange = () => this.renderBooks();
    /**
     * window.onPaginationChange:
     * - Бусад газар (жишээ нь pagination-control.js) дээрээс хуудас солигдоход энэ функцыг дуудах болно.
     * - Ингэснээр шинэ хуудсанд таарсан номыг дахин зурна.
     */

    // 3) Шаардлагатай бол номын мэдээллийг ачаалах
    await this.fetchBooksIfNeeded();
    /**
     * fetchBooksIfNeeded():
     * - window.books массив хоосон эсэхийг шалгаад,
     *   хоосон байвал BookService ашиглан /api/books-ээс ном татаж авна.
     */

    // 4) Эхний хуудсыг харуулах
    this.renderBooks();
  }


  async fetchBooksIfNeeded() {
    try {
      /**
       * - Хэрэв window.books байхгүй, эсвэл массив биш, эсвэл урт нь 0 бол 
       *   BookService.getBooks() дуудлага хийж, серверээс ном татах.
       */
      if (!window.books || !Array.isArray(window.books) || window.books.length === 0) {
        const result = await BookService.getBooks(); 
        // Шууд массив эсвэл { books: [...] } хэлбэртэй өгөгдөлд хариу өгөх
        if (Array.isArray(result)) {
          window.books = result;
        } else if (Array.isArray(result.books)) {
          window.books = result.books;
        } else {
          console.error("BookService.getBooks() өгөгдөлд алдаа:", result);
          window.books = [];
        }
      }
      this.updateTotalPages(); // Хуудасны тоог шинэчлэх
    } catch (err) {
      console.error("Админы хуудсанд номын мэдээллийг ачаалахад алдаа:", err);
      this.errorMessage = err.message || "Номын мэдээллийг ачаалахад алдаа гарлаа.";
    }
  }


  updateTotalPages() {
    /**
     * - window.books.length = нийт номын тоо
     * - localBooksPerPage = нэг хуудсанд харуулах дундаж тоо
     * - totalPages = нийт хэдэн хуудас болохыг тооцдог.
     */
    const total = (window.books || []).length; // Нийт номын тоог олох
    window.totalPages = Math.ceil(total / this.localBooksPerPage); // Нийт хуудсыг тооцоолох
  }


  renderBooks() {
    /**
     * - Номыг HTML хэлбэрт хөрвүүлэн шууд this.innerHTML-д оноод, дүрсэлнэ.
     */
    if (!window.books || !Array.isArray(window.books)) {
      this.innerHTML = `<p>Номын мэдээлэл ачаалж байна эсвэл хоосон байна...</p>`;
      return;
    }

    // Нийт хуудсыг дахин тооцоолох
    this.updateTotalPages();

    // Одоогийн хуудсанд харуулах номыг сонгох
    const page = window.currentPage || 1;
    const startIndex = (page - 1) * this.localBooksPerPage;
    const endIndex = startIndex + this.localBooksPerPage;
    const booksOnPage = window.books.slice(startIndex, endIndex);

    // Номын жагсаалтыг HTML-д хөрвүүлэх
    const booksHTML = booksOnPage
      .map((book) => `
        <div class="admin-book-item">
          <div class="admin-book-info">
            <p class="admin-book-title">${book.title}</p>
            <p class="admin-book-author">${book.author}</p>
          </div>
          <p class="admin-book-category">${book.category}</p>
          <p class="admin-book-price">₮${book.price}</p>
          <div class="admin-buttons-flex">
            <button class="admin-edit-button"
                    data-id="${book.id}"
                    onclick="document.querySelector('admin-books').editBook('${book.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="admin-delete-button"
                    data-id="${book.id}"
                    onclick="document.querySelector('admin-books').handleDeleteBook('${book.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `)
      .join("");
    /**
     * - Array.map(...) ашиглан booksOnPage дахь ном бүрийг <div>..</div> хэлбэрт оруулж байна.
     * - onclick дотор document.querySelector('admin-books').editBook(...) гэх мэт function call байна.
     *   Энэ нь уг админы компонентоос өөрийнх нь функцийг дуудах хэрэгсэл.
     */

    // Форм нээгдсэн бол overlay үүсгэх
    let formOverlayHTML = "";
    if (this.showForm) {
      formOverlayHTML = `
        <div class="admin-overlay">
          ${this.getFormTemplate(this.editingBook)}
        </div>
      `;
    }

    // HTML-г DOM-д нэмэх
    this.innerHTML = `
      ${this.errorMessage ? `<p class="admin-error">${this.errorMessage}</p>` : ""}
      <section class="admin-book-list">
        ${booksHTML}
      </section>
      ${formOverlayHTML}
    `;

    // Хэрэв renderPagination функц тодорхойлогдсон байвал дуудах
    if (typeof window.renderPagination === "function") {
      window.renderPagination();
    }

    this.injectStyles();
  }


  injectStyles() {
    /**
     * - admin-books-overlay-style гэдэг ID-тэй <style> таг аль хэдийн нэмэгдсэн эсэхийг шалгана.
     * - Хэрэв байхгүй бол шинээр үүсгэж, толгой хэсэг (document.head)-т нэмнэ.
     * - Ингэж байж формын background, overlay, бусад CSS-ийг dynamically оруулдаг.
     */
    const styleId = "admin-books-overlay-style";
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.textContent = `
        .admin-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 125vw; height: 125vh;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .admin-book-form-container {
          background: #fff;
          
          max-height: 700px; /* your requested max height */
          padding: 20px;
          border-radius: 6px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          position: relative;
        }
        .admin-book-row {
            display: flex;
            flex-direction: row;
            column-gap: 35px;
        }
        .admin-book-col {
            display: flex;
            flex-direction: column;
        }
        .admin-book-form h3 {
          margin-top: 0;
        }
        .admin-book-form label {
          display: block;
          margin-top: 10px;
          font-weight: bold;
        }
        .admin-book-form input,
        .admin-book-form select {
          width: 20vw;
          padding-right: 8px;
          padding-left: 8px;
          height: 40px;
          margin-top: 5px;
          box-sizing: border-box;
          font-size: 18px;
        }

        .admin-book-form textarea {
            width: 20vw;
            padding-right: 8px;
            padding-left: 8px;
            height: 114px;
            margin-top: 5px;
            box-sizing: border-box;
            font-size: 18px;
        }

        .admin-form-buttons {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        
        .admin-save-button, .admin-cancel-button {
            display: flex;
            align-items: center;
            justify-items: center;
            height: 40px;
            padding: 0 20px;
            background-color: #3A3A3A;
            color: #ECDFCF;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }


  toggleForm() {
    /**
     * showForm утгыг true/false болгож солих аргаар формыг нээх/хаах үйлдэл
     * Хэрэв showForm = false болж хаагдвал editingBook, errorMessage-ийг null болгож байна.
     * Дараа нь renderBooks()-г дахин дуудаж, дэлгэц дээрх төлөвийг шинэчилнэ.
     */
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingBook = null;
      this.errorMessage = null;
    }
    this.renderBooks();
  }


  async editBook(bookId) {
    /**
     * - editBook(bookId):
     *   Номын ID-гаар BookService.getBookById(...) дуудна.
     *   Амжилттай бол editingBook-д хадгалж, form-оо нээнэ.
     */
    try {
      const book = await BookService.getBookById(bookId);
      this.editingBook = book;
      this.showForm = true;
      this.errorMessage = null;
      this.renderBooks();
    } catch (error) {
      this.errorMessage = "Номын мэдээллийг ачаалахад алдаа: " + error.message;
      this.renderBooks();
    }
  }

  async handleDeleteBook(bookId) {
    /**
     * - Ном устгах товч дарах үед дуудагддаг.
     * - confirm() ашиглан хэрэглэгчээс баталгаажуулалт авна.
     * - OK бол BookService.deleteBook(bookId) гүйцэтгэнэ.
     * - Амжилттай бол номын жагсаалтыг дахин татах, renderBooks() дуудах.
     */
    if (!confirm("Та энэ номыг устгах уу?")) return;
    try {
      await BookService.deleteBook(bookId);
      await this.fetchBooksIfNeeded(); // Номын жагсаалтыг дахин ачаалах
      this.renderBooks();
    } catch (error) {
      this.errorMessage = error.message;
      this.renderBooks();
    }
  }

 
  getFormTemplate(book) {
    /**
     * - Энэ функц нь Add/Edit формын HTML-ийг үүсгэж буцаана.
     * - book байх үед "Ном засах", байхгүй бол "Ном нэмэх" гэж гарчигт бичигдэнэ.
     * - input талбарууд нь book-н утгыг default value болгон авна.
     * - onsubmit-д handleFormSubmit(...) зааж өгчээ.
     */
    const isEditing = !!book;
    return `
      <div class="admin-book-form-container">
        <form class="admin-book-form" onsubmit="document.querySelector('admin-books').handleFormSubmit(event)">
          <h3>${isEditing ? "Ном засах" : "Ном нэмэх"}</h3>

          <div class="admin-book-row">
            <div class="admin-book-col">
            <label>Гарчиг *</label>
            <input type="text" name="title" required value="${book?.title || ""}" />

            <label>Зохиолч *</label>
            <input type="text" name="author" required value="${book?.author || ""}" />

            <label>Үнэ *</label>
            <input type="number" name="price" step="0.01" required value="${book?.price || ""}" />

            <label>Ангилал *</label>
            <input type="text" name="category" required value="${book?.category || ""}" />

            <label>ISBN *</label>
            <input type="text" name="isbn" required value="${book?.isbn || ""}" />

            <label>Хэвлэгдсэн огноо</label>
            <input type="date" name="publish_date" value="${book?.publish_date || ""}" />

            <label>Хэвлэх газар</label>
            <input type="text" name="publisher" value="${book?.publisher || ""}" />

            <label>Хэл</label>
            <input type="text" name="language" value="${book?.language || ""}" />
            </div>

            <div class="admin-book-col"> 
                <label>Хуудас</label>
                <input type="number" name="pages" value="${book?.pages || ""}" />

                <label>Формат</label>
                <input type="text" name="format" value="${book?.format || ""}" />

                <label>Тодорхойлолт</label>
                <textarea name="description">${book?.description || ""}</textarea>

                <label>Зураг (URL буюу текст)</label>
                <input type="text" name="cover_image" value="${book?.cover_image || ""}" />

                <label>Үнэлгээ (0-5)</label>
                <input type="number" name="rating" min="0" max="5" step="0.1" value="${book?.rating || ""}" />

                <label>Нийт үнэлсэн</label>
                <input type="number" name="reviews" min="0" value="${book?.reviews || ""}" />

                <label>Нөөцөд байгаа эсэх</label>
                <select name="in_stock">
                    <option value="true"  ${book?.in_stock === true  ? "selected" : ""}>Yes</option>
                    <option value="false" ${book?.in_stock === false ? "selected" : ""}>No</option>
                </select>
            </div>
          </div>

          <div class="admin-form-buttons">
            <button type="submit" class="admin-save-button">
              ${isEditing ? "Хадгалах" : "Нэмэх"}
            </button>
            <button type="button" class="admin-cancel-button"
              onclick="document.querySelector('admin-books').toggleForm()">
              Болих
            </button>
          </div>
        </form>
      </div>
    `;
  }


  async handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target); // Формын өгөгдлийг авах
    /**
     * - FormData ашиглан бүх input талбараас утгыг цуглуулна.
     * - parseInt, parseFloat хийж төрөл зөв болгоно.
     */
    const bookData = { 
      id: parseInt(formData.get("id")),
      title: formData.get("title"),
      author: formData.get("author"),
      price: parseFloat(formData.get("price")) || 0,
      category: formData.get("category"),
      isbn: formData.get("isbn"),
      publish_date: formData.get("publish_date") || null,
      publisher: formData.get("publisher") || null,
      language: formData.get("language") || null,
      pages: parseInt(formData.get("pages")) || null,
      format: formData.get("format") || null,
      description: formData.get("description") || "",
      cover_image: formData.get("cover_image") || null,
      rating: parseFloat(formData.get("rating")) || 0,
      reviews: parseInt(formData.get("reviews")) || 0,
      in_stock: formData.get("in_stock") === "true",
    };

    try {
      if (this.editingBook) {
        // Ном шинэчлэх
        await BookService.updateBook(this.editingBook.id, bookData);
      } else {
        // Шинэ ном нэмэх
        await BookService.addBook(bookData);
      }

      this.showForm = false;
      this.editingBook = null;
      this.errorMessage = null;

      await this.fetchBooksIfNeeded(); // Номын жагсаалтыг дахин ачаалах
      this.renderBooks();
    } catch (error) {
      console.error("Формыг илгээхэд алдаа:", error);
      this.errorMessage = error.message || "Алдаа гарлаа.";
      this.renderBooks();
    }
  }
}

// Custom element бүртгэх
customElements.define("admin-books", AdminBooks);
/**
 * - Эцэст нь "admin-books" гэдэг нэртэй Custom Element-ийг бүртгэж байна.
 * - Ингэснээр HTML дээр <admin-books></admin-books> гэж бичихэд
 *   энэхүү классын logic ажиллана.
 */
