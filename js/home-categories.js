(function () {
  const CAT_KEY = 'staff_categories';

  function loadCategories() {
    try {
      const raw = localStorage.getItem(CAT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function splitToColumns(items, colCount) {
    const cols = Array.from({ length: colCount }, () => []);
    items.forEach((cat, idx) => {
      cols[idx % colCount].push(cat);
    });
    return cols;
  }

  function renderMenu(menuEl, categories) {
    if (!categories.length) {
      menuEl.innerHTML = '<div class="header-categories-col">Немає категорій</div>';
      return;
    }

    const cols = splitToColumns(categories, 3);

    const html = cols.map((col, colIndex) => {
      const title = colIndex === 0 ? 'ШАПКИ'
        : colIndex === 1 ? 'РУКАВИЧКИ'
          : 'ІНШЕ';

      const links = col.map(cat => `
        <a
          href="category.html?code=${encodeURIComponent(cat.code)}"
          class="header-categories-link"
        >
          ${cat.name}
        </a>
      `).join('');

      return `
        <div class="header-categories-col">
          <div class="header-categories-col-title">${title}</div>
          ${links}
        </div>
      `;
    }).join('');

    menuEl.innerHTML = html;
  }

  function initHeaderCategories() {
    const toggle = document.querySelector('.js-categories-toggle');
    const menu   = document.querySelector('.js-categories-menu');
    if (!toggle || !menu) return;

    const categories = loadCategories();
    renderMenu(menu, categories);

    let open = false;

    function openMenu() {
      menu.classList.add('header-categories-menu--open');
      open = true;
    }
    function closeMenu() {
      menu.classList.remove('header-categories-menu--open');
      open = false;
    }

    // Открытие по наведению
    const parentItem = toggle.closest('.header-bottom__item--categories') || toggle;

    parentItem.addEventListener('mouseenter', openMenu);
    parentItem.addEventListener('mouseleave', (e) => {
      // маленькая задержка
      setTimeout(() => {
        if (!parentItem.matches(':hover') && !menu.matches(':hover')) {
          closeMenu();
        }
      }, 100);
    });

    // На всякий случай закрытие по клику вне
    document.addEventListener('click', (e) => {
      if (open && !menu.contains(e.target) && !parentItem.contains(e.target)) {
        closeMenu();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initHeaderCategories);
})();
