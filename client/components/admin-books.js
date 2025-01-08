/*******************************************************
 * admin-books.js
 * 
 * - 5-books-per-page local pagination
 * - Add/Edit/Delete logic using BookService
 * - Overlay form with max-height, scrollable if needed
 * - No internal “Ном нэмэх” button
 *******************************************************/
import { BookService } from "../js/bookservice.js"; // Adjust the path as needed

class AdminBooks extends HTMLElement {
  constructor() {
    super();
    // We want 5 books per page
    this.localBooksPerPage = 5;

    // Add/Edit form state
    this.showForm = false;
    this.editingBook = null;
    this.errorMessage = null;
  }

  // Called when <admin-books> is placed in the DOM
  connectedCallback() {
    // Use a short delay so we can do async init
    setTimeout(() => this.initializeAdminBooks(), 0);
  }

  /**
   * Initialize data & pagination
   */
  async initializeAdminBooks() {
    // 1) Get page=? from URL or default to 1
    const params = new URLSearchParams(window.location.search);
    window.currentPage = parseInt(params.get("page"), 10) || 1;

    // 2) Let pagination call renderBooks when user clicks
    window.onPaginationChange = () => this.renderBooks();

    // 3) Load books if needed
    await this.fetchBooksIfNeeded();

    // 4) Render the first page
    this.renderBooks();
  }

  /**
   * If window.books is empty, we fetch from server via BookService.
   */
  async fetchBooksIfNeeded() {
    try {
      if (!window.books || !Array.isArray(window.books) || window.books.length === 0) {
        const result = await BookService.getBooks(); 
        // Handle { books: [...] } or direct []
        if (Array.isArray(result)) {
          window.books = result;
        } else if (Array.isArray(result.books)) {
          window.books = result.books;
        } else {
          console.error("BookService.getBooks() returned unexpected data:", result);
          window.books = [];
        }
      }
      this.updateTotalPages();
    } catch (err) {
      console.error("Error fetching books in admin:", err);
      this.errorMessage = err.message || "Failed to load books.";
    }
  }

  /**
   * Calculate window.totalPages for pagination
   */
  updateTotalPages() {
    const total = (window.books || []).length;
    window.totalPages = Math.ceil(total / this.localBooksPerPage);
  }

  /**
   * Render the current page of books + the form overlay (if open)
   */
  renderBooks() {
    if (!window.books || !Array.isArray(window.books)) {
      this.innerHTML = `<p>Loading books or none found...</p>`;
      return;
    }

    // Recalc total pages
    this.updateTotalPages();

    // Slice for current page
    const page = window.currentPage || 1;
    const startIndex = (page - 1) * this.localBooksPerPage;
    const endIndex = startIndex + this.localBooksPerPage;
    const booksOnPage = window.books.slice(startIndex, endIndex);

    // Build book list HTML
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

    // If form is shown, create an overlay
    let formOverlayHTML = "";
    if (this.showForm) {
      formOverlayHTML = `
        <div class="admin-overlay">
          ${this.getFormTemplate(this.editingBook)}
        </div>
      `;
    }

    this.innerHTML = `
      ${this.errorMessage ? `<p class="admin-error">${this.errorMessage}</p>` : ""}
      <section class="admin-book-list">
        ${booksHTML}
      </section>
      ${formOverlayHTML}
    `;

    // Render pagination
    if (typeof window.renderPagination === "function") {
      window.renderPagination();
    }

    // Add the overlay + form styling
    this.injectStyles();
  }

  /**
   * Insert CSS for overlay with max-height 600px, scrollable
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
          width: 100vw; height: 100vh;
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
   * Toggle the form (for adding a book). If already open, close it.
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
   * Start editing a specific book
   */
  async editBook(bookId) {
    try {
      const book = await BookService.getBookById(bookId);
      this.editingBook = book;
      this.showForm = true;
      this.errorMessage = null;
      this.renderBooks();
    } catch (error) {
      this.errorMessage = "Error loading book: " + error.message;
      this.renderBooks();
    }
  }

  /**
   * Delete a book after confirmation
   */
  async handleDeleteBook(bookId) {
    if (!confirm("Та энэ номыг устгах уу?")) return;
    try {
      await BookService.deleteBook(bookId);
      // reload
      await this.fetchBooksIfNeeded();
      this.renderBooks();
    } catch (error) {
      this.errorMessage = error.message;
      this.renderBooks();
    }
  }

  /**
   * Return form overlay HTML (edit or add)
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
   * Handle add/update form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
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
        // Update
        await BookService.updateBook(this.editingBook.id, bookData);
      } else {
        // Add
        await BookService.addBook(bookData);
      }

      this.showForm = false;
      this.editingBook = null;
      this.errorMessage = null;

      // Reload
      await this.fetchBooksIfNeeded();
      this.renderBooks();
    } catch (error) {
      console.error("Form submission error:", error);
      this.errorMessage = error.message || "Failed to submit form.";
      this.renderBooks();
    }
  }
}

customElements.define("admin-books", AdminBooks);
