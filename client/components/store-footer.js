// Example: <store-footer></store-footer>
class StoreFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer>
          <div class="footer-grid">
            <div class="footer-logo-section">
              <a href="index.html">
                <img alt="Logo" src="client/img/E.png" class="footer-logo">
              </a>
              <p class="footer-text">Copyright © 2024</p>
              <p class="footer-text">Зохиогчийн эрх хуулиар хамгаалагдсан.</p>
            </div>
            <div>
              <h3 class="footer-heading">Мэдээлэл</h3>
              <ul class="footer-list">
                <li>Танилцуулга</li>
                <li>Мэдээ мэдээлэл</li>
                <li>Салбарууд</li>
                <li>Зохиолчид</li>
              </ul>
            </div>
            <div>
              <h3 class="footer-heading">Төлбөр</h3>
              <ul class="footer-list">
                <li>Үйлчилгээний нөхцөл</li>
                <li>Төлбөр төлөлт</li>
                <li>Буцаалт</li>
                <li>Хүргэлт</li>
              </ul>
            </div>
            <div>
              <h3 class="footer-heading">Холбогдох</h3>
              <ul class="footer-list">
                <li>Их сургуулийн гудамж – 1, Бага тойруу, Сүхбаатар дүүрэг, Улаанбаатар хот</li>
                <li>+976 75754400, 77307730 (1617)</li>
              </ul>
            </div>
          </div>
        </footer>
      `;
    }
  }
  
  customElements.define('store-footer', StoreFooter);
  