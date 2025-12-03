const CATEGORIES_STORAGE_KEY = 'staff_categories';
const PRODUCTS_STORAGE_KEY   = 'staff_products';

// Проверка на админа
function getCurrentUserForAdmin() {
  try {
    const raw = localStorage.getItem('staff_current_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : null;
  } catch (e) {
    return null;
  }
}

// helpers
function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Помилка читання категорій', e);
    return [];
  }
}

function saveCategories(list) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Помилка запису категорій', e);
  }
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Помилка читання товарів', e);
    return [];
  }
}

function saveProducts(list) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Помилка запису товарів', e);
  }
}

// slug з назви
function makeSlug(value) {
  const base = (value || '').toString().trim().toLowerCase();
  if (!base) return '';
  return base
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

function findCategoryName(categories, id) {
  const nId = Number(id);
  const cat = categories.find(c => Number(c.id) === nId);
  return cat ? cat.name : 'Без категорії';
}

// Рендер списков

function renderCategories(listEl, emptyEl, categories, products) {
  if (!listEl) return;
  listEl.innerHTML = '';

  if (!categories.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  categories
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .forEach(cat => {
      const count = products.filter(p => p.categoryId === cat.id).length;

      const card = document.createElement('article');
      card.className = 'admin-cat-item';

      card.innerHTML = `
        <div class="admin-cat-main">
          <div class="admin-cat-name">${cat.name || 'Без назви'}</div>
          <div class="admin-cat-code">${cat.code || ''}</div>
        </div>
        <div class="admin-meta-row">
          <span>ID: ${cat.id}</span>
          <span>товарів: ${count}</span>
        </div>
        <div class="admin-item-actions">
          <button
            type="button"
            class="admin-btn-danger"
            data-cat-remove="${cat.id}">
            Видалити
          </button>
        </div>
      `;

      listEl.appendChild(card);
    });
}

function renderProducts(listEl, emptyEl, products, categories) {
  if (!listEl) return;
  listEl.innerHTML = '';

  if (!products.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  products
    .slice()
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .forEach(prod => {
      const catName = prod.categoryId
        ? findCategoryName(categories, prod.categoryId)
        : 'Без категорії';

      const hasSizes  = Array.isArray(prod.sizes)  && prod.sizes.length;
      const hasColors = Array.isArray(prod.colors) && prod.colors.length;

      // OOP
      let typeLabel = 'Товар';
      if (window.ShopModels && ShopModels.Product) {
        try {
          const prodModel = ShopModels.Product.fromPlain({
            ...prod,
            type: prod.type || 'clothes'
          });
          typeLabel = prodModel.getTypeLabel();
        } catch (e) {
          console.warn('Помилка створення Product для адмінки:', e);
        }
      }

      const card = document.createElement('article');
      card.className = 'admin-prod-item';

      card.innerHTML = `
        <div class="admin-prod-main">
          <div class="admin-prod-name">${prod.name || 'Без назви'}</div>
          <div class="admin-prod-price">
            ${prod.price != null ? prod.price + ' грн' : ''}
          </div>
        </div>
        <div class="admin-meta-row">
          <span>Категорія: <span class="admin-prod-cat">${catName}</span></span>
          ${prod.article ? `<span>Артикул: ${prod.article}</span>` : ''}
          <span>ID: ${prod.id}</span>
          <span>Тип: ${typeLabel}</span>
        </div>
        <div class="admin-meta-row">
          ${
        prod.oldPrice != null
          ? `<span>Стара ціна: ${prod.oldPrice} грн</span>`
          : ''
      }
          ${
        hasSizes
          ? `<span>Розміри: ${prod.sizes.join(', ')}</span>`
          : ''
      }
          ${
        hasColors
          ? `<span>Кольори: ${prod.colors.join(', ')}</span>`
          : ''
      }
          ${
        prod.image
          ? `<span>Фото: <code>${prod.image}</code></span>`
          : ''
      }
        </div>
        <div class="admin-item-actions">
          <button
            type="button"
            class="admin-btn-danger"
            data-prod-remove="${prod.id}">
            Видалити
          </button>
        </div>
      `;

      listEl.appendChild(card);
    });
}

// заповненя select з категоріями
function fillCategorySelect(selectEl, categories) {
  if (!selectEl) return;
  const current = selectEl.value;

  selectEl.innerHTML = '';
  const firstOpt = document.createElement('option');
  firstOpt.value = '';
  firstOpt.textContent = '— Без категорії —';
  selectEl.appendChild(firstOpt);

  categories
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .forEach(cat => {
      const opt = document.createElement('option');
      opt.value = String(cat.id);
      opt.textContent = cat.name || '';
      selectEl.appendChild(opt);
    });

  if (current) {
    selectEl.value = current;
  }
}

// ініціалізація сторінки
function initAdminProductsPage() {
  const current = getCurrentUserForAdmin();
  if (!current || current.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const catForm        = document.getElementById('adminCategoryForm');
  const catListEl      = document.getElementById('adminCategoriesList');
  const catEmptyEl     = document.getElementById('adminCategoriesEmpty');
  const catRefreshBtn  = document.getElementById('adminCategoriesRefresh');

  const prodForm       = document.getElementById('adminProductForm');
  const prodListEl     = document.getElementById('adminProductsList');
  const prodEmptyEl    = document.getElementById('adminProductsEmpty');
  const prodRefreshBtn = document.getElementById('adminProductsRefresh');
  const prodCatSelect  = document.getElementById('adminProdCategory');

  if (!catForm || !prodForm) {
    return;
  }

  let categories = loadCategories();
  let products   = loadProducts();

  function rerenderAll() {
    categories = loadCategories();
    products   = loadProducts();
    renderCategories(catListEl, catEmptyEl, categories, products);
    renderProducts(prodListEl, prodEmptyEl, products, categories);
    fillCategorySelect(prodCatSelect, categories);
  }

  rerenderAll();

  // Додавання категорії
  catForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('adminCatName');
    const codeInput = document.getElementById('adminCatCode');

    const name = nameInput ? nameInput.value.trim() : '';
    let code   = codeInput ? codeInput.value.trim() : '';

    if (!name) {
      alert('Введіть назву категорії.');
      return;
    }

    if (!code) {
      code = makeSlug(name);
    }

    categories = loadCategories();

    let base = code || makeSlug(name) || 'cat';
    let finalCode = base;
    let n = 1;
    while (categories.some(c => c.code === finalCode)) {
      n += 1;
      finalCode = `${base}-${n}`;
    }

    let newCat;

    if (window.ShopModels && ShopModels.Category) {
      try {
        const catModel = new ShopModels.Category({
          id: Date.now(),
          name,
          code: finalCode
        });
        newCat = catModel.toPlain();
      } catch (e) {
        console.error('Помилка створення Category (OOP):', e);
        newCat = {
          id: Date.now(),
          name,
          code: finalCode
        };
      }
    } else {
      newCat = {
        id: Date.now(),
        name,
        code: finalCode
      };
    }

    categories.push(newCat);
    saveCategories(categories);

    if (nameInput) nameInput.value = '';
    if (codeInput) codeInput.value = '';

    rerenderAll();
    alert('Категорію додано.');
  });

  // Додавання товару
  prodForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput      = document.getElementById('adminProdName');
    const catSelect      = document.getElementById('adminProdCategory');
    const priceInput     = document.getElementById('adminProdPrice');
    const oldPriceInput  = document.getElementById('adminProdOldPrice');
    const artInput       = document.getElementById('adminProdArticle');
    const sizesInput     = document.getElementById('adminProdSizes');
    const colorsInput    = document.getElementById('adminProdColors');
    const imageInput     = document.getElementById('adminProdImage');

    const name       = nameInput ? nameInput.value.trim() : '';
    const catIdStr   = catSelect ? catSelect.value : '';
    const price      = priceInput ? Number(priceInput.value) : NaN;
    const oldPriceRaw= oldPriceInput ? oldPriceInput.value : '';
    const oldPrice   = oldPriceRaw ? Number(oldPriceRaw) : null;
    const article    = artInput ? artInput.value.trim() : '';
    const sizesStr   = sizesInput ? sizesInput.value.trim() : '';
    const colorsStr  = colorsInput ? colorsInput.value.trim() : '';
    const image      = imageInput ? imageInput.value.trim() : '';

    if (!name) {
      alert('Введіть назву товару.');
      return;
    }

    if (!priceInput || !priceInput.value || Number.isNaN(price)) {
      alert('Введіть коректну ціну.');
      return;
    }

    let categoryId = null;
    if (catIdStr) {
      categoryId = Number(catIdStr);
    }

    const sizes = sizesStr
      ? sizesStr.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const colors = colorsStr
      ? colorsStr.split(',')
        .map(c => c.trim().toLowerCase())
        .filter(Boolean)
      : [];

    products = loadProducts();
    let newProd;

    if (window.ShopModels && ShopModels.Product) {
      try {
        const prodModel = ShopModels.Product.fromPlain({
          id: Date.now(),
          name,
          price,
          oldPrice,
          article,
          sizes,
          images: image ? [image] : [],
          type: 'clothes'
        });

        newProd = prodModel.toPlain();

        newProd.categoryId = categoryId;  // привязка к категории
        newProd.colors     = colors;      // цвета для фильтра
        newProd.image      = image;       // поле для карточек
      } catch (e) {
        console.error('Помилка створення Product (OOP):', e);
        newProd = {
          id: Date.now(),
          name,
          categoryId,
          price,
          oldPrice,
          article,
          sizes,
          colors,
          image
        };
      }
    } else {
      newProd = {
        id: Date.now(),
        name,
        categoryId,
        price,
        oldPrice,
        article,
        sizes,
        colors,
        image
      };
    }

    products.push(newProd);
    saveProducts(products);

    prodForm.reset();
    rerenderAll();

    alert('Товар додано.');
  });

  // Обнова списков
  if (catRefreshBtn) {
    catRefreshBtn.addEventListener('click', () => {
      rerenderAll();
    });
  }
  if (prodRefreshBtn) {
    prodRefreshBtn.addEventListener('click', () => {
      rerenderAll();
    });
  }

  // Видалення категорий
  if (catListEl) {
    catListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat-remove]');
      if (!btn) return;
      const idStr = btn.getAttribute('data-cat-remove');
      if (!idStr) return;

      if (!confirm('Видалити цю категорію? Товари залишаться без категорії.')) {
        return;
      }

      const idNum = Number(idStr);
      categories = loadCategories().filter(c => c.id !== idNum);
      saveCategories(categories);

      products = loadProducts().map(p => {
        if (p.categoryId === idNum) {
          return { ...p, categoryId: null };
        }
        return p;
      });
      saveProducts(products);

      rerenderAll();
    });
  }

  // Видалення товарів
  if (prodListEl) {
    prodListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-prod-remove]');
      if (!btn) return;
      const idStr = btn.getAttribute('data-prod-remove');
      if (!idStr) return;

      if (!confirm('Видалити цей товар?')) {
        return;
      }

      const idNum = Number(idStr);
      products = loadProducts().filter(p => p.id !== idNum);
      saveProducts(products);

      rerenderAll();
    });
  }
}

document.addEventListener('DOMContentLoaded', initAdminProductsPage);
