// client/js/cart-utils.js

// 1) A global function so you can do onclick="addToCart(123)"
window.addToCart = function(bookId) {
    // Increase quantity by 1
    const updated = CartService.updateQuantity(bookId, 1);
  
    // Then update the cart count in UI
    updateCartCount(updated);
  };
  
  // 2) A function to recalc & display how many items are in the cart
  function updateCartCount(cartItems) {
    const total = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
    const cartCountEl = document.querySelector(".cart-count");
    if (cartCountEl) {
      cartCountEl.textContent = total;
    }
  }
  
  // 3) On page load, ensure the .cart-count is correct
  document.addEventListener("DOMContentLoaded", () => {
    const items = CartService.getItems();
    updateCartCount(items);
  });
  