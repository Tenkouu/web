import { BookService } from "../js/bookservice.js"; // 

class AdminBooks extends HTMLElement {
  constructor() {
    super();
    // Нэг хуудсанд харуулах номын тоо
    this.localBooksPerPage = 5;

    // Add/Edit формын төлөв
    this.showForm = false; // Форм харагдаж байгаа эсэх
    this.editingBook = null; // Засах номын мэдээлэл
    this.errorMessage = null; // Алдааны мэдэгдэл
  }

  // <admin-books> DOM-д нэмэгдэхэд автоматаар дуудагдах
  connectedCallback() {
    // Асинхрон эхлүүлэхэд бага хугацаа авахын тулд
    setTimeout(() => this.initializeAdminBooks(), 0);
  }

  /**
   * Админы хуудсыг анхдагч байдлаар тохируулах
   */
  async initializeAdminBooks() {
    // 1) URL-аас page=? параметр унших эсвэл анхдагч утга 1-г тохируулах
    const params = new URLSearchParams(window.location.search);
    window.currentPage = parseInt(params.get("page"), 10) || 1;

    // 2) Pagination солигдох үед renderBooks-г дуудах
    window.onPaginationChange = () => this.renderBooks();

    // 3) Шаардлагатай бол номын мэдээллийг ачаалах
    await this.fetchBooksIfNeeded();

    // 4) Эхний хуудсыг харуулах
    this.renderBooks();
  }

  /**
   * window.books хоосон байвал серверээс номын мэдээллийг авах
   */
  async fetchBooksIfNeeded() {
    try {
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

  /**
   * window.totalPages-г дахин тооцоолох
   */
  updateTotalPages() {
    const total = (window.books || []).length; // Нийт номын тоог олох
    window.totalPages = Math.ceil(total / this.localBooksPerPage); // Нийт хуудсыг тооцоолох
  }

  /**
   * Одоогийн хуудсыг номын жагсаалт болон формын хамт зурах
   */
  renderBooks() {
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

    // Pagination-г дахин зурах
    if (typeof window.renderPagination === "function") {
      window.renderPagination();
    }

    // Overlay-д зориулсан CSS оруулах
    this.injectStyles();
  }

  /**
   * Overlay-д зориулсан CSS оруулах
   */
  injectStyles() {
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

  /**
   * Формыг харуулах/хаах
   */
  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingBook = null;
      this.errorMessage = null;
    }
    this.renderBooks();
  }

  /**
   * Тодорхой номыг засах
   */
  async editBook(bookId) {
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

  /**
   * Номыг устгах
   */
  async handleDeleteBook(bookId) {
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

  /**
   * Формын HTML буцаах (шинэ ном нэмэх/засах)
   */
  getFormTemplate(book) {
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

  /**
   * Формыг илгээхэд хариу өгөх (шинэчлэх/нэмэх)
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target); // Формын өгөгдлийг авах
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
        await BookService.updateBook(this.editingBook.id, bookData); // Ном шинэчлэх
      } else {
        await BookService.addBook(bookData); // Шинэ ном нэмэх
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
