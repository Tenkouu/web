import { CartService } from './cart-service.js'; // Ensure this path matches your folder structure

let currentPage = 1;
const booksPerPage = 8;

// Make them global so other scripts can use them:
window.currentPage = currentPage;
window.booksPerPage = booksPerPage;
window.books = [];

// Function to handle pagination when no filters are applied
function defaultPaginationHandler() {
    // Ensure `renderBooks` is defined
    if (typeof renderBooks !== 'function') return;

    const page = window.currentPage || 1;
    const startIndex = (page - 1) * window.booksPerPage;
    const endIndex = startIndex + window.booksPerPage;

    const pageOfBooks = window.books.slice(startIndex, endIndex);
    renderBooks(pageOfBooks);
}

// Initialize the cart at startup
document.addEventListener('DOMContentLoaded', () => {
    // Load cart items from storage
    CartService.initializeCart();

    // Fetch books from the API
    fetch('/api/books')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.books = data.books || [];

            // Use pagination or render all books
            if (typeof applyFiltersFromQuery === 'function') {
                window.onPaginationChange = applyFiltersFromQuery;
                if (typeof attachListeners === 'function') {
                    attachListeners();
                }
                applyFiltersFromQuery();
            } else {
                window.onPaginationChange = defaultPaginationHandler;
                defaultPaginationHandler();
            }
        })
        .catch(err => {
            console.error('Error fetching books:', err);
        });
});
