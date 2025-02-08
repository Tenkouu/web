class StoreHeader extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM үүсгэж, style болон HTML-ээ тусгаарлаж байна
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // connectedCallback(): элемент DOM-д орж ирмэгц автоматаар дуудагдана
    this.render();      // render() - оор HTML-ээ оруулж зурна
    this.setupTheme();  // dark/light mode-г эхлээд тааруулна
  }

  setupTheme() {
    // localStorage-оос theme авна, байхгүй бол системийн сонголтоор сонгоно
    const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    // HTML үндсэн элементэд data-theme аттрибут тавьж байна
    document.documentElement.setAttribute('data-theme', savedTheme);

    // shadowRoot дотроос themeIcon (moon/sun icon) олж, одоогийн theme-д тохируулна
    const themeIcon = this.shadowRoot.querySelector('.theme-toggle i');
    if (savedTheme === 'light') {
      themeIcon.className = 'fa-solid fa-moon';
    } else {
      themeIcon.className = 'fa-solid fa-sun';
    }
  }

  toggleTheme() {
    // Одоогийн theme-г light/dark гэж уншиж, сэлгэнэ
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    // documentElement дээр data-theme аттрибутыг шинэчилж, localStorage-д хадгална
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // icon-г мөн moon/sun гэж тааруулна
    const themeIcon = this.shadowRoot.querySelector('.theme-toggle i');
    themeIcon.className = newTheme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }

  // toggle-cart эвент dispatch: сагсны UI-г нээж/хаахад ашиглах
  dispatchToggleCartEvent() {
    const event = new CustomEvent('toggle-cart', {
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(event);
  }

  render() {
    // shadowRoot.innerHTML-д Header-ийн HTML + style оруулна
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
        header {
          padding: 0 52px;
          height: 100px;
          display: flex;
          flex-direction: row;
          border-bottom: 3px solid var(--text-color);
          align-items: center;
        }
        a {
          text-decoration: none;
          color: inherit; 
        }
        a:visited {
          color: inherit; 
          text-decoration: none; 
        }
        .header-logo {
          height: 55px;
        }
        .nav-menu {
          display: flex;
          flex-direction: row;
          font-weight: 600;
          font-size: 24px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-item-first {
          cursor: pointer;
          text-decoration: none;
          margin-left: 82px;
        }
        .nav-item {
          cursor: pointer;
          text-decoration: none;
          margin-left: 60px;
        }
        .search-group {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          margin-left: auto;
          column-gap: 10px;
          position: relative;
        }
        .relative-group {
          position: relative;
        }
        .search-input {
          position: absolute;
          right: 0;
          width: 55px;
          height: 55px;
          border-radius: 10px;
          background-color: var(--text-color);
          color: transparent;
          transition: all 0.3s ease-in-out;
          border: none;
          outline: none;
          padding: 0;
          font-size: 20px;
        }
        .search-group:hover .search-input {
          width: 860px;
          color: var(--bg-color);
          padding-left: 20px;
        }
        .search-button {
          background-color: transparent;
          height: 55px;
          width: 55px;
          border-radius: 10px;
          position: absolute;
          z-index: 10;
          right: 0;
          border: none;
          cursor: pointer;
          color: var(--bg-color);
        }
        i {
          font-size: 24px;
        }
        .icon-button {
          background-color: var(--text-color);
          color: var(--bg-color);
          height: 55px;
          width: 55px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
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
          <button class="icon-button theme-toggle" id="themeToggle" onclick="this.getRootNode().host.toggleTheme()">
            <i class="fa-solid fa-moon"></i>
          </button>
          <div class="relative">
            <button class="icon-button" id="cart-button" onclick="this.getRootNode().host.dispatchToggleCartEvent()">
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
