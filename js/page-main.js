document.addEventListener('DOMContentLoaded', () => {
  // активный пункт меню в хедере
  const navlinks = document.querySelectorAll('.navlink');
  navlinks.forEach(a => {
    a.addEventListener('click', () => {
      navlinks.forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    });
  });

  // DEMO fetch + Promise (доделать)
  if (window.fetch) {
    fetch('https://dummyjson.com/products?limit=4')
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP помилка ' + response.status);
        }
        return response.json();
      })
      .then(json => {
        console.log('Demo-товари з сервера (fetch + Promise):', json);

        try {
          localStorage.setItem('server_demo_products', JSON.stringify(json));
        } catch (e) {
          console.warn(
            'Не вдалося зберегти demo-товари з сервера в localStorage',
            e
          );
        }
      })
      .catch(error => {
        console.error('Помилка при завантаженні demo-товарів з сервера:', error);
      });
  }

  // базовый слайдер
  class Slider {
    constructor({ vp, tr, prev, next, cssVar }) {
      this.vp = vp;
      this.tr = tr;
      this.prev = prev;
      this.next = next;
      this.cssVar = cssVar;
      this.i = 0;

      this.nextH = this.nextH.bind(this);
      this.prevH = this.prevH.bind(this);
      this.resizeH = this.resizeH.bind(this);

      if (this.next) this.next.addEventListener('click', this.nextH);
      if (this.prev) this.prev.addEventListener('click', this.prevH);
      window.addEventListener('resize', this.resizeH);

      this.update();
    }

    perView() {
      return 1;
    }

    pages() {
      if (!this.tr) return 1;
      const pv = this.perView();
      const total = this.tr.children.length;
      return pv > 0 ? Math.max(1, Math.ceil(total / pv)) : 1;
    }

    update() {
      if (!this.vp || !this.tr) return;

      const items = Array.from(this.tr.children);
      if (!items.length) return;

      const pv = this.perView();
      const pages = this.pages();

      this.i = Math.min(Math.max(this.i, 0), pages - 1);

      const maxFirstIndex = Math.max(0, items.length - pv);
      const firstIndex = Math.min(this.i * pv, maxFirstIndex);

      const firstEl = items[firstIndex];
      const offset = firstEl ? firstEl.offsetLeft : 0;

      this.tr.style.transform = `translate3d(${-offset}px,0,0)`;
    }

    nextH() {
      this.i = (this.i + 1) % this.pages();
      this.update();
    }

    prevH() {
      this.i = (this.i - 1 + this.pages()) % this.pages();
      this.update();
    }

    resizeH() {
      this.i = Math.min(this.i, this.pages() - 1);
      this.update();
    }
  }

  // LOOKS и SALE
  class Looks extends Slider {
    perView() {
      const val = getComputedStyle(this.vp).getPropertyValue('--looks-per-view').trim();
      return Math.max(1, parseInt(val || '3', 10));
    }
  }

  class Sale extends Slider {
    perView() {
      const val = getComputedStyle(this.vp).getPropertyValue('--sale-per-view').trim();
      return Math.max(1, parseInt(val || '4', 10));
    }
  }

  // Инициализация слайдеров
  new Looks({
    vp:   document.querySelector('#looks .looksvp'),
    tr:   document.querySelector('#looks .lookstr'),
    prev: document.querySelector('#looks .looksprev'),
    next: document.querySelector('#looks .looksnext'),
    cssVar: '--looks-per-view'
  });

  new Sale({
    vp:   document.querySelector('#sale .salevp'),
    tr:   document.querySelector('#sale .saletr'),
    prev: document.querySelector('#sale .saleprev'),
    next: document.querySelector('#sale .salenext'),
    cssVar: '--sale-per-view'
  });

  // Ховер-эффекты карточек
  class Card {
    constructor(root) {
      this.root = root;
      this.img = root.querySelector('img');
      this.enter = this.enter.bind(this);
      this.leave = this.leave.bind(this);
      root.addEventListener('mouseenter', this.enter);
      root.addEventListener('mouseleave', this.leave);
    }
    enter() {
      if (this.img) this.img.style.transform = 'scale(1.03)';
    }
    leave() {
      if (this.img) this.img.style.transform = '';
    }
  }

  class ProdCard extends Card {
    enter() {
      if (this.img) {
        this.img.style.transition = 'transform .35s ease';
        this.img.style.transform = 'scale(1.06)';
      }
    }
    leave() {
      if (this.img) this.img.style.transform = '';
    }
  }

  document.querySelectorAll('.lookcard').forEach(el => new Card(el));
  document.querySelectorAll('.salecard, .newcard').forEach(el => new ProdCard(el));

  const masthead = document.querySelector('.masthead');
  const hero = document.querySelector('.hero');
  const toTop = document.querySelector('.to-top');

  const updateBodyOffset = () => {
    if (!masthead) return;
    document.body.style.paddingTop = masthead.offsetHeight + 'px';
  };
  updateBodyOffset();
  window.addEventListener('resize', updateBodyOffset);

  let heroEnd = 0;
  const recalcHero = () => {
    if (!hero) {
      heroEnd = 0;
      return;
    }
    const rect = hero.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    heroEnd = rect.top + scrollTop + rect.height;
  };
  recalcHero();
  window.addEventListener('load', recalcHero);
  window.addEventListener('resize', recalcHero);

  let lastY = window.pageYOffset || document.documentElement.scrollTop;

  const onScroll = () => {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    const delta = Math.abs(y - lastY);
    const scrollingDown = y > lastY;

    if (masthead) {
      if (y <= 0) {
        masthead.classList.remove('masthead--hidden');
      } else if (delta > 5) {
        if (scrollingDown) {
          masthead.classList.add('masthead--hidden');
        } else {
          masthead.classList.remove('masthead--hidden');
        }
      }
    }

    if (toTop && heroEnd) {
      if (y > heroEnd) {
        toTop.classList.add('to-top--visible');
      } else {
        toTop.classList.remove('to-top--visible');
      }
    }

    lastY = y;
  };

  window.addEventListener('scroll', onScroll);

  if (toTop) {
    const goTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    toTop.addEventListener('click', goTop);
    toTop.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goTop();
      }
    });
  }
});
