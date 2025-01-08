// client/js/cart-service.js
export const CartService = {
    getItems() {
        const savedItems = localStorage.getItem('cartItems');
        return savedItems ? JSON.parse(savedItems) : [];
    },

    saveItems(items) {
        localStorage.setItem('cartItems', JSON.stringify(items));
    },

    initializeCart() {
        if (!localStorage.getItem('cartItems')) {
            localStorage.setItem('cartItems', JSON.stringify([]));
        }
    },

    /**
     * updateQuantity: modifies quantity by `delta`.
     * - If item doesn't exist, add it if delta>0
     * - If after updating quantity <= 0, remove it
     */
    updateQuantity(items, itemId, delta) {
        const index = items.findIndex(item => item.id === itemId);

        if (index === -1) {
            // Not found => add a new item if delta > 0
            if (delta > 0) {
                const book = (window.books || []).find(b => b.id === itemId);
                if (book) {
                    items.push({ ...book, quantity: delta });
                }
            }
        } else {
            // Found => update quantity
            const newQuantity = (items[index].quantity || 1) + delta;
            if (newQuantity <= 0) {
                items.splice(index, 1);
            } else {
                items[index].quantity = newQuantity;
            }
        }

        this.saveItems(items);
        return items;
    }
};
