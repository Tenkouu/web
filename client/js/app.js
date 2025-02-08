import { CartService } from './cart-service.js'; 


// Номыг хуудаслахад ашиглах глобал хувьсагч
let currentPage = 1; 
const booksPerPage = 8; // Нэг хуудсанд харуулах номын тоо

// Эдгээрийг глобал болгох
window.currentPage = currentPage;
window.booksPerPage = booksPerPage;
window.books = []; // Номын өгөгдлийг хадгалах массив

/**
 * Филтер байхгүй үед хуудаслалтын логикийг зохицуулна.
 */
function defaultPaginationHandler() {
    // `renderBooks` функц байгаа эсэхийг шалгах.
    if (typeof renderBooks !== 'function') return;

    const page = window.currentPage || 1;
    const startIndex = (page - 1) * window.booksPerPage;
    const endIndex = startIndex + window.booksPerPage;

    // Номын хуудаслах хэсгийг тасдаж харуулах.
    const pageOfBooks = window.books.slice(startIndex, endIndex);
    renderBooks(pageOfBooks);
}

/**
 * DOM-ыг ачаалсны дараа эхний тохиргоо хийх.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Картын өгөгдлийг хадгалагдсан сангаас унших.
    CartService.initializeCart();

    /*
    API-аас номын өгөгдөл татах.
     */
    fetch('/api/books')
        .then(response => {
            // Хариу OK биш бол алдаа шидэх.
            if (!response.ok) {
                throw new Error(`Серверийн алдаа: ${response.status}`);
            }
            return response.json(); // JSON формат руу хөрвүүлэх.
        })
        .then(data => {
            // Номын өгөгдлийг глобал хувьсагчид хадгалах.
            window.books = data.books || [];

            /**
             * Филтер байгаа эсэхийг шалгаж тохирох функц дуудах.
             * - Хэрэв филтер байвал `applyFiltersFromQuery` ашиглах.
             * - Үгүй бол `defaultPaginationHandler` ашиглах.
             */
            if (typeof applyFiltersFromQuery === 'function') {
                window.onPaginationChange = applyFiltersFromQuery;
                if (typeof attachListeners === 'function') {
                    attachListeners(); // Хэрэглэгчийн үйлдлийг сонсох сонсогч суулгах.
                }
                applyFiltersFromQuery(); // Филтерээр номын өгөгдөл шүүх.
            } else {
                window.onPaginationChange = defaultPaginationHandler;
                defaultPaginationHandler(); // Хуудаслалтыг шууд хийх.
            }
        })
        .catch(err => {
            // API-тай холбоотой алдааг харуулах.
            console.error('Ном татахад алдаа гарлаа:', err);
        });
});
