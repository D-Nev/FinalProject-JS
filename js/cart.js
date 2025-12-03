const CART_STORAGE_KEY = 'cart';
const ORDERS_STORAGE_KEY = 'orders';
const CART_COOKIE_NAME = 'cart';

// cookie basket read
function readCartFromCookie() {
  try {
    const cookieStr = document.cookie || '';
    const parts = cookieStr.split(';');

    let raw = null;
    for (let part of parts) {
      const [name, ...rest] = part.split('=');
      if (!name) continue;
      if (name.trim() === CART_COOKIE_NAME) {
        raw = rest.join('=').trim();
        break;
      }
    }
    if (!raw) return null;

    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.error('Помилка читання кошика з cookie', e);
    return null;
  }
}

// запис кошика у cookie
function writeCartToCookie(list) {
  try {
    const json = JSON.stringify(list || []);
    const encoded = encodeURIComponent(json);
    const days = 7;
    const expiresDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const expires = expiresDate.toUTCString();

    document.cookie = `${CART_COOKIE_NAME}=${encoded}; expires=${expires}; path=/`;
  } catch (e) {
    console.error('Помилка запису кошика в cookie', e);
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.warn('Не вдалося записати кошик у localStorage (резерв):', e);
  }
}

function loadCart() {
  // 1. спробувати з cookie
  const fromCookie = readCartFromCookie();
  if (Array.isArray(fromCookie)) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(fromCookie));
    } catch (e) {
      console.warn('Не вдалося синхронізувати кошик у localStorage:', e);
    }
    return fromCookie;
  }

  // 2. Старі дані з localStorage
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Помилка читання кошика з localStorage', e);
    return [];
  }
}

function saveCart(list) {
  writeCartToCookie(list || []);
}

function clearCart() {
  saveCart([]);
}

// Формат грошей

function formatUAH(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('uk-UA') + ' грн';
}

// ООП
function addToCart(payload) {
  if (!payload || !payload.id) return;

  if (window.ShopModels && ShopModels.Cart) {
    try {
      const rawCart = loadCart();
      const cart = ShopModels.Cart.fromPlain(rawCart);
      cart.addItemFromPayload(payload);
      saveCart(cart.toPlain());
    } catch (e) {
      console.error('Помилка при додаванні до кошика (addToCart / OOP):', e);
    }
    return;
  }

  const cart = loadCart();
  const sizeKey = payload.size || '';

  const idx = cart.findIndex(
    item => item.id === payload.id && (item.size || '') === sizeKey
  );

  if (idx !== -1) {
    const current = cart[idx];
    const delta =
      payload.qty && !Number.isNaN(Number(payload.qty))
        ? Number(payload.qty)
        : 1;
    current.qty = Math.max(1, (current.qty || 1) + delta);
  } else {
    cart.push({
      id: payload.id,
      name: payload.name || '',
      article: payload.article || '',
      price: Number(payload.price) || 0,
      oldPrice: payload.oldPrice != null ? Number(payload.oldPrice) : null,
      size: sizeKey,
      img: payload.img || '',
      qty:
        payload.qty && !Number.isNaN(Number(payload.qty))
          ? Number(payload.qty)
          : 1
    });
  }

  saveCart(cart);
}

// orders hlp

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Помилка читання замовлень', e);
    return [];
  }
}

function saveOrders(list) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Помилка запису замовлень', e);
  }
}

// basket page

function initBasketPage() {
  const emptySection = document.getElementById('basketEmptyState');
  const basketFullSection = document.getElementById('basketFull');
  const checkoutBlock = document.getElementById('checkoutBlock');

  const itemsContainer = document.getElementById('basketItems');
  const totalEl = document.getElementById('basketTotalAmount');
  const clearBtn = document.getElementById('basketClear');

  const promoCheckbox = document.getElementById('basketPromoCheckbox');
  const promoBox = document.getElementById('basketPromoBox');
  const promoInput = document.getElementById('basketPromoInput');
  const promoBtn = document.getElementById('basketPromoApply');
  const promoMsg = document.getElementById('basketPromoMsg');

  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutName = document.getElementById('checkoutName');
  const checkoutPhone = document.getElementById('checkoutPhone');
  const checkoutComment = document.getElementById('checkoutComment');
  const checkoutDeliveryMethod = document.getElementById('checkoutDeliveryMethod');
  const checkoutRegion = document.getElementById('checkoutRegion');
  const checkoutCity = document.getElementById('checkoutCity');
  const checkoutBranch = document.getElementById('checkoutBranch');

  if (!itemsContainer || !totalEl) return;

  const PROMO_CODE = 'Staff2025';
  const PROMO_DISCOUNT = 0.15; // 15%
  let promoApplied = false;

  // === Налаштування API для відправки замовлень ===
  // Це демо-ендпоінт. Потім можна замінити на свій (наприклад, PHP на AwardSpace).
  const ORDER_API_URL = 'https://jsonplaceholder.typicode.com/posts';

  // Відправка замовлення на сервер за допомогою fetch + async/await
  async function sendOrderToServer(orderPayload) {
    // Якщо fetch недоступний (дуже старий браузер) — просто пропускаємо відправку
    if (typeof fetch !== 'function') {
      console.warn(
        'fetch недоступний у цьому браузері, пропускаємо відправку замовлення на сервер'
      );
      return { skipped: true };
    }

    const response = await fetch(ORDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      throw new Error('HTTP помилка при відправці замовлення: ' + response.status);
    }

    const data = await response.json();
    return data;
  }

  // для валідації полів
  function setFieldError(inputEl, errorId, message) {
    if (inputEl) {
      inputEl.classList.add('checkout-input--error');
    }
    if (!errorId) return;
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = message || '';
  }

  function clearFieldError(inputEl, errorId) {
    if (inputEl) {
      inputEl.classList.remove('checkout-input--error');
    }
    if (!errorId) return;
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = '';
  }

  function calcTotals(cart) {
    let baseTotal = 0;

    cart.forEach(item => {
      const lineTotal = (Number(item.price) || 0) * (item.qty || 1);
      baseTotal += lineTotal;
    });

    let finalTotal = baseTotal;
    if (promoApplied && baseTotal > 0) {
      finalTotal = Math.round(baseTotal * (1 - PROMO_DISCOUNT));
    }

    return { baseTotal, finalTotal };
  }

  function updateVisibility(cart) {
    const hasItems = cart.length > 0;

    if (emptySection) emptySection.style.display = hasItems ? 'none' : 'block';
    if (basketFullSection)
      basketFullSection.style.display = hasItems ? 'block' : 'none';
    if (checkoutBlock)
      checkoutBlock.style.display = hasItems ? 'block' : 'none';

    if (!hasItems) {
      if (promoCheckbox) promoCheckbox.checked = false;
      promoApplied = false;
      if (promoBox) promoBox.style.display = 'none';
      if (promoMsg) {
        promoMsg.textContent = '';
        promoMsg.classList.remove(
          'basket-promo-msg--ok',
          'basket-promo-msg--error'
        );
      }
    }
  }

  function render() {
    const cart = loadCart();
    updateVisibility(cart);

    itemsContainer.innerHTML = '';

    if (!cart.length) {
      totalEl.textContent = formatUAH(0);
      return;
    }

    cart.forEach(item => {
      const row = document.createElement('article');
      row.className = 'basket-item';
      row.dataset.id = item.id;
      row.dataset.size = item.size || '';

      const productUrl = 'product.html?id=' + encodeURIComponent(item.id);

      row.innerHTML = `
        <div class="basket-item-left">
          <a href="${productUrl}" class="basket-item-thumb">
            ${item.img ? `<img src="${item.img}" alt="${item.name || ''}">` : ''}
          </a>
          <div class="basket-item-info">
            <a href="${productUrl}" class="basket-item-name">${item.name || ''}</a>
            <div class="basket-item-article">АРТИКУЛ: <span>${item.article || ''}</span></div>
            ${item.size ? `<div class="basket-item-size">РОЗМІР: <span>${item.size}</span></div>` : ''}
          </div>
        </div>

        <div class="basket-item-qty">
          <button type="button" class="basket-qty-btn basket-qty-btn--plus">+</button>
          <span class="basket-qty-value">${item.qty || 1}</span>
          <button type="button" class="basket-qty-btn basket-qty-btn--minus">−</button>
        </div>

        <div class="basket-item-price">
          <span class="basket-price-current">${formatUAH(item.price)}</span>
          ${
        item.oldPrice
          ? `<span class="basket-price-old">${formatUAH(item.oldPrice)}</span>`
          : ''
      }
        </div>

        <button type="button" class="basket-item-remove" aria-label="Видалити товар">
          <span class="basket-item-remove-ico">🗑</span>
        </button>
      `;

      itemsContainer.appendChild(row);
    });

    const { baseTotal, finalTotal } = calcTotals(cart);

    totalEl.textContent = formatUAH(finalTotal);

    if (promoMsg) {
      if (promoApplied && baseTotal > 0) {
        const saved = baseTotal - finalTotal;
        promoMsg.textContent =
          'Промокод застосовано: -15% (економія ' + formatUAH(saved) + ')';
        promoMsg.classList.remove('basket-promo-msg--error');
        promoMsg.classList.add('basket-promo-msg--ok');
      } else {
        promoMsg.textContent = '';
        promoMsg.classList.remove(
          'basket-promo-msg--ok',
          'basket-promo-msg--error'
        );
      }
    }
  }

  // Клики по корзине
  itemsContainer.addEventListener('click', e => {
    const row = e.target.closest('.basket-item');
    if (!row) return;

    const id = row.dataset.id;
    const sizeKey = row.dataset.size || '';

    const cart = loadCart();
    const idx = cart.findIndex(
      item => item.id === id && (item.size || '') === sizeKey
    );
    if (idx === -1) return;

    if (e.target.closest('.basket-qty-btn--plus')) {
      cart[idx].qty = (cart[idx].qty || 1) + 1;
      saveCart(cart);
      render();
      return;
    }

    if (e.target.closest('.basket-qty-btn--minus')) {
      if ((cart[idx].qty || 1) > 1) {
        cart[idx].qty -= 1;
        saveCart(cart);
        render();
      }
      return;
    }

    if (e.target.closest('.basket-item-remove')) {
      cart.splice(idx, 1);
      saveCart(cart);
      render();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', e => {
      e.preventDefault();
      clearCart();
      render();
    });
  }

  // Промокод
  if (promoCheckbox && promoBox) {
    promoCheckbox.addEventListener('change', () => {
      if (promoCheckbox.checked) {
        promoBox.style.display = 'flex';
      } else {
        promoBox.style.display = 'none';
        if (promoInput) promoInput.value = '';
        promoApplied = false;
        if (promoMsg) {
          promoMsg.textContent = '';
          promoMsg.classList.remove(
            'basket-promo-msg--ok',
            'basket-promo-msg--error'
          );
        }
        render();
      }
    });
  }

  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim();

      if (!code) {
        promoApplied = false;
        if (promoMsg) {
          promoMsg.textContent = 'Введіть промокод';
          promoMsg.classList.remove('basket-promo-msg--ok');
          promoMsg.classList.add('basket-promo-msg--error');
        }
        render();
        return;
      }

      if (code.toLowerCase() === PROMO_CODE.toLowerCase()) {
        promoApplied = true;
        if (promoMsg) {
          promoMsg.textContent = 'Промокод успішно застосовано (-15%)';
          promoMsg.classList.remove('basket-promo-msg--error');
          promoMsg.classList.add('basket-promo-msg--ок');
        }
      } else {
        promoApplied = false;
        if (promoMsg) {
          promoMsg.textContent = 'Невірний промокод';
          promoMsg.classList.remove('basket-promo-msg--ок');
          promoMsg.classList.add('basket-promo-msg--error');
        }
      }

      render();
    });
  }

  // Автопідстановка імені і телефону з кабінету
  if (checkoutName) {
    try {
      const profileRaw = localStorage.getItem('userProfile');
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        if (profile && profile.fullName) {
          checkoutName.value = profile.fullName;
        }
        if (profile && profile.phone) {
          checkoutPhone.value = profile.phone;
        }
      }
    } catch (e) {
    }
    if (!checkoutPhone.value) {
      checkoutPhone.value = '+380';
    }
  }

  // Відправка форми оформлення замовлення
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async e => {
      e.preventDefault();

      const cart = loadCart();
      if (!cart.length) {
        alert('Кошик порожній.');
        return;
      }

      const name = checkoutName ? checkoutName.value.trim() : '';
      const phone = checkoutPhone ? checkoutPhone.value.trim() : '';
      const comment = checkoutComment ? checkoutComment.value.trim() : '';

      let hasError = false;

      clearFieldError(checkoutName, 'checkoutNameError');
      clearFieldError(checkoutPhone, 'checkoutPhoneError');

      if (!name) {
        setFieldError(
          checkoutName,
          'checkoutNameError',
          'Введіть імʼя та прізвище'
        );
        hasError = true;
      } else if (name.length < 3) {
        setFieldError(
          checkoutName,
          'checkoutNameError',
          'Занадто коротке імʼя'
        );
        hasError = true;
      }

      // тут за бажанням можеш додати regex-перевірку телефона

      if (hasError) {
        return;
      }

      let deliveryMethodValue = '';
      let deliveryMethodLabel = '';
      if (checkoutDeliveryMethod) {
        deliveryMethodValue = checkoutDeliveryMethod.value;
        const opt =
          checkoutDeliveryMethod.options[
            checkoutDeliveryMethod.selectedIndex
            ];
        deliveryMethodLabel = opt ? opt.textContent.trim() : '';
      }

      function getSelectVal(selectEl) {
        if (!selectEl) return { value: '', label: '' };
        const value = selectEl.value;
        const opt = selectEl.options[selectEl.selectedIndex];
        const label = opt ? opt.textContent.trim() : '';
        return { value, label };
      }

      const region = getSelectVal(checkoutRegion);
      const city = getSelectVal(checkoutCity);
      const branch = getSelectVal(checkoutBranch);

      const paymentInput =
        checkoutForm.querySelector('input[name="payment"]:checked');
      const paymentType = paymentInput ? paymentInput.value : 'cod';

      const { baseTotal, finalTotal } = calcTotals(cart);

      let order;

      if (window.ShopModels && ShopModels.Order && ShopModels.Cart) {
        // OOP
        const cartModel = ShopModels.Cart.fromPlain(cart);
        order = new ShopModels.Order({
          id: 'ORD-' + Date.now(),
          items: cartModel.toPlain(),
          customer: { name, phone, comment },
          delivery: {
            method: deliveryMethodValue,
            methodLabel: deliveryMethodLabel,
            regionValue: region.value,
            regionLabel: region.label,
            cityValue: city.value,
            cityLabel: city.label,
            branchValue: branch.value,
            branchLabel: branch.label
          },
          payment: {
            type: paymentType,
            promoApplied,
            promoCode: promoApplied ? PROMO_CODE : null
          },
          totals: {
            baseTotal,
            finalTotal
          }
        });
      } else {
        order = {
          id: 'ORD-' + Date.now(),
          createdAt: new Date().toISOString(),
          customer: { name, phone, comment },
          delivery: {
            method: deliveryMethodValue,
            methodLabel: deliveryMethodLabel,
            regionValue: region.value,
            regionLabel: region.label,
            cityValue: city.value,
            cityLabel: city.label,
            branchValue: branch.value,
            branchLabel: branch.label
          },
          payment: {
            type: paymentType,
            promoApplied,
            promoCode: promoApplied ? PROMO_CODE : null
          },
          totals: {
            baseTotal,
            finalTotal
          },
          items: cart
        };
      }

      const orders = loadOrders();

      const orderForStorage =
        order && typeof order.toPlain === 'function' ? order.toPlain() : order;

      orders.push(orderForStorage);
      saveOrders(orders); // для адмінки все як і раніше в localStorage

      const orderForServer = orderForStorage;

      try {
        const serverResponse = await sendOrderToServer(orderForServer);
        console.log(
          'Замовлення відправлено на сервер (fetch/async-await):',
          serverResponse
        );
        alert('Дякуємо! Ваше замовлення відправлено на обробку.');
      } catch (err) {
        console.error('Не вдалося відправити замовлення на сервер:', err);
        alert(
          'Сталася помилка при відправці на сервер.\n' +
          'Замовлення збережено локально, адміністратор побачить його в адмінці.'
        );
      }

      clearCart();
      render();
    });
  }

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initBasketPage();
});
