/**
 * Сагсны үйлчилгээг удирдах объект
 * 
 * Үндсэн үүрэг:
 * - Сагсны өгөгдлийг авах, хадгалах
 * - Сагсны эхлэлийн тохиргоог хийх
 * - Номын тоо хэмжээг нэмэх/хасах/устгах
 */

export const CartService = {
    /**
     * Сагсны хадгалагдсан өгөгдлийг уншина.
     * localStorage дээрээс `cartItems` өгөгдлийг авч массив болгож буцаана.
     */
    getItems() {
        const savedItems = localStorage.getItem('cartItems');
        return savedItems ? JSON.parse(savedItems) : []; // Өгөгдөл байхгүй бол хоосон массив буцаана.
    },

    /**
     * Сагсны өгөгдлийг хадгална.
     * items параметрийг JSON формат руу хөрвүүлээд localStorage дээр хадгална.
     */
    saveItems(items) {
        localStorage.setItem('cartItems', JSON.stringify(items));
    },

    /**
     * Сагсны эхлэлийн тохиргоог хийнэ.
     * Хэрэв `cartItems` localStorage дээр байхгүй бол хоосон массив үүсгэж хадгална.
     */
    initializeCart() {
        if (!localStorage.getItem('cartItems')) {
            localStorage.setItem('cartItems', JSON.stringify([])); // Хоосон сагс үүсгэнэ.
        }
    },

    /**
     * Номын тоо хэмжээг шинэчилнэ.
     * 
     * @param {Array} items - Сагсны одоогийн өгөгдөл
     * @param {number} itemId - Шинэчлэгдэх номын ID
     * @param {number} delta - Нэмэгдэх эсвэл хасагдах тоо хэмжээ
     * 
     * Үйл ажиллагаа:
     * 1. Ном байгаа эсэхийг шалгана.
     *   - Байхгүй бол `delta > 0` үед сагсанд нэмнэ.
     * 2. Хэрэв байгаа бол тоо хэмжээг шинэчилнэ.
     *   - Хэрэв тоо хэмжээ <= 0 бол устгана.
     * 3. Өгөгдлийг localStorage-д хадгална.
     */
    updateQuantity(items, itemId, delta) {
        const index = items.findIndex(item => item.id === itemId); // Ном байгаа эсэхийг шалгана.

        if (index === -1) {
            // Байхгүй бол `delta > 0` үед нэмнэ.
            if (delta > 0) {
                const book = (window.books || []).find(b => b.id === itemId); // Номыг глобал `books`-оос хайна.
                if (book) {
                    items.push({ ...book, quantity: delta }); // Сагсанд шинэ ном нэмнэ.
                }
            }
        } else {
            // Байгаа бол тоо хэмжээг шинэчилнэ.
            const newQuantity = (items[index].quantity || 1) + delta; // Одоогийн тоо хэмжээг `delta`-ээр нэмнэ.
            if (newQuantity <= 0) {
                items.splice(index, 1); // Хэрэв тоо хэмжээ <= 0 бол устгана.
            } else {
                items[index].quantity = newQuantity; // Тоо хэмжээг шинэчилнэ.
            }
        }

        this.saveItems(items); // Сагсны өгөгдлийг хадгална.
        return items; // Шинэчилсэн өгөгдлийг буцаана.
    }
};
