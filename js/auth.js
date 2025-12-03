document.addEventListener('DOMContentLoaded', () => {
  const authOverlay = document.querySelector('.auth-overlay');
  const accountIcon = document.querySelector('.ico[aria-label="Кабінет"]');

  if (!authOverlay || !accountIcon) return;

  const loginPanel    = authOverlay.querySelector('[data-auth-panel="login"]');
  const registerPanel = authOverlay.querySelector('[data-auth-panel="register"]');
  const loginForm     = authOverlay.querySelector('#auth-login-form');
  const registerForm  = authOverlay.querySelector('#auth-register-form');
  const googleBtn     = authOverlay.querySelector('.auth-social-circle');
  const phoneCircle   = authOverlay.querySelector('.auth-google-phone-circle');
  const closeBtns     = authOverlay.querySelectorAll('[data-auth-close]');
  const hdrRow        = document.querySelector('.hdr-row');

  // helper for cookie
  function setCookie(name, value, days) {
    let expires = '';
    if (typeof days === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
  }

  function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
  }

  function clearCookie(name) {
    setCookie(name, '', -1);
  }

  // Для пользывателей юзер, для админа админка
  function saveCurrentUserSession(user) {
    if (!user) return;
    const data = JSON.stringify({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role || 'user'
    });
    try {
      localStorage.setItem('staff_current_user', data);
    } catch (e) {
      console.error('Не вдалося зберегти поточного користувача в localStorage', e);
    }
    // В cookie
    setCookie('staff_current_user', data, 7);
  }

  function getCurrentUser() {
    let raw = null;
    try {
      raw = localStorage.getItem('staff_current_user');
    } catch (e) {
      raw = null;
    }

    if (!raw) {
      raw = getCookie('staff_current_user');
    }
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function clearCurrentUserSession() {
    try {
      localStorage.removeItem('staff_current_user');
    } catch (e) {}
    clearCookie('staff_current_user');
  }

  // авторизації (оверлей)

  function isOverlayOpen() {
    return authOverlay.classList.contains('auth-overlay--visible');
  }

  function openOverlay() {
    authOverlay.classList.add('auth-overlay--visible');
    authOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('auth-open');
  }

  function closeOverlay() {
    authOverlay.classList.remove('auth-overlay--visible');
    authOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('auth-open');
    setGoogleMode(false);
  }

  function setGoogleMode(on) {
    if (!loginPanel) return;
    if (on) {
      loginPanel.classList.add('auth-login--google');
    } else {
      loginPanel.classList.remove('auth-login--google');
    }
  }

  function showPanel(name) {
    if (!loginPanel || !registerPanel) return;

    if (name === 'register') {
      loginPanel.classList.remove('auth-panel--active');
      registerPanel.classList.add('auth-panel--active');
    } else {
      registerPanel.classList.remove('auth-panel--active');
      loginPanel.classList.add('auth-panel--active');
      setGoogleMode(false);
    }
  }

  // Меню аккаунта (выпадающее)

  let accountMenu = null;
  let accountMenuVisible = false;
  // Меню для админа
  function buildAccountMenuHtml(isAdmin) {
    if (isAdmin) {
      return `
      <div class="account-dropdown__panel">
        <div class="account-dropdown__header">
          <span class="account-dropdown__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="#000" stroke-width="2"></circle>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#000" stroke-width="2" fill="none"></path>
            </svg>
          </span>
          <span class="account-dropdown__name"></span>
        </div>

        <button type="button"
                class="account-dropdown__item"
                data-account-link="admin-orders.html">
          МОДЕРАЦІЯ ТОВАРІВ
        </button>

        <button type="button"
                class="account-dropdown__item"
                data-account-link="admin-users.html">
          РЕЄСТРАЦІЯ КОРИСТУВАЧІВ
        </button>

        <button type="button"
                class="account-dropdown__item"
                data-account-link="admin-products.html">
          КАТЕГОРІЇ І ТОВАРИ
        </button>

        <button type="button"
                class="account-dropdown__item account-dropdown__item--exit"
                data-account-logout>
          ВИЙТИ
        </button>
      </div>
    `;
    }

    // Меню для юзера
    return `
    <div class="account-dropdown__panel">
      <div class="account-dropdown__header">
        <span class="account-dropdown__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke="#000" stroke-width="2"></circle>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#000" stroke-width="2" fill="none"></path>
          </svg>
        </span>
        <span class="account-dropdown__name"></span>
      </div>

      <button type="button"
              class="account-dropdown__item"
              data-account-link="cabinet.html">
        МІЙ ПРОФІЛЬ
      </button>

      <button type="button"
              class="account-dropdown__item"
              data-account-link="cabinet-orders.html">
        МОЇ ЗАМОВЛЕННЯ
      </button>

      <button type="button"
              class="account-dropdown__item"
              data-account-link="cabinet-bonuses.html">
        БОНУСИ
      </button>

      <button type="button"
              class="account-dropdown__item"
              data-account-link="cabinet-promos.html">
        ПРОМОКОДИ
      </button>

      <button type="button"
              class="account-dropdown__item account-dropdown__item--exit"
              data-account-logout>
        ВИЙТИ
      </button>
    </div>
  `;
  }

  function ensureAccountMenu(user) {
    if (!hdrRow || !user) return;

    const isAdmin = user.role === 'admin' || user.phone === 'admin';

    if (!accountMenu) {
      accountMenu = document.createElement('div');
      accountMenu.className = 'account-dropdown';
      accountMenu.innerHTML = buildAccountMenuHtml(isAdmin);
      hdrRow.appendChild(accountMenu);
      accountMenu.addEventListener('click', (e) => {
        const linkBtn = e.target.closest('[data-account-link]');
        if (linkBtn) {
          const href = linkBtn.getAttribute('data-account-link');
          if (href) {
            window.location.href = href;
          }
          return;
        }

        const logoutBtn = e.target.closest('[data-account-logout]');
        if (logoutBtn) {
          clearCurrentUserSession();
          closeAccountMenu();
          window.location.href = 'index.html';
        }
      });
    } else {
      accountMenu.innerHTML = buildAccountMenuHtml(isAdmin);
    }

    const nameEl = accountMenu.querySelector('.account-dropdown__name');
    if (nameEl) {
      if (isAdmin) {
        nameEl.textContent = 'Адміністратор';
      } else {
        nameEl.textContent = user.name || user.phone || 'Мій профіль';
      }
    }
  }

  function openAccountMenu() {
    if (!accountMenu) return;
    accountMenuVisible = true;
    accountMenu.classList.add('account-dropdown--visible');
  }

  function closeAccountMenu() {
    if (!accountMenu) return;
    accountMenuVisible = false;
    accountMenu.classList.remove('account-dropdown--visible');
  }

  function toggleAccountMenu() {
    if (!accountMenu) return;
    if (accountMenuVisible) {
      closeAccountMenu();
    } else {
      openAccountMenu();
    }
  }

  // Кабинет (иконка)

  // Если уже залогинен предоставляется меню
  const initialUser = getCurrentUser();
  if (initialUser) {
    ensureAccountMenu(initialUser);
  }

  accountIcon.addEventListener('click', (e) => {
    e.preventDefault();
    const user = getCurrentUser();

    if (user) {
      // уже залогінений – показуємо/ховаємо меню
      ensureAccountMenu(user);
      toggleAccountMenu();
    } else {
      // не залогінений – відкриваємо форму входу
      closeAccountMenu();
      if (!isOverlayOpen()) {
        showPanel('login');
        openOverlay();
      }
    }
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeOverlay();
    });
  });

  // переключ ВХІД / РЕЄСТРАЦІЯ
  authOverlay.addEventListener('click', (e) => {
    if (e.target === authOverlay) {
      closeOverlay();
      return;
    }
    const switchBtn = e.target.closest('[data-auth-go]');
    if (!switchBtn) return;
    const target = switchBtn.getAttribute('data-auth-go');
    showPanel(target);
  });

  // закриття по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isOverlayOpen()) closeOverlay();
      closeAccountMenu();
    }
  });

  // закриття меню по кліку
  document.addEventListener('click', (e) => {
    if (!accountMenuVisible || !accountMenu) return;
    const target = e.target;
    if (accountMenu.contains(target)) return;
    if (accountIcon.contains(target)) return;
    closeAccountMenu();
  });

  // Google / phone
  if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setGoogleMode(true);
    });
  }

  if (phoneCircle) {
    phoneCircle.addEventListener('click', (e) => {
      e.preventDefault();
      setGoogleMode(false);
    });
  }

  // Сховища користувачів

  class UserStore {
    static _load() {
      try {
        const raw = localStorage.getItem(UserStore.STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Помилка читання користувачів', e);
        return [];
      }
    }

    static _save(users) {
      try {
        localStorage.setItem(UserStore.STORAGE_KEY, JSON.stringify(users));
      } catch (e) {
        console.error('Помилка збереження користувачів', e);
      }
    }

    static findByPhone(phone) {
      const users = UserStore._load();
      return users.find(u => u.phone === phone) || null;
    }

    static register({ phone, name, password }) {
      const users = UserStore._load();
      if (users.some(u => u.phone === phone)) {
        throw new Error('Користувач з таким телефоном вже існує.');
      }
      const user = {
        id: Date.now(),
        phone,
        name,
        password
      };
      users.push(user);
      UserStore._save(users);
      saveCurrentUserSession(user);
      return user;
    }

    static login({ phone, password }) {
      const user = UserStore.findByPhone(phone);
      if (!user || user.password !== password) {
        throw new Error('Невірний телефон або пароль.');
      }
      saveCurrentUserSession(user);
      return user;
    }
  }

  UserStore.STORAGE_KEY = 'staff_users';

  function cleanPhone(value) {
    return value.replace(/\s+/g, '');
  }

  // ВХІД (обробка)

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneInput = loginForm.querySelector('input[name="phone"]');
      const passInput  = loginForm.querySelector('input[name="password"]');

      const phoneRaw = phoneInput ? phoneInput.value.trim() : '';
      const password = passInput ? passInput.value : '';
      const phone    = cleanPhone(phoneRaw);

      if (!phone || !password) {
        alert('Заповніть телефон і пароль.');
        return;
      }

      // Вхід для адміністратора
      // В полі "Номер телефону"
      // Телефон: admin
      // Пароль: admin1231
      if (phone === 'admin' && password === 'admin1231') {
        const adminUser = {
          id: 'admin',
          phone: 'admin',
          name: 'Адміністратор',
          role: 'admin'
        };
        saveCurrentUserSession(adminUser);
        ensureAccountMenu(adminUser);
        closeOverlay();
        window.location.href = 'admin-orders.html';
        return;
      }

      // звичайний користувач через локал БД

      if (phone === 'admin') {
        alert('Логін "admin" зарезервований для адміністратора.');
        return;
      }

      try {
        const user = UserStore.login({ phone, password });
        alert('Вітаємо, ' + (user.name || user.phone) + '!');
        ensureAccountMenu(user);
        closeOverlay();
        window.location.href = 'cabinet.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Реєстрація

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneInput = registerForm.querySelector('input[name="phone"]');
      const nameInput  = registerForm.querySelector('input[name="name"]');
      const passInput  = registerForm.querySelector('input[name="password"]');
      const pass2Input = registerForm.querySelector('input[name="password2"]');

      const phone     = phoneInput ? cleanPhone(phoneInput.value) : '';
      const name      = nameInput ? nameInput.value.trim() : '';
      const password  = passInput ? passInput.value : '';
      const password2 = pass2Input ? pass2Input.value : '';

      if (!phone || !name || !password || !password2) {
        alert('Заповніть усі поля.');
        return;
      }

      if (password !== password2) {
        alert('Паролі не співпадають.');
        return;
      }

      try {
        const user = UserStore.register({ phone, name, password });
        alert('Реєстрація успішна!');
        ensureAccountMenu(user);
        closeOverlay();
        window.location.href = 'cabinet.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // вихід з кабінету з бокового меню
  function bindSidebarLogoutLinks() {
    const links = document.querySelectorAll('.account-menu-item--exit, .account-logout');
    links.forEach(link => {
      link.addEventListener('click', () => {
        clearCurrentUserSession();
      });
    });
  }

  bindSidebarLogoutLinks();
});
