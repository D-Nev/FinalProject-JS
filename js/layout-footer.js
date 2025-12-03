const FOOTER_HTML = `<footer class="ft">
  <div class="wrap">
    <div class="ft-row">
      <div class="ft-col ft-col-cat">
        <h3 class="ft-title">КАТАЛОГ</h3>
        <nav class="ft-nav">
          <a href="#" class="ft-link ft-link--sale">ЗНИЖКИ</a>
          <a href="#" class="ft-link ft-link--new">НОВИНКИ</a>
          <a href="#" class="ft-link">КОЛЕКЦІЇ</a>
          <a href="#" class="ft-link">STAFF BASIC</a>
          <a href="#" class="ft-link">ОДЯГ</a>
          <a href="#" class="ft-link">ВЗУТТЯ</a>
          <a href="#" class="ft-link">РЮКЗАКИ ТА СУМКИ</a>
          <a href="#" class="ft-link">АКСЕСУАРИ</a>
        </nav>
      </div>

      <div class="ft-col ft-col-info">
        <h3 class="ft-title">ІНФОРМАЦІЯ</h3>
        <div class="ft-info-grid">
          <div class="ft-info-col">
            <a href="#" class="ft-link">МАГАЗИНИ</a>
            <a href="#" class="ft-link">ПРО НАС</a>
            <a href="#" class="ft-link">ДОСТАВКА, ОПЛАТА, ПОВЕРНЕННЯ</a>
            <a href="#" class="ft-link">НОВИНИ І ВІДГУКИ</a>
          </div>
          <div class="ft-info-col">
            <a href="#" class="ft-link">СПІВРОБІТНИЦТВО</a>
            <a href="#" class="ft-link">ДОГОВІР ПУБЛІЧНОЇ ОФЕРТИ</a>
            <a href="#" class="ft-link">ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ</a>
          </div>
        </div>
        <div class="ft-pay">
          <img src="../assets/UnBr/mastercard_visa.png" alt="MasterCard / Visa" class="ft-pay-img">
        </div>
      </div>

      <div class="ft-col ft-col-social">
        <h3 class="ft-title">СОЦІАЛЬНІ МЕРЕЖІ</h3>

        <div class="ft-social-row">
          <a href="#" class="ft-social" aria-label="Facebook">
            <svg class="ft-social-icon" width="22" height="22" viewBox="0 0 1024 1024" aria-hidden="true">
              <path stroke="#000" stroke-width="1" d="M152.272 1024h333.136v-363.056h-119.68v-119.696h119.68v-149.616c0-82.48 67.104-149.6 149.6-149.6h149.616v119.696h-119.68c-33.008 0-59.84 26.832-59.84 59.84v119.696h174.128l-19.952 119.696h-154.176v363.040h269.296c82.48 0 149.6-67.12 149.6-149.616v-722.112c0-82.496-67.12-149.6-149.616-149.6h-722.112c-82.496 0-149.616 67.104-149.616 149.6v722.112c0 82.496 67.12 149.616 149.616 149.616v0zM62.512 152.272c0-49.504 40.272-89.776 89.76-89.776h722.112c49.488 0 89.776 40.272 89.776 89.776v722.112c0 49.488-40.272 89.776-89.776 89.776h-209.44v-243.376h145.024l39.888-239.36h-184.912v-59.856h179.536v-239.376h-209.472c-115.504 0-209.456 93.968-209.456 209.456v89.776h-119.68v239.36h119.68v243.376h-273.28c-49.504 0-89.76-40.288-89.76-89.776v-722.112zM62.512 152.272z"></path>
            </svg>
          </a>
          <a href="#" class="ft-social" aria-label="Instagram">
            <svg class="ft-social-icon" width="22" height="22" viewBox="0 0 1024 1024" aria-hidden="true">
              <path stroke="#000" stroke-width="1" d="M150 1024h724.016c82.688 0 149.984-67.296 149.984-150v-724.016c0-82.704-67.296-149.984-150-149.984h-724c-82.72 0-150 67.28-150 149.984v724c0 82.72 67.28 150.016 150 150.016v0zM60 149.984c0-49.632 40.368-90.016 90-90.016h724.016c49.616 0 90 40.384 90 90.016v724c0 49.616-40.384 90.016-90 90.016h-724.016c-49.632 0-90-40.4-90-90.016v-724zM60 149.984z M512 781.984c148.88 0 270-121.104 270-270 0-148.88-121.12-270-270-270s-270 121.12-270 270c0 148.896 121.12 270 270 270v0zM512 302c115.792 0 210 94.208 210 210s-94.208 210.016-210 210.016c-115.808 0-210-94.224-210-210.016s94.192-210 210-210v0zM512 302z M812 302c49.616 0 90-40.368 90-90 0-49.648-40.384-90-90-90-49.632 0-90 40.352-90 90 0 49.632 40.368 90 90 90v0zM812 182c16.528 0 30 13.472 30 30s-13.472 30-30 30c-16.544 0-30-13.472-30-30 0-16.544 13.456-30 30-30v0zM812 182z"></path>
            </svg>
          </a>
          <a href="#" class="ft-social" aria-label="Telegram">
            <svg class="ft-social-icon" width="22" height="22" viewBox="0 0 1024 1024" aria-hidden="true">
              <path stroke="#000" stroke-width="1" d="M242.912 568.8l127.104 317.424 165.504-165.328 283.072 224.752 205.408-881.648-1024 410.512 242.912 94.288zM163.040 473.616l488.096-195.68-388.144 234.496-99.952-38.816zM738.112 295.312l-323.968 296.048-38.96 146.688-72.064-179.968 434.992-262.768zM438.4 733.296l19.632-73.92 30.288 24.048-49.92 49.872zM781.712 839.952l-294.768-234.048 443.808-405.568-149.040 639.616zM781.712 839.952z"></path>
            </svg>
          </a>
          <a href="#" class="ft-social" aria-label="YouTube">
            <svg class="ft-social-icon" width="22" height="22" viewBox="0 0 1024 1024" aria-hidden="true">
              <path stroke="#000" stroke-width="1" d="M150 892.608h724c82.704 0 150-67.248 150-149.856v-479.52c0-82.656-67.296-149.856-150-149.856h-724c-82.72-0.016-150 67.2-150 149.84v479.52c0 82.624 67.28 149.872 150 149.872v0zM60 263.216c0-49.584 40.368-89.92 90-89.92h724c49.616 0 90 40.336 90 89.92v479.52c0 49.568-40.384 89.904-90 89.904h-724c-49.632 0-90-40.336-90-89.904v-479.52zM60 263.216z M362 302.176v407.408l360.992-207.040-360.992-200.368zM422 404.064l178.992 99.344-178.992 102.656v-202zM422 404.064z"></path>
            </svg>
          </a>
        </div>

        <div class="ft-store-row">
          <a href="#" class="ft-store" aria-label="Google Play">
            <img src="../assets/UnBr/google-play-badge.de5fc457.svg" alt="">
          </a>
          <a href="#" class="ft-store" aria-label="App Store">
            <img src="../assets/UnBr/app-store-badge.c7175b49.svg" alt="">
          </a>
        </div>

        <div class="ft-sub-row">
          <span class="ft-sub-ico">
            <svg class="ft-sub-icon" width="26" height="24" viewBox="0 0 1024 1024" aria-hidden="true">
              <path stroke="#000" stroke-width="1" d="M349.090 605.090h-186.18c-13.964 0-23.272 9.31-23.272 23.272s9.31 23.272 23.272 23.272h186.182c13.964 0 23.272-9.31 23.272-23.272s-9.31-23.272-23.274-23.272z M279.272 488.728h-186.182c-13.964 0-23.272 9.31-23.272 23.272s9.31 23.272 23.272 23.272h186.182c13.964 0 23.272-9.31 23.272-23.272s-9.308-23.272-23.272-23.272z M209.454 372.364h-186.182c-13.962 0-23.272 9.308-23.272 23.272s9.31 23.272 23.272 23.272h186.182c13.964 0 23.272-9.31 23.272-23.272s-9.308-23.272-23.272-23.272z M926.254 311.854c-6.982-9.31-23.272-11.636-32.582-4.654l-246.69 188.51c-25.6 18.618-60.51 18.618-86.11 0l-246.69-188.51c-9.31-6.982-25.6-6.982-32.582 4.654-6.982 9.31-6.982 25.6 4.654 32.582l249.018 188.51c20.946 16.29 46.546 23.272 69.818 23.272s51.2-6.982 69.818-23.272l246.692-188.51c9.31-6.982 11.636-23.272 4.654-32.582z M954.182 209.454h-744.728c-13.964 0-23.272 9.31-23.272 23.272s9.308 23.274 23.272 23.274h744.728c13.964 0 23.272 9.31 23.272 23.272v465.454c0 13.964-9.31 23.272-23.272 23.272h-744.728c-13.964 0-23.272 9.31-23.272 23.272 0 13.964 9.31 23.272 23.272 23.272h744.728c39.564 0 69.818-30.254 69.818-69.818v-465.452c0-39.562-30.254-69.818-69.818-69.818z M923.928 681.89l-139.636-139.636c-9.31-9.31-23.272-9.31-32.582 0s-9.31 23.272 0 32.582l139.636 139.636c4.654 4.654 11.636 6.982 16.29 6.982s11.636-2.328 16.292-6.982c9.308-9.308 9.308-23.272 0-32.582z"></path>
            </svg>
          </span>
          <a href="#" class="ft-sub-link">Підписка на розсилку</a>
        </div>
      </div>
    </div>

    <div class="ft-bottom">
      <div class="ft-bottom-line"></div>
      <div class="ft-copy">© 2013 - 2025 Staff</div>
    </div>
  </div>
</footer>

<aside class="to-top" role="button" aria-label="Наверх" tabindex="0">
  <div>
    <svg width="19" height="19" style="display:flex;align-self:center" fill="#fff" viewBox="0 0 1024 1024" aria-hidden="true">
      <path stroke="#fff" stroke-width="1" d="M475.744 266.8l-456.752 436.768c-20 19.168-20 50.208 0 69.44 20 19.168 52.48 19.168 72.464 0l420.496-402.128 420.528 402.08c20 19.168 52.48 19.168 72.528 0 20-19.168 20-50.272 0-69.44l-456.736-436.768c-19.792-18.88-52.784-18.88-72.528.048z"></path>
    </svg>
  </div>
</aside>`;

const FOOTER_CSS = `
.bookmarks{
  padding: 80px 0 140px;
  background: var(--page);
}

.bookmarks-empty{
  max-width: 540px;
  margin: 0 auto;
  text-align: center;
}

.bookmarks-title{
  margin: 40px 0 62px;
  font-size: 32px;
  font-weight: 400;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.bookmarks-icon{
  width: 200px;
  height: 200px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmarks-icon svg{
  display: block;
  width: 100%;
  height: 100%;
}

.bookmarks-desc{
  margin: 0 0 24px;
  font-size: 12px;
  letter-spacing: .16em;
  font-weight: bold;
  text-transform: uppercase;
}

.bookmarks-cta{
  margin-top: 42px;
  padding: 0 14px;
}

.ft .ft-link{
  margin-bottom: 28px;
}

.ft .ft-pay-img{
  max-width: 110px;
}

.ft .ft-store{
  width: 134px;
  height: 40px;
}

.bookmarks-list{
  max-width: var(--sale-max);
  margin: 40px auto 0;
  padding: 0 20px;
}

.bookmarks-list .bookmarks-title{
  margin: 0 0 32px;
  font-size: 32px;
  font-weight: 400;
  text-align: left;
}

.bookmarks-grid{
  --sale-per-view: var(--sale-per-view-desktop);
  display: flex;
  flex-wrap: wrap;
  gap: var(--sale-gap);
}

/* адаптивное количество карточек, как в блоке ЗНИЖКИ */
@media (max-width:1360px){
  .bookmarks-grid{
    --sale-per-view: var(--sale-per-view-laptop);
  }
}

@media (max-width:1100px){
  .bookmarks-grid{
    --sale-per-view: var(--sale-per-view-tablet);
  }
}

@media (max-width:740px){
  .bookmarks-grid{
    --sale-per-view: var(--sale-per-view-mobile);
  }
}
`;

(function initFooter() {
  const container = document.getElementById('layout-footer');
  if (container && !container.dataset.footerInjected) {
    container.innerHTML = FOOTER_HTML;
    container.dataset.footerInjected = 'true';
  }

  if (!document.getElementById('layout-footer-css')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'layout-footer-css';
    styleEl.textContent = FOOTER_CSS;
    document.head.appendChild(styleEl);
  }
})();
