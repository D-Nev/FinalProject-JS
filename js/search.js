document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.search-overlay');
  const openBtn = document.querySelector('.ico[aria-label="Пошук"]');

  if (!root || !openBtn) return;

  const input = root.querySelector('.search-input');
  const closeBtn = root.querySelector('.search-overlay__close');
  const suggestionsEl = root.querySelector('.search-suggestions');
  const scopeEl = root.querySelector('.search-scope');
  const scopeLabel = root.querySelector('.search-scope-label');
  const scopeOptions = root.querySelectorAll('.search-scope-option');
  const scopeToggle = root.querySelector('.search-scope-toggle');

  let currentScope = 'all';

  const ITEMS = [
    { label: 'Шапка', scope: 'all' },
    { label: 'Шапка зимова', scope: 'all' },
    { label: 'Шапка чоловіча базова', scope: 'men' },
    { label: 'Шапка жіноча базова', scope: 'women' },
    { label: 'Зимова куртка чоловіча', scope: 'men' },
    { label: 'Зимова куртка жіноча', scope: 'women' },
    { label: 'Шкарпетки Staff', scope: 'all' },
    { label: 'Рюкзак міський Staff', scope: 'all' },
    { label: 'Сумка через плече', scope: 'all' },
    { label: 'Флісова кофта', scope: 'all' }
  ];

  function updateScopeUI() {
    if (!scopeLabel || !scopeOptions || !scopeOptions.length) return;

    // обновляем надпись на кнопке
    const currentBtn = Array.from(scopeOptions).find(
      btn => (btn.dataset.scope || 'all') === currentScope
    );
    if (currentBtn) {
      scopeLabel.textContent = currentBtn.textContent.trim();
    }

    scopeOptions.forEach(btn => {
      const sc = btn.dataset.scope || 'all';
      btn.style.display = sc === currentScope ? 'none' : 'block';
    });
  }


  function isOpen() {
    return root.classList.contains('search-overlay--visible');
  }

  function open() {
    root.classList.add('search-overlay--visible');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-open');
    if (input) {
      input.value = '';
      updateSuggestions();
      setTimeout(() => input.focus(), 50);
    }
  }

  function close() {
    root.classList.remove('search-overlay--visible');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-open');
  }

  function getMatches(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ITEMS.filter(item => {
      const inScope =
        currentScope === 'all' ||
        item.scope === 'all' ||
        item.scope === currentScope;
      return inScope && item.label.toLowerCase().includes(q);
    }).slice(0, 10);
  }

  function highlightLabel(label, query) {
    const q = (query || '').trim();
    if (!q) return label;

    const ch = q[0].toLowerCase();
    const lower = label.toLowerCase();
    const idx = lower.indexOf(ch);
    if (idx === -1) return label;

    const before = label.slice(0, idx);
    const match = label.slice(idx, idx + 1);
    const after = label.slice(idx + 1);

    return `${before}<span class="search-suggestion-no-italic">${match}</span>${after}`;
  }

  function updateSuggestions() {
    if (!suggestionsEl || !input) return;
    const query = input.value || '';
    const list = getMatches(query);
    if (!list.length) {
      suggestionsEl.innerHTML = '';
      return;
    }
    suggestionsEl.innerHTML = list
      .map(item => `
        <li class="search-suggestion" data-label="${item.label}">
          <span class="search-suggestion-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#151515" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#151515" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="search-suggestion-text">
            ${highlightLabel(item.label, query)}
          </span>
        </li>
      `)
      .join('');
  }

  // events
  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isOpen()) {
      open();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });
  }

  root.addEventListener('click', (e) => {
    if (e.target === root) {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
    }
  });

  if (input) {
    input.addEventListener('input', updateSuggestions);
  }

  if (suggestionsEl) {
    suggestionsEl.addEventListener('click', (e) => {
      const li = e.target.closest('.search-suggestion');
      if (!li || !input) return;
      input.value = li.dataset.label || li.textContent.trim();
      updateSuggestions();
    });
  }

  if (scopeToggle && scopeEl) {
    scopeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      scopeEl.classList.toggle('search-scope--open');
    });

    document.addEventListener('click', (e) => {
      if (!scopeEl.contains(e.target)) {
        scopeEl.classList.remove('search-scope--open');
      }
    });
  }

  if (scopeOptions && scopeOptions.length) {
    scopeOptions.forEach(btn => {
      btn.addEventListener('click', () => {
        currentScope = btn.dataset.scope || 'all';
        updateScopeUI();
        scopeEl.classList.remove('search-scope--open');
        updateSuggestions();
      });
    });

    updateScopeUI();
  }

  const submitBtn = root.querySelector('.search-submit');
  if (submitBtn && input) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSuggestions();
    });
  }
});
