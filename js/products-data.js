(function () {
  var LS_KEY_CATEGORIES = 'shopCategories';
  var LS_KEY_PRODUCTS = 'shopProducts';

  function read(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      console.warn('read localStorage error', e);
      return [];
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('write localStorage error', e);
    }
  }

  // Категории

  function getCategories() {
    return read(LS_KEY_CATEGORIES);
  }

  function saveCategories(categories) {
    write(LS_KEY_CATEGORIES, categories);
  }

  function addCategory(category) {
    var categories = getCategories();
    var now = Date.now();
    var newCat = {
      id: category.id || ('cat_' + now),
      name: category.name || '',
      slug: category.slug || '',
      gender: category.gender || '',
      createdAt: now
    };
    categories.push(newCat);
    saveCategories(categories);
    return newCat;
  }

  function getCategoryBySlug(slug) {
    return getCategories().find(function (c) {
      return c.slug === slug;
    }) || null;
  }

  // Товары

  function getProducts() {
    return read(LS_KEY_PRODUCTS);
  }

  function saveProducts(products) {
    write(LS_KEY_PRODUCTS, products);
  }

  function addProduct(product) {
    var products = getProducts();
    var now = Date.now();
    var newProd = {
      id: product.id || ('prod_' + now),
      categorySlug: product.categorySlug || '',
      name: product.name || '',
      slug: product.slug || '',
      price: Number(product.price) || 0,
      oldPrice: Number(product.oldPrice) || 0,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      availableInShops: !!product.availableInShops,
      imageUrl: product.imageUrl || '',
      createdAt: product.createdAt || now
    };
    products.push(newProd);
    saveProducts(products);
    return newProd;
  }

  function getProductsByCategorySlug(slug) {
    return getProducts().filter(function (p) {
      return p.categorySlug === slug;
    });
  }

  window.ShopData = {
    getCategories: getCategories,
    saveCategories: saveCategories,
    addCategory: addCategory,
    getCategoryBySlug: getCategoryBySlug,
    getProducts: getProducts,
    saveProducts: saveProducts,
    addProduct: addProduct,
    getProductsByCategorySlug: getProductsByCategorySlug
  };
})();
