const ORDERS_STORAGE_KEY = 'ordersQueue';

function formatUAH(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('uk-UA') + ' грн';
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Помилка читання', e);
    return [];
  }
}

function saveOrders(list) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Помилка запису', e);
  }
}

function renderAdminOrders() {
  const listEl = document.getElementById('adminOrdersList');
  const emptyEl = document.getElementById('adminOrdersEmpty');
  if (!listEl) return;

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
    .forEach((order) => {
      const firstItem =
        order.items && order.items.length ? order.items[0] : null;

      const img = firstItem && firstItem.img;
      const productName =
        firstItem && firstItem.name
          ? firstItem.name
          : 'Товарів у замовленні: ' + (order.items ? order.items.length : 0);
      const productUrl =
        firstItem && firstItem.id
          ? 'product.html?id=' + encodeURIComponent(firstItem.id)
          : '#';

      const card = document.createElement('article');
      card.className = 'admin-order';
      card.dataset.orderId = order.id;

      let statusText = 'В очікуванні';
      let statusClass = 'admin-order-status--pending';
      if (order.status === 'approved') {
        statusText = 'Схвалено';
        statusClass = 'admin-order-status--approved';
      } else if (order.status === 'rejected') {
        statusText = 'Відхилено';
        statusClass = 'admin-order-status--rejected';
      }

      const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleString('uk-UA')
        : '';

      const total =
        (order.totals && (order.totals.final || order.totals.base)) || 0;

      card.innerHTML = `
        <div class="admin-order-main">
          ${
        img
          ? `
          <a href="${productUrl}" class="admin-order-thumb" target="_blank">
            <img src="${img}" alt="">
          </a>
          `
          : ''
      }
          <div class="admin-order-info">
            <div class="admin-order-product-name">
              ${
        productUrl !== '#'
          ? `<a href="${productUrl}" target="_blank">${productName}</a>`
          : productName
      }
            </div>
            <div class="admin-order-meta">
              № ${order.id} · ${createdAt}
            </div>
            <div class="admin-order-customer">
              <div><strong>Покупець:</strong> ${
        order.customer?.name || ''
      }</div>
              <div><strong>Телефон:</strong> ${
        order.customer?.phone || ''
      }</div>
              ${
        order.customer?.comment
          ? `<div><strong>Коментар:</strong> ${order.customer.comment}</div>`
          : ''
      }
              <div><strong>Сума:</strong> ${formatUAH(total)}</div>
            </div>
          </div>
        </div>

        <div class="admin-order-actions">
          <div class="admin-order-status ${statusClass}">${statusText}</div>
          <button type="button"
                  class="admin-order-btn admin-order-btn--approve"
                  ${order.status !== 'pending' ? 'disabled' : ''}>
            СХВАЛИТИ
          </button>
          <button type="button"
                  class="admin-order-btn admin-order-btn--reject"
                  ${order.status !== 'pending' ? 'disabled' : ''}>
            ВІДХИЛИТИ
          </button>
        </div>
      `;

      listEl.appendChild(card);
    });
}

function handleAdminClick(e) {
  const approveBtn = e.target.closest('.admin-order-btn--approve');
  const rejectBtn = e.target.closest('.admin-order-btn--reject');
  if (!approveBtn && !rejectBtn) return;

  const card = (approveBtn || rejectBtn).closest('.admin-order');
  if (!card) return;

  const orderId = card.dataset.orderId;
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;

  if (orders[idx].status !== 'pending') {
    return;
  }

  if (approveBtn) {
    orders[idx].status = 'approved';
  } else if (rejectBtn) {
    orders[idx].status = 'rejected';
  }

  saveOrders(orders);
  renderAdminOrders();
}

document.addEventListener('DOMContentLoaded', renderAdminOrders);
document.addEventListener('click', handleAdminClick);
