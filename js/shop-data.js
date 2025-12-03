(function () {
  const CATEGORIES_STORAGE_KEY = 'staff_categories';
  const PRODUCTS_STORAGE_KEY = 'staff_products';

  function safeParse(json) {
    try {
      const data = JSON.parse(json);
      return data;
    } catch (e) {
      return null;
    }
  }

  function getCategories() {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeParse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }

  function getProducts() {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeParse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }

  function getCategoryByCode(code) {
    if (!code) return null;
    const slug = String(code).toLowerCase();
    return getCategories().find(c => {
      return String(c.code || '').toLowerCase() === slug;
    }) || null;
  }

  function getProductsByCategoryId(categoryId) {
    if (categoryId == null) return [];
    const idNum = Number(categoryId);
    return getProducts().filter(p => Number(p.categoryId) === idNum);
  }

  function getProductsByCategoryCode(code) {
    const cat = getCategoryByCode(code);
    if (!cat) return [];
    return getProductsByCategoryId(cat.id);
  }

  window.ShopData = {
    getCategories,
    getProducts,
    getCategoryByCode,
    getProductsByCategoryId,
    getProductsByCategoryCode
  };
})();
