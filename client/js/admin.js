// ad.js: For admin.html only!

window.books = []; // We'll store the books here

document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin bootstrap starting...");

  // 1) read page param, default 1
  const params = new URLSearchParams(window.location.search);
  window.currentPage = parseInt(params.get("page"), 10) || 1;

  // 2) fetch from /api/books
  fetch("/api/books")
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Failed to fetch books: ${resp.status}`);
      }
      return resp.json();
    })
    .then((data) => {
      // If array:
      if (Array.isArray(data)) {
        window.books = data;
      } else if (Array.isArray(data.books)) {
        window.books = data.books;
      } else {
        console.error("Unexpected data from server", data);
        window.books = [];
      }

      // Our admin-books.js will do the slicing in connectedCallback or renderBooks
      // so we don't do anything else here, except maybe log:
      console.log("Admin page has loaded books:", window.books.length);
    })
    .catch((err) => {
      console.error("Error in admin fetch:", err);
    });
});
