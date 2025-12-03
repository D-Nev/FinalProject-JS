document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('orderOverlay');
  const form = document.getElementById('orderForm');

  if (!overlay || !form) return;

  const priceEl = overlay.querySelector('[data-order-price]');
  const qtyInput = overlay.querySelector('.order-qty-input');
  const qtyBtns = overlay.querySelectorAll('.order-qty-btn');

  const usePromo = document.getElementById('usePromo');
  const promoBlock = document.getElementById('orderPromo');
  const promoInput = document.getElementById('promo');
  const promoMsg = document.getElementById('promoMsg');
  const applyPromoBtn = document.getElementById('applyPromo');

  const productNameEl = document.getElementById('orderProductName');
  const productSizeEl = document.getElementById('orderProductSize');
  const productImgEl  = document.getElementById('orderProductImage');

  let basePrice = Number(priceEl?.dataset.basePrice || '0');
  let discount = 0; // 0…1

  let currentProduct = {
    id: null,
    name: productNameEl ? productNameEl.textContent.trim() : '',
    size: productSizeEl ? productSizeEl.textContent.trim() : '',
    img:  productImgEl  ? productImgEl.getAttribute('src') : ''
  };

  function setBodyScroll(disabled){
    if (disabled){
      document.body.classList.add('order-no-scroll');
    } else {
      document.body.classList.remove('order-no-scroll');
    }
  }

  function parseQty(){
    if (!qtyInput) return 1;
    let val = parseInt(qtyInput.value.replace(/[^\d]/g, ''), 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 99) val = 99;
    qtyInput.value = String(val);
    return val;
  }

  function updateTotal(){
    if (!priceEl) return;
    const qty = parseQty();
    let price = Number(priceEl.dataset.basePrice || '0');
    if (isNaN(price)) price = 0;
    const total = Math.round(price * qty * (1 - discount));
    priceEl.textContent = total ? `${total} грн.` : '';
  }

  function clearErrors(){
    const fields = form.querySelectorAll('.order-field');
    fields.forEach(field => {
      field.classList.remove('order-field--invalid');
      const err = field.querySelector('.order-error');
      if (err) err.textContent = '';
    });
  }

  function setError(fieldName, message){
    const field = form.querySelector(`.order-field[data-field="${fieldName}"]`);
    if (!field) return;
    const err = field.querySelector('.order-error');
    if (err) err.textContent = message || '';
    if (message){
      field.classList.add('order-field--invalid');
    } else {
      field.classList.remove('order-field--invalid');
    }
  }

  function validateForm(){
    clearErrors();
    let valid = true;

    const name  = form.elements['name'].value.trim();
    const phone = form.elements['phone'].value.trim();
    const qty   = parseQty();

    // ПІБ
    if (!name || name.length < 3){
      setError('name', 'Введіть ПІБ (мінімум 3 символи)');
      valid = false;
    } else if (!/^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]{3,}$/.test(name)){
      setError('name', 'ПІБ може містити тільки літери');
      valid = false;
    }

    if (!phone){
      setError('phone', 'Введіть номер телефону');
      valid = false;
    } else {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 12){
        setError('phone', 'Введіть коректний номер телефону');
        valid = false;
      }
    }

    if (qty < 1 || qty > 99){
      alert('Кількість повинна бути від 1 до 99');
      valid = false;
    }

    return valid;
  }

  function openOverlay(productData){
    if (productData){
      currentProduct = {
        ...currentProduct,
        ...productData
      };

      if (productNameEl && productData.name){
        productNameEl.textContent = productData.name;
      }
      if (productSizeEl && productData.size){
        productSizeEl.textContent = productData.size;
      }
      if (productImgEl && productData.img){
        productImgEl.src = productData.img;
      }
      if (priceEl && productData.price){
        basePrice = Number(productData.price);
        priceEl.dataset.basePrice = String(basePrice);
      }
    }

    overlay.classList.add('order-overlay--visible');
    overlay.setAttribute('aria-hidden', 'false');
    setBodyScroll(true);
    if (qtyInput) qtyInput.focus();
    updateTotal();
  }

  function resetPromo(){
    discount = 0;
    if (promoInput) promoInput.value = '';
    if (promoMsg){
      promoMsg.textContent = '';
      promoMsg.className = 'order-promo-msg';
    }
  }

  function closeOverlay(){
    overlay.classList.remove('order-overlay--visible');
    overlay.setAttribute('aria-hidden', 'true');
    setBodyScroll(false);

    form.reset();
    clearErrors();
    if (qtyInput) qtyInput.value = '1';
    resetPromo();

    if (promoBlock) promoBlock.classList.remove('order-promo--visible');

    if (priceEl && priceEl.dataset.basePrice){
      basePrice = Number(priceEl.dataset.basePrice);
    }
    updateTotal();
  }

  qtyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir === 'dec' ? -1 : 1;
      let val = parseQty() + dir;
      if (val < 1) val = 1;
      if (val > 99) val = 99;
      qtyInput.value = String(val);
      updateTotal();
    });
  });

  if (qtyInput){
    qtyInput.addEventListener('input', updateTotal);
    qtyInput.addEventListener('blur', updateTotal);
  }

  if (usePromo && promoBlock){
    usePromo.addEventListener('change', () => {
      if (usePromo.checked){
        promoBlock.classList.add('order-promo--visible');
      } else {
        promoBlock.classList.remove('order-promo--visible');
        resetPromo();
        updateTotal();
      }
    });
  }

  if (applyPromoBtn && promoInput && promoMsg){
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      resetPromo();

      if (!code){
        promoMsg.textContent = 'Введіть промокод';
        promoMsg.classList.add('order-promo-msg--error');
        return;
      }

      if (code === 'STAFF10'){
        discount = 0.10;
        promoMsg.textContent = 'Промокод застосовано (–10%)';
        promoMsg.classList.add('order-promo-msg--ok');
      } else {
        promoMsg.textContent = 'Невірний промокод';
        promoMsg.classList.add('order-promo-msg--error');
      }

      updateTotal();
    });
  }

  const openBtns = document.querySelectorAll('[data-order-open]');
  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productData = {
        id:    btn.dataset.productId || null,
        name:  btn.dataset.productName || undefined,
        size:  btn.dataset.productSize || undefined,
        price: btn.dataset.productPrice ? Number(btn.dataset.productPrice) : undefined,
        img:   btn.dataset.productImg || undefined
      };
      openOverlay(productData);
    });
  });

  overlay.querySelectorAll('[data-order-close]').forEach(btn => {
    btn.addEventListener('click', closeOverlay);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('order-overlay--visible')){
      closeOverlay();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()){
      alert('Будь ласка, виправте помилки у формі.');
      return;
    }

    const qty = parseQty();
    const phoneRaw   = form.elements['phone'].value.trim();
    const phoneDigits = phoneRaw.replace(/\D/g, '');
    const phoneNormalized = '+' + phoneDigits; // просто +цифри

    const order = {
      product: {
        id:    currentProduct.id,
        name:  productNameEl ? productNameEl.textContent.trim() : '',
        size:  productSizeEl ? productSizeEl.textContent.trim() : '',
        qty:   qty,
        pricePerUnit: basePrice,
        discount: discount,
        promoCode: (usePromo && usePromo.checked && promoInput)
          ? (promoInput.value.trim() || null)
          : null,
        total: Math.round(basePrice * qty * (1 - discount))
      },
      customer: {
        name:  form.elements['name'].value.trim(),
        phone: phoneNormalized
      },
      createdAt: new Date().toISOString()
    };

    console.log('ORDER JSON:', order);
    alert('Дякуємо! Замовлення прийнято.\nДеталі дивись в консолі.');
    closeOverlay();
  });
});
