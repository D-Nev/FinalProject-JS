const USERS_STORAGE_KEY = 'staff_users';

// Користувач
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

function cleanPhoneAdmin(value) {
  return (value || '').toString().trim().replace(/\s+/g, '');
}

function loadUsersForAdmin() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Помилка читання користувачів', e);
    return [];
  }
}

function saveUsersForAdmin(list) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Помилка запису користувачів', e);
  }
}

function formatDateFromId(id) {
  const n = Number(id);
  if (!n) return '';
  const d = new Date(n);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yy} ${hh}:${mi}`;
}

function renderAdminUsers(listEl, emptyEl, users) {
  if (!listEl) return;
  listEl.innerHTML = '';

  if (!users.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  users
    .slice()
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .forEach(user => {
      const card = document.createElement('article');
      card.className = 'admin-users-item';

      const created = formatDateFromId(user.id);
      card.innerHTML = `
        <div class="admin-users-item-main">
          <div class="admin-users-name">${user.name || 'Без імені'}</div>
          <div class="admin-users-phone">${user.phone || ''}</div>
        </div>
        <div class="admin-users-meta">
          <span>id: ${user.id || '-'}</span>
          ${created ? `<span>зареєстровано: ${created}</span>` : ''}
        </div>
      `;

      listEl.appendChild(card);
    });
}

function initAdminUsersPage() {
  // Защита токо для админа
  const current = getCurrentUserForAdmin();
  if (!current || current.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const form      = document.getElementById('adminUserForm');
  const listEl    = document.getElementById('adminUsersList');
  const emptyEl   = document.getElementById('adminUsersEmpty');
  const refreshBt = document.getElementById('adminUsersRefresh');

  if (!form || !listEl) {
    return;
  }

  let users = loadUsersForAdmin();
  renderAdminUsers(listEl, emptyEl, users);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput  = document.getElementById('adminUserName');
    const phoneInput = document.getElementById('adminUserPhone');
    const passInput  = document.getElementById('adminUserPass');
    const pass2Input = document.getElementById('adminUserPass2');

    const name  = nameInput ? nameInput.value.trim() : '';
    const phone = cleanPhoneAdmin(phoneInput ? phoneInput.value : '');
    const pass  = passInput ? passInput.value : '';
    const pass2 = pass2Input ? pass2Input.value : '';

    if (!name || !phone || !pass || !pass2) {
      alert('Заповніть усі поля.');
      return;
    }

    if (pass !== pass2) {
      alert('Паролі не співпадають.');
      return;
    }

    if (phone === 'admin') {
      alert('Логін "admin" зарезервований для адміністратора.');
      return;
    }

    users = loadUsersForAdmin();
    if (users.some(u => u.phone === phone)) {
      alert('Користувач з таким телефоном вже існує.');
      return;
    }

    const newUser = {
      id: Date.now(),
      phone,
      name,
      password: pass
    };

    users.push(newUser);
    saveUsersForAdmin(users);
    renderAdminUsers(listEl, emptyEl, users);

    form.reset();
    alert('Користувача успішно зареєстровано.');
  });

  if (refreshBt) {
    refreshBt.addEventListener('click', () => {
      users = loadUsersForAdmin();
      renderAdminUsers(listEl, emptyEl, users);
    });
  }
}

document.addEventListener('DOMContentLoaded', initAdminUsersPage);
