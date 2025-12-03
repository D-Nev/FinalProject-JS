const ORDERS_STORAGE_KEY = 'orders';

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

function formatUAH(num) {
  return (Number(num) || 0).toLocaleString('uk-UA') + ' грн';
}

function formatDateISO(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yy} ${hh}:${mi}`;
}

function initAdminOrdersPage() {
  // Проверка на админа
  const user = getCurrentUserForAdmin();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const listEl = document.getElementById('adminOrdersList');
  const emptyEl = document.getElementById('adminOrdersEmpty');
  const clearBtn = document.getElementById('adminClearOrders');

  if (!listEl) return;

  function render() {
    const orders = loadOrders();
    listEl.innerHTML = '';

    if (!orders.length) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    orders
      .slice()
      .reverse()
      .forEach(order => {
        const card = document.createElement('article');
        card.className = 'admin-order-card';

        const base = order.totals?.baseTotal ?? 0;
        const final = order.totals?.finalTotal ?? base;

        const itemsHtml = (order.items || [])
          .map(item => {
            const productUrl = item.id
              ? `product.html?id=${encodeURIComponent(item.id)}`
              : '#';

            return `
              <div class="admin-order-item">
                <a href="${productUrl}" class="admin-order-item-thumb">
                  ${
              item.img
                ? `<img src="${item.img}" alt="${item.name || ''}">`
                : ''
            }
                </a>
                <div class="admin-order-item-title">
                  <a href="${productUrl}">
                    ${item.name || ''}${
              item.size ? `, розмір ${item.size}` : ''
            }
                  </a>
                </div>
                <div>x${item.qty || 1}</div>
                <div>${formatUAH(item.price)}</div>
              </div>
            `;
          })
          .join('');

        card.innerHTML = `
          <div class="admin-order-header">
            <div class="admin-order-id">${order.id || 'Без номера'}</div>
            <div class="admin-order-date">${formatDateISO(order.createdAt)}</div>
          </div>

          <div class="admin-order-cols">
            <div class="admin-order-col">
              <div class="admin-order-col-title">Покупець</div>
              <div>${order.customer?.name || ''}</div>
              <div>${order.customer?.phone || ''}</div>
              ${
          order.customer?.comment
            ? `<div>Коментар: ${order.customer.comment}</div>`
            : ''
        }
            </div>

            <div class="admin-order-col">
              <div class="admin-order-col-title">Доставка</div>
              <div>${order.delivery?.methodLabel || ''}</div>
              <div>${
          [order.delivery?.regionLabel, order.delivery?.cityLabel]
            .filter(Boolean)
            .join(', ')
        }</div>
              <div>${order.delivery?.branchLabel || ''}</div>
            </div>

            <div class="admin-order-col">
              <div class="admin-order-col-title">Оплата</div>
              <div>${
          order.payment?.type === 'card'
            ? 'Карткою Visa/MasterCard'
            : 'При отриманні'
        }</div>
              ${
          order.payment?.promoApplied
            ? `<div>Промокод: ${order.payment.promoCode || ''}</div>`
            : ''
        }
            </div>
          </div>

          <div class="admin-order-items">
            <div class="admin-order-col-title">Товари</div>
            ${itemsHtml}
          </div>

          <div class="admin-order-total">
            Разом: <span>${formatUAH(final)}</span>
            ${
          final !== base
            ? `<div style="font-size:12px;color:#777;">Без знижки: ${formatUAH(
              base
            )}</div>`
            : ''
        }
          </div>
        `;

        listEl.appendChild(card);
      });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Очистити всі замовлення?')) return;
      saveOrders([]);
      render();
    });
  }

  render();
}

document.addEventListener('DOMContentLoaded', initAdminOrdersPage);
