class StoreHeader extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <header>
          <a href="index.html">
            <img alt="Logo" src="client/img/b.png" class="header-logo">
          </a>
          <nav>
            <ul class="nav-menu">
              <li class="nav-item-first">
                <a href="info.html">Нийтийн ном</a>
              </li>
              <li class="nav-item">Бидний тухай</li>
              <li class="nav-item">Холбогдох</li>
            </ul>
          </nav>
          <div class="search-group">
            <div class="relative-group group">
              <input type="text" placeholder="" class="search-input">
              <button class="search-button">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
            <button class="icon-button theme-toggle">
              <i class="fa-solid fa-moon"></i>
            </button>
            <div class="relative">
              <button id="cart-button" aria-label="View Cart" class="icon-button">
                <i class="fa-solid fa-cart-shopping"></i>
              </button>
            </div>
            <a href="admin.html">
              <button class="icon-button">
                <i class="fa-solid fa-user"></i>
              </button>
            </a>
          </div>
        </header>
      `;
    }
  }
  
  customElements.define('store-header', StoreHeader);
  