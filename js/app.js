document.addEventListener('DOMContentLoaded', () => {
  initFavorites();
});


const HEART_PATH_ACTIVE = "M951.408 180.496c-47.888-47.84-111.712-74.176-179.712-74.176s-131.792 26.352-179.696 74.176l-64.32 64.16c-4.496 4.464-10.736 6.032-18.352 4.512-2.512-0.4-6.128-1.504-9.136-4.512l-64.304-64.176c-47.92-47.856-111.728-74.208-179.68-74.208-67.968 0-131.776 26.352-179.68 74.208-97.072 96.848-96.784 251.344 0.64 359.344 86.96 96.512 319.6 290.528 415.6 369.472l21.152 17.36 21.152-17.36c95.696-78.592 327.776-271.936 415.712-369.472 97.392-107.984 97.648-262.464 0.624-359.328z";

function loadFavorites() {
  try {
    const raw = localStorage.getItem('favorites');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Помилка читання favorites з localStorage', e);
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem('favorites', JSON.stringify(list));
  } catch (e) {
    console.error('Помилка збереження favorites в localStorage', e);
  }
}

function computeCardId(cardEl) {
  if (!cardEl) return null;

  if (cardEl.dataset.productId) {
    return cardEl.dataset.productId;
  }

  const img = cardEl.querySelector('img');
  const title = cardEl.querySelector('.salename, .newname, h3');
  const priceNode = cardEl.querySelector('.salenow, .newprice, .saleprice, .newprice');

  const imgPart = img ? img.getAttribute('src') : '';
  const titlePart = title ? title.textContent.trim() : '';
  const pricePart = priceNode ? priceNode.textContent.trim() : '';

  if (!imgPart && !titlePart) {
    return null;
  }

  return imgPart + '|' + titlePart + '|' + pricePart;
}

function toggleHeartVisual(heartBtn, isActive) {
  if (!heartBtn) return;

  heartBtn.classList.toggle('is-favorite', isActive);

  const svg = heartBtn.querySelector('.heart-icon');
  if (!svg) return;

  svg.classList.toggle('is-favorite', isActive);

  const path = svg.querySelector('path');
  if (!path) return;

  if (!path.dataset.defaultPath) {
    path.dataset.defaultPath = path.getAttribute('d') || '';
  }

  const defaultPath = path.dataset.defaultPath;
  const activePath = path.dataset.activePath || HEART_PATH_ACTIVE;

  if (activePath) {
    path.dataset.activePath = activePath;
    path.setAttribute('d', isActive ? activePath : defaultPath);
  }
}

function setupHeartsOnCards(isBookmarksPage) {
  const favorites = loadFavorites();
  const cards = document.querySelectorAll('.salecard, .newcard');

  cards.forEach(card => {
    const heartBtn = card.querySelector('.salewish, .newwish');
    if (!heartBtn) return;

    const id = computeCardId(card);
    if (!id) return;

    card.dataset.favId = id;
    heartBtn.dataset.favId = id;

    const isFav = favorites.some(item => item.id === id);
    toggleHeartVisual(heartBtn, isFav);

    heartBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const current = loadFavorites();
      const index = current.findIndex(item => item.id === id);
      let nowFav;

      if (index === -1) {
        current.push({
          id,
          html: card.outerHTML
        });
        nowFav = true;
      } else {
        current.splice(index, 1);
        nowFav = false;
      }

      saveFavorites(current);
      toggleHeartVisual(heartBtn, nowFav);

      if (isBookmarksPage && !nowFav) {
        const cardEl = heartBtn.closest('.salecard, .newcard');
        if (cardEl) {
          cardEl.remove();
        }

        const grid = document.querySelector('.bookmarks-grid');
        const empty = document.querySelector('.bookmarks-empty');

        if (grid && !grid.querySelector('.salecard, .newcard')) {
          if (empty) {
            empty.style.display = '';
          }
          const list = document.querySelector('.bookmarks-list');
          if (list) {
            list.remove();
          }
        }
      }
    });
  });
}

// favorites.html
function renderFavoritesPage() {
  const section = document.querySelector('.bookmarks');
  if (!section) return;

  const wrap = section.querySelector('.wrap') || section;
  const empty = section.querySelector('.bookmarks-empty');
  const favorites = loadFavorites();

  if (!favorites.length) {
    if (empty) {
      empty.style.display = '';
    }
    return;
  }

  if (empty) {
    empty.style.display = 'none';
  }

  // создаём блок для карточек если его ещё нет
  let list = section.querySelector('.bookmarks-list');
  if (!list) {
    list = document.createElement('div');
    list.className = 'bookmarks-list';
    list.innerHTML = `
      <h1 class="bookmarks-title">ЗАКЛАДКИ</h1>
      <div class="bookmarks-grid"></div>
    `;
    wrap.appendChild(list);
  }

  const grid = list.querySelector('.bookmarks-grid');
  if (!grid) return;

  // вставления карточек
  grid.innerHTML = favorites.map(item => item.html).join('');

  // Избранное (закладки)
  setupHeartsOnCards(true);

  // Клик по карточке
  if (typeof initProductCardLinks === 'function') {
    initProductCardLinks();
  }
}

function initFavorites() {
  const isBookmarksPage = !!document.querySelector('.bookmarks');

  if (isBookmarksPage) {
    renderFavoritesPage();
  } else {
    setupHeartsOnCards(false);
  }
}
