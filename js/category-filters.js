(function () {
  var categoryPage = document.querySelector('.category-page');
  if (!categoryPage || !window.ShopData) return;

  var categorySlug = categoryPage.getAttribute('data-category-slug') || '';
  if (!categorySlug) return;

  var productsGrid = document.getElementById('categoryProductsGrid');
  if (!productsGrid) return;

  var allProducts = ShopData.getProductsByCategorySlug(categorySlug) || [];

  // Utils

  function getPriceRange() {
    var minInput = document.getElementById('priceMinInput');
    var maxInput = document.getElementById('priceMaxInput');

    var min = minInput ? parseInt(minInput.value, 10) : 0;
    var max = maxInput ? parseInt(maxInput.value, 10) : Infinity;

    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = Infinity;
    return { min: min, max: max };
  }

  function getSelectedSizes() {
    var active = document.querySelectorAll('.size-option--active');
    var sizes = [];
    active.forEach(function (btn) {
      sizes.push(btn.textContent.trim().toUpperCase());
    });
    return sizes;
  }

  function getSelectedColors() {
    var active = document.querySelectorAll('.color-option--active');
    var colors = [];
    active.forEach(function (opt) {
      var c = (opt.getAttribute('data-color') || '').toLowerCase().trim();
      if (c) colors.push(c);
    });
    return colors;
  }

  function getSortMode() {
    var active = document.querySelector('.sort-option--active');
    if (!active) return 'new';
    return active.getAttribute('data-sort') || 'new';
  }

  function filterProducts() {
    var range = getPriceRange();
    var sizes = getSelectedSizes();
    var colors = getSelectedColors();
    var mode = getSortMode();

    var filtered = allProducts.filter(function (p) {
      // цена
      if (p.price < range.min || p.price > range.max) return false;

      // розміри
      if (sizes.length > 0) {
        if (!Array.isArray(p.sizes) || p.sizes.length === 0) return false;
        var hasSize = p.sizes.some(function (s) {
          return sizes.indexOf(String(s).toUpperCase()) !== -1;
        });
        if (!hasSize) return false;
      }

      // колір
      if (colors.length > 0) {
        if (!Array.isArray(p.colors) || p.colors.length === 0) return false;
        var hasColor = p.colors.some(function (c) {
          return colors.indexOf(String(c).toLowerCase().trim()) !== -1;
        });
        if (!hasColor) return false;
      }

      return true;
    });

    // сортировка
    filtered.sort(function (a, b) {
      var ap = a.price || 0;
      var bp = b.price || 0;
      var ad = a.oldPrice || 0;
      var bd = b.oldPrice || 0;
      var ac = a.createdAt || 0;
      var bc = b.createdAt || 0;

      switch (mode) {
        case 'old':
          return ac - bc;
        case 'cheap':
          return ap - bp;
        case 'expensive':
          return bp - ap;
        case 'discount':
          var adisc = (ad > ap) ? (ad - ap) : 0;
          var bdisc = (bd > bp) ? (bd - bp) : 0;
          if (adisc === bdisc) return bc - ac;
          return bdisc - adisc;
        case 'new':
        default:
          return bc - ac;
      }
    });

    return filtered;
  }

  function renderProducts(list) {
    if (!list || list.length === 0) {
      productsGrid.innerHTML = '<p>Поки що немає товарів у цій категорії.</p>';
      return;
    }

    var html = list.map(function (p) {
      var price = p.price ? p.price + ' грн' : '';
      var old = p.oldPrice && p.oldPrice > p.price
        ? '<span class="category-product-card__old-price">' + p.oldPrice + ' грн</span>'
        : '';

      var img = p.imageUrl
        ? '<img src="' + p.imageUrl + '" alt="' + (p.name || '') + '">'
        : '';

      return (
        '<article class="category-product-card">' +
        '<div class="category-product-card__image-wrapper">' +
        img +
        '</div>' +
        '<div class="category-product-card__info">' +
        '<div class="category-product-card__name">' + (p.name || '') + '</div>' +
        '<div class="category-product-card__prices">' +
        '<span class="category-product-card__price">' + price + '</span>' +
        old +
        '</div>' +
        '</div>' +
        '</article>'
      );
    }).join('');

    productsGrid.innerHTML = html;
  }

  function applyFilters() {
    var filtered = filterProducts();
    renderProducts(filtered);
  }

  // Ціна: слайдер + інпути

  (function () {
    var minRange = document.getElementById('priceMinRange');
    var maxRange = document.getElementById('priceMaxRange');
    var minInput = document.getElementById('priceMinInput');
    var maxInput = document.getElementById('priceMaxInput');

    if (!minRange || !maxRange || !minInput || !maxInput) return;

    var MIN = parseInt(minRange.min, 10);
    var MAX = parseInt(minRange.max, 10);
    var GAP = 10;

    function clamp(value, min, max) {
      value = parseInt(value, 10);
      if (isNaN(value)) value = min;
      if (value < min) value = min;
      if (value > max) value = max;
      return value;
    }

    function syncFromRange(changed) {
      var minVal = parseInt(minRange.value, 10);
      var maxVal = parseInt(maxRange.value, 10);

      if (maxVal - minVal < GAP) {
        if (changed === 'min') {
          minVal = maxVal - GAP;
          minRange.value = minVal;
        } else {
          maxVal = minVal + GAP;
          maxRange.value = maxVal;
        }
      }

      minInput.value = minVal;
      maxInput.value = maxVal;
      applyFilters();
    }

    function syncFromInputs() {
      var minVal = clamp(minInput.value, MIN, MAX);
      var maxVal = clamp(maxInput.value, MIN, MAX);

      if (maxVal - minVal < GAP) {
        if (minVal + GAP <= MAX) {
          maxVal = minVal + GAP;
        } else {
          minVal = maxVal - GAP;
        }
      }

      minInput.value = minVal;
      maxInput.value = maxVal;

      minRange.value = minVal;
      maxRange.value = maxVal;
      applyFilters();
    }

    minRange.addEventListener('input', function () {
      syncFromRange('min');
    });

    maxRange.addEventListener('input', function () {
      syncFromRange('max');
    });

    minInput.addEventListener('change', syncFromInputs);
    maxInput.addEventListener('change', syncFromInputs);
  })();

  // Розмір
  (function () {
    var toggleTargets = document.querySelectorAll('.js-size-filter-toggle');
    var popup = document.getElementById('sizePopup');
    var block = document.querySelector('.filter-block--size');
    if (!popup || !block) return;

    var closeBtn = popup.querySelector('.size-popup__close');
    var sizeButtons = popup.querySelectorAll('.size-option');
    var applyBtn = popup.querySelector('.size-popup__apply');
    var label = document.querySelector('.js-size-filter-label');

    function openPopup() {
      popup.classList.add('size-popup--open');
    }

    function closePopup() {
      popup.classList.remove('size-popup--open');
    }

    function updateLabel() {
      if (!label) return;
      var selected = [];
      sizeButtons.forEach(function (btn) {
        if (btn.classList.contains('size-option--active')) {
          selected.push(btn.textContent.trim());
        }
      });
      label.textContent = selected.join(', ');
    }

    toggleTargets.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popup.classList.contains('size-popup--open')) {
          closePopup();
        } else {
          openPopup();
        }
      });
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });

    sizeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.classList.toggle('size-option--active');
      });
    });

    applyBtn.addEventListener('click', function () {
      updateLabel();
      closePopup();
      applyFilters();
    });

    document.addEventListener('click', function (e) {
      if (!popup.contains(e.target) && !block.contains(e.target)) {
        closePopup();
      }
    });
  })();

  // Колір

  (function () {
    var toggleTargets = document.querySelectorAll('.js-color-filter-toggle');
    var popup = document.getElementById('colorPopup');
    var block = document.querySelector('.filter-block--color');
    if (!popup || !block) return;

    var closeBtn = popup.querySelector('.color-popup__close');
    var colorOptions = popup.querySelectorAll('.color-option');
    var applyBtn = popup.querySelector('.color-popup__apply');
    var label = document.querySelector('.js-color-filter-label');

    function openPopup() {
      popup.classList.add('color-popup--open');
    }

    function closePopup() {
      popup.classList.remove('color-popup--open');
    }

    function updateLabel() {
      if (!label) return;
      var selected = [];
      colorOptions.forEach(function (opt) {
        if (opt.classList.contains('color-option--active')) {
          var text = opt.querySelector('.color-option__label');
          if (text) selected.push(text.textContent.trim());
        }
      });
      label.textContent = selected.join(', ');
    }

    toggleTargets.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popup.classList.contains('color-popup--open')) {
          closePopup();
        } else {
          openPopup();
        }
      });
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });

    colorOptions.forEach(function (opt) {
      opt.addEventListener('click', function () {
        opt.classList.toggle('color-option--active');
      });
    });

    applyBtn.addEventListener('click', function () {
      updateLabel();
      closePopup();
      applyFilters();
    });

    document.addEventListener('click', function (e) {
      if (!popup.contains(e.target) && !block.contains(e.target)) {
        closePopup();
      }
    });
  })();

  // Наявність в магазині

  (function () {
    var block = document.querySelector('.filter-block--availability');
    var popup = document.getElementById('availabilityPopup');
    if (!block || !popup) return;

    var toggleTargets = block.querySelectorAll('.js-availability-filter-toggle');
    var closeBtn = popup.querySelector('.availability-popup__close');
    var applyBtn = popup.querySelector('.availability-popup__apply');
    var resetBtn = block.querySelector('.filter-reset');
    var storeOptions = popup.querySelectorAll('.store-option');
    var selectedStore = null;

    function openPopup() {
      popup.classList.add('availability-popup--open');
    }

    function closePopup() {
      popup.classList.remove('availability-popup--open');
    }

    toggleTargets.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popup.classList.contains('availability-popup--open')) {
          closePopup();
        } else {
          openPopup();
        }
      });
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });

    applyBtn.addEventListener('click', function () {
      closePopup();
    });

    document.addEventListener('click', function (e) {
      if (!popup.contains(e.target) && !block.contains(e.target)) {
        closePopup();
      }
    });

    storeOptions.forEach(function (opt) {
      opt.addEventListener('click', function () {
        storeOptions.forEach(function (o) {
          o.classList.remove('store-option--active');
        });
        opt.classList.add('store-option--active');
        selectedStore = opt.getAttribute('data-store') || opt.textContent.trim();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        // 1. сброс цены
        var minRange = document.getElementById('priceMinRange');
        var maxRange = document.getElementById('priceMaxRange');
        var minInput = document.getElementById('priceMinInput');
        var maxInput = document.getElementById('priceMaxInput');

        if (minRange && maxRange && minInput && maxInput) {
          var min = parseInt(minRange.min, 10);
          var max = parseInt(maxRange.max, 10);
          minRange.value = min;
          maxRange.value = max;
          minInput.value = min;
          maxInput.value = max;
        }

        // 2. розмір
        document.querySelectorAll('.size-option--active').forEach(function (btn) {
          btn.classList.remove('size-option--active');
        });
        var sizeLabel = document.querySelector('.js-size-filter-label');
        if (sizeLabel) sizeLabel.textContent = '';

        // 3. колір
        document.querySelectorAll('.color-option--active').forEach(function (opt) {
          opt.classList.remove('color-option--active');
        });
        var colorLabel = document.querySelector('.js-color-filter-label');
        if (colorLabel) colorLabel.textContent = '';

        // 4. сортування
        var sortCurrent = document.querySelector('.js-sort-current');
        if (sortCurrent) sortCurrent.textContent = 'Спочатку нові';

        var sortOptions = document.querySelectorAll('.sort-option');
        sortOptions.forEach(function (opt, index) {
          if (index === 0) {
            opt.classList.add('sort-option--active');
          } else {
            opt.classList.remove('sort-option--active');
          }
        });

        // 5. магазини
        storeOptions.forEach(function (o) {
          o.classList.remove('store-option--active');
        });
        selectedStore = null;

        // 6. закрыть попапы
        document.querySelectorAll(
          '.size-popup--open, .color-popup--open, .sort-popup--open, .availability-popup--open'
        ).forEach(function (p) {
          p.classList.remove(
            'size-popup--open',
            'color-popup--open',
            'sort-popup--open',
            'availability-popup--open'
          );
        });

        applyFilters();
      });
    }
  })();

  // Сортування

  (function () {
    var block = document.querySelector('.filter-block--sort');
    var popup = document.getElementById('sortPopup');
    if (!block || !popup) return;

    var toggleTargets = block.querySelectorAll('.js-sort-filter-toggle');
    var closeBtn = popup.querySelector('.sort-popup__close');
    var options = popup.querySelectorAll('.sort-option');
    var currentLabel = block.querySelector('.js-sort-current');

    function openPopup() {
      popup.classList.add('sort-popup--open');
    }

    function closePopup() {
      popup.classList.remove('sort-popup--open');
    }

    toggleTargets.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (popup.classList.contains('sort-popup--open')) {
          closePopup();
        } else {
          openPopup();
        }
      });
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) {
          o.classList.remove('sort-option--active');
        });
        opt.classList.add('sort-option--active');

        var label = opt.getAttribute('data-label') || opt.textContent.trim();
        if (currentLabel) {
          currentLabel.textContent = label;
        }

        closePopup();
        applyFilters();
      });
    });

    document.addEventListener('click', function (e) {
      if (!popup.contains(e.target) && !block.contains(e.target)) {
        closePopup();
      }
    });
  })();

  applyFilters();
})();
