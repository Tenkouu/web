

// Номын өгөгдлийг хадгалах глобал хувьсагч
window.books = []; 

document.addEventListener("DOMContentLoaded", () => {

    /**
     * 1. URL параметрээс хуудасны дугаарыг унших.
     * Хэрэв дугаар байхгүй бол 1-ийг ашиглана.
     */
    const params = new URLSearchParams(window.location.search);
    window.currentPage = parseInt(params.get("page"), 10) || 1;

    /**
     * 2. API-аас номын өгөгдөл татах.
     */
    fetch("/api/books")
        .then((resp) => {
            // Хариу OK биш бол алдаа шидэх.
            if (!resp.ok) {
                throw new Error(`Номын өгөгдлийг татаж чадсангүй: ${resp.status}`);
            }
            return resp.json(); // JSON формат руу хөрвүүлэх.
        })
        .then((data) => {
            /**
             * Серверээс ирсэн өгөгдлийг шалгах:
             * - Хэрэв массив бол шууд ашиглах.
             * - Хэрэв `books` талбарт массив байгаа бол түүнийг ашиглах.
             * - Аль нь ч байхгүй бол хоосон массивыг хадгалах.
             */
            if (Array.isArray(data)) {
                window.books = data;
            } else if (Array.isArray(data.books)) {
                window.books = data.books;
            } else {
                console.error("Серверээс ирсэн өгөгдөл танигдахгүй байна", data);
                window.books = [];
            }

            // Хадгалсан номын тоог консолд бичих.
            console.log("Админы хуудас ном ачааллаа:", window.books.length);
        })
        .catch((err) => {
            // Хэрэв fetch амжилтгүй бол алдааг харуулах.
            console.error("API-тай холбоотой алдаа:", err);
        });
});
