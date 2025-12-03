document.addEventListener('DOMContentLoaded', function () {
  if (!window.ShopData) return;

  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug') || '';

  var categories = ShopData.getCategories();
  var category = categories.find(function (c) {
    return String(c.code || '').toLowerCase() === slug.toLowerCase();
  });

  var titleEl = document.getElementById('categoryTitle');
  var crumbsEl = document.getElementById('categoryBreadcrumbs');
  var gridEl = document.getElementById('categoryProductsGrid');

  if (!category) {
    if (titleEl) titleEl.textContent = 'Категорію не знайдено';
    if (crumbsEl) crumbsEl.textContent = 'Категорія не знайдена.';
    if (gridEl) gridEl.innerHTML = '<p>Невірний slug категорії. Перевірте посилання.</p>';
    return;
  }

  if (titleEl) {
    titleEl.textContent = category.name || 'Категорія';
  }
  if (crumbsEl) {
    crumbsEl.innerHTML =
      '<span>Головна</span>' +
      '<span>—</span>' +
      '<span>Категорія</span>' +
      '<span>—</span>' +
      '<span>' + (category.name || '') + '</span>';
  }

  var allProducts = ShopData.getProducts().filter(function (p) {
    return Number(p.categoryId) === Number(category.id);
  });

  var minPrice = 0;
  var maxPrice = 0;

  if (allProducts.length) {
    minPrice = allProducts.reduce(function (acc, p) {
      var val = Number(p.price) || 0;
      return acc == null ? val : Math.min(acc, val);
    }, null);
    maxPrice = allProducts.reduce(function (acc, p) {
      var val = Number(p.price) || 0;
      return acc == null ? val : Math.max(acc, val);
    }, null);

    if (!Number.isFinite(minPrice)) minPrice = 0;
    if (!Number.isFinite(maxPrice)) maxPrice = minPrice + 10;
  } else {
    minPrice = 0;
    maxPrice = 10000;
  }

  // DOM
  var minRange = document.getElementById('priceMinRange');
  var maxRange = document.getElementById('priceMaxRange');
  var minInput = document.getElementById('priceMinInput');
  var maxInput = document.getElementById('priceMaxInput');

  function initPriceControls() {
    if (!minRange || !maxRange || !minInput || !maxInput) return;

    minRange.min = String(minPrice);
    minRange.max = String(maxPrice);
    maxRange.min = String(minPrice);
    maxRange.max = String(maxPrice);

    minRange.value = String(minPrice);
    maxRange.value = String(maxPrice);
    minInput.value = String(minPrice);
    maxInput.value = String(maxPrice);

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
      var minVal = clamp(minInput.value, minPrice, maxPrice);
      var maxVal = clamp(maxInput.value, minPrice, maxPrice);

      if (maxVal - minVal < GAP) {
        if (minVal + GAP <= maxPrice) {
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
  }

  initPriceControls();

  // Вибрані розміри / кольори / сортування

  function getPriceRange() {
    if (!minInput || !maxInput) {
      return { min: minPrice, max: maxPrice };
    }
    var minVal = parseInt(minInput.value, 10);
    var maxVal = parseInt(maxInput.value, 10);
    if (isNaN(minVal)) minVal = minPrice;
    if (isNaN(maxVal)) maxVal = maxPrice;
    return { min: minVal, max: maxVal };
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

  function renderProducts(list) {
    if (!gridEl) return;

    if (!Array.isArray(list) || !list.length) {
      gridEl.innerHTML =
        '<p class="category-empty">Поки що немає товарів у цій категорії.</p>';
      return;
    }

    var html = list.map(function (p) {
      var id = p.id || '';
      var name = p.name || '';
      var safeName = String(name).replace(/"/g, '&quot;');
      var image = p.image || '../assets/placeholder-product.jpg';

      var sizesText = '';
      if (Array.isArray(p.sizes) && p.sizes.length) {
        sizesText = p.sizes.join(' ');
      }

      var priceNow = (p.price != null) ? (p.price + ' грн') : '';
      var priceOld = (p.oldPrice != null && p.oldPrice > p.price)
        ? (p.oldPrice + ' грн')
        : '';

      var badgeHtml = '';
      if (p.oldPrice != null && p.oldPrice > p.price) {
        var diff = p.oldPrice - p.price;
        var percent = Math.round((diff / p.oldPrice) * 100);
        if (percent > 0) {
          badgeHtml = '<span class="salebadge">-' + percent + '%</span>';
        }
      }

      return (
        '<article class="salecard" data-product-id="' + id + '">' +
        '  <div class="salepic">' +
        '    <a href="product.html?id=' + encodeURIComponent(id) + '">' +
        '      <img src="' + image + '" alt="' + safeName + '">' +
        '    </a>' +
        badgeHtml +
        '    <button class="salewish" type="button" aria-label="Додати в обране">' +
        '      <svg width="20" height="20" style="display:flex;align-self:center" fill="#fff" viewBox="0 0 1024 1024" class="">' +
        '        <path stroke="#fff" stroke-width="30" d="M511.757 900.842l-15.040-12.517c-146.973-117.977-278.219-235.080-403.176-358.535l0.507 0.5c-42.727-43.583-69.097-103.339-69.097-169.255 0-65.426 25.98-124.784 68.188-168.321l-0.060 0.062c43.201-43.021 102.788-69.618 168.587-69.618s125.386 26.597 168.595 69.627l62.576 62.528c3.447 3.444 7.938 5.842 12.96 6.675l0.139 0.020c1.96 0.508 4.212 0.8 6.53 0.8 7.257 0 13.847-2.855 18.708-7.504l-0.010 0.010 62.583-62.34c43.207-43.009 102.792-69.599 168.587-69.599s125.38 26.589 168.596 69.607l-0.009-0.009c42.146 43.474 68.128 102.833 68.128 168.259 0 65.916-26.37 125.671-69.137 169.294l0.038-0.039c-124.454 122.867-255.699 239.969-392.668 350.247l-10 7.788zM261.424 170.994c-0.201-0.001-0.439-0.001-0.677-0.001-52.255 0-99.546 21.254-133.7 55.59l-0.009 0.009c-33.357 34.933-53.886 82.364-53.886 134.59 0 53.451 21.503 101.879 56.33 137.107l-0.019-0.019c118.247 116.723 242.844 228.1 372.782 333.13l9.511 7.44c139.664-112.627 264.415-224.004 383.419-341.2l-0.642 0.63c36.345-34.739 58.939-83.601 58.939-137.74 0-105.166-85.253-190.419-190.419-190.419-52.933 0-100.821 21.598-135.333 56.463l-0.015 0.016-62.583 62.389c-13.402 13.299-31.863 21.518-52.242 21.518-5.554 0-10.965-0.61-16.171-1.767l0.494 0.093c-15.137-2.554-28.288-9.677-38.316-19.881l-0.010-0.010-62.583-62.34c-34.339-34.351-81.783-55.599-134.191-55.599-0.239 0-0.477 0-0.716 0.001h0.037z"></path>' +
        '      </svg>' +
        '    </button>' +
        '  </div>' +
        '  <div class="salebody">' +
        '    <h3 class="salename">' + name + '</h3>' +
        '    <div class="salesize">' + sizesText + '</div>' +
        '    <div class="saleprice">' +
        (priceNow ? '      <span class="salenow">' + priceNow + '</span>' : '') +
        (priceOld ? '      <s class="saleold">' + priceOld + '</s>' : '') +
        '    </div>' +
        '  </div>' +
        '</article>'
      );
    }).join('');

    gridEl.innerHTML = html;
  }


  function applyFilters() {
    var range = getPriceRange();
    var sizes = getSelectedSizes();
    var colors = getSelectedColors();
    var mode = getSortMode();

    var filtered = allProducts.filter(function (p) {
      var price = Number(p.price) || 0;
      if (price < range.min || price > range.max) {
        return false;
      }

      if (sizes.length > 0) {
        if (!Array.isArray(p.sizes) || !p.sizes.length) return false;
        var hasSize = p.sizes.some(function (s) {
          return sizes.indexOf(String(s).toUpperCase()) !== -1;
        });
        if (!hasSize) return false;
      }

      if (colors.length > 0) {
        if (!Array.isArray(p.colors) || !p.colors.length) return false;
        var hasColor = p.colors.some(function (c) {
          return colors.indexOf(String(c).toLowerCase().trim()) !== -1;
        });
        if (!hasColor) return false;
      }

      return true;
    });

    filtered.sort(function (a, b) {
      var ap = Number(a.price) || 0;
      var bp = Number(b.price) || 0;
      var ad = Number(a.oldPrice) || 0;
      var bd = Number(b.oldPrice) || 0;
      var aid = Number(a.id) || 0;
      var bid = Number(b.id) || 0;

      switch (mode) {
        case 'old':
          return aid - bid;
        case 'cheap':
          return ap - bp;
        case 'expensive':
          return bp - ap;
        case 'discount':
          var adisc = (ad > ap) ? (ad - ap) : 0;
          var bdisc = (bd > bp) ? (bd - bp) : 0;
          if (adisc === bdisc) {
            return bid - aid;
          }
          return bdisc - adisc;
        case 'new':
        default:
          return bid - aid;
      }
    });

    renderProducts(filtered);
  }

  // Розмір (попап)
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

  // Колір (попап)
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

  // Наявність
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
        // 1. цена
        if (minRange && maxRange && minInput && maxInput) {
          minRange.value = String(minPrice);
          maxRange.value = String(maxPrice);
          minInput.value = String(minPrice);
          maxInput.value = String(maxPrice);
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

        applyFilters();
      });
    }
  })();

  // Сортування (попап)
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
});
