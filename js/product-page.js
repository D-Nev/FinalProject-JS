let CURRENT_PRODUCT = null;
let CURRENT_IMAGE_INDEX = 0;

const PRODUCTS = [
  {
    id: "staff-gray-black-fur",
    name: "Зимові кросівки Staff gray & black (хутро)",
    price: 2700,
    oldPrice: 3400,
    article: "MS0258-1",
    category: "Зимове взуття",
    brand: "STAFF",
    sizes: ["40","41","42","43","44","45","46"],
    images: [
      "../assets/product/staff-gray-black-fur/75305b76ba2e4fe799bebbd20e56f8c1.jpeg",
      "../assets/product/staff-gray-black-fur/ed70f196489b4f1a9ddfbac6401fd08a.jpeg",
      "../assets/product/staff-gray-black-fur/41d3cb921d3c4fa89cf251e174835d94.jpeg",
      "../assets/product/staff-gray-black-fur/fb31f01a49914f3fabb2ac3a8ccdda2c.jpeg",
      "../assets/product/staff-gray-black-fur/9898157aa6b74fc999a8e6bbd73ba5cd.jpeg"
    ],
    descriptionHtml: `
      <p>
        Кросівки, що чудово пасуватимуть до одягу в будь-якому стилі та забезпечать
        надійне зчеплення навіть із мокрою чи слизькою поверхнею. А м'яка устілка з
        приємного на дотик екохутра даруватиме комфорт під час тривалих прогулянок.
      </p>

      <p><strong>Матеріал:</strong></p>
      <ul class="product-desc-list">
        <li>натуральний нубук;</li>
        <li>всередину вшите якісне екохутро;</li>
        <li>підошва із поліуретану та матеріалу Eva легка, зносостійка і забезпечує чудове зчеплення.</li>
      </ul>
    `
  },
  {
    id: "Staff-all-brown",
    name: "Зимові кросівки Staff all brown",
    price: 2770,
    oldPrice: 3470,
    article: "MS0258-1",
    category: "Зимове взуття",
    brand: "STAFF",
    sizes: ["40","41","42","43","44","45"],
    images: [
      "../assets/sale/68cda9fe9ff84f7c981df4db202ba8c8.jpeg",
      "../assets/sale/4d44b3ed2f214f81a30c69c69329c62f.jpeg"
    ],
    descriptionHtml: `
      <p>
        Кросівки, що чудово пасуватимуть до одягу в будь-якому стилі та забезпечать
        надійне зчеплення навіть із мокрою чи слизькою поверхнею. А м'яка устілка з
        приємного на дотик екохутра даруватиме комфорт під час тривалих прогулянок.
      </p>

      <p><strong>Матеріал:</strong></p>
      <ul class="product-desc-list">
        <li>натуральний нубук;</li>
        <li>всередину вшите якісне екохутро;</li>
        <li>підошва із поліуретану та матеріалу Eva легка, зносостійка і забезпечує чудове зчеплення.</li>
      </ul>
    `
  }
];

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function findProductById(id) {
  if (!id) return null;
  return PRODUCTS.find(p => p.id === id) || null;
}

function formatPrice(value) {
  if (value == null) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return value + " грн.";
  return num.toLocaleString("uk-UA") + " грн.";
}

function renderProduct(product) {
  if (!product) return;

  const nameEl = document.querySelector('[data-field="name"]');
  const articleEl = document.querySelector('[data-field="article"]');
  const categoryEl = document.querySelector('[data-field="category"]');
  const brandEl = document.querySelector('[data-field="brand"]');
  const priceEl = document.querySelector('[data-field="price"]');
  const oldPriceEl = document.querySelector('[data-field="oldPrice"]');
  const mainImgEl = document.querySelector('[data-field="mainImage"]');
  const sizesEl = document.querySelector('[data-field="sizes"]');
  const descEl = document.querySelector('[data-field="description"]');
  const breadcrumbsNav = document.querySelector(".product-breadcrumbs");
  const thumbsContainer = document.querySelector(".product-thumbs");

  // Назва
  if (nameEl) {
    nameEl.innerHTML = product.name.replace(/\n/g, "<br>");
  }

  // Артикул / категорія / бренд
  if (articleEl) {
    articleEl.textContent = product.article || "";
  }
  if (categoryEl) {
    categoryEl.textContent = product.category || "";
  }
  if (brandEl) {
    brandEl.textContent = product.brand || "";
  }

  // Ціна
  if (priceEl) {
    priceEl.textContent = formatPrice(product.price);
  }

  if (oldPriceEl) {
    if (product.oldPrice) {
      oldPriceEl.textContent = formatPrice(product.oldPrice);
      oldPriceEl.style.display = "";
    } else {
      oldPriceEl.style.display = "none";
    }
  }

  // Міні-фото зліва
  if (thumbsContainer) {
    thumbsContainer.innerHTML = "";

    (product.images || []).forEach((src, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "product-thumb" + (index === 0 ? " product-thumb--active" : "");

      const img = document.createElement("img");
      img.src = src;
      img.alt = product.name;

      btn.appendChild(img);
      thumbsContainer.appendChild(btn);
    });
  }

  // Головне фото
  if (mainImgEl) {
    const firstImg = product.images && product.images.length > 0 ? product.images[0] : "";
    if (firstImg) {
      mainImgEl.src = firstImg;
    }
    mainImgEl.alt = product.name || "";
  }

  // Купити в один клік
  const oneClickBtn = document.querySelector(".product-buy-one-click[data-order-open]");
  if (oneClickBtn) {
    oneClickBtn.dataset.productId = product.id || "";
    oneClickBtn.dataset.productName = product.name || "";
    oneClickBtn.dataset.productPrice =
      product.price != null ? String(product.price) : "";

    if (!product.sizes || !product.sizes.length) {
      oneClickBtn.dataset.productSize = "Універсальний";
    } else {
      oneClickBtn.dataset.productSize = "";
    }

    // Фото (швидке замовлення)
    const firstImg =
      Array.isArray(product.images) && product.images.length
        ? product.images[0]
        : "";
    if (firstImg) {
      oneClickBtn.dataset.productImg = firstImg;
    }
  }

  // Розміри
  if (sizesEl) {
    sizesEl.innerHTML = "";

    (product.sizes || []).forEach((size) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "product-size-btn"; // по дефолту БЕЗ активного
      btn.textContent = size;
      sizesEl.appendChild(btn);
    });
  }

  // Опис
  if (descEl) {
    if (product.descriptionHtml) {
      descEl.innerHTML = product.descriptionHtml;
    } else if (product.description) {
      descEl.textContent = product.description;
    }
  }

  if (breadcrumbsNav && Array.isArray(product.breadcrumbs)) {
    breadcrumbsNav.innerHTML = "";

    product.breadcrumbs.forEach((crumb, index) => {
      const sep = document.createElement("span");
      sep.className = "product-breadcrumb-sep";
      sep.textContent = "/";

      if (index < product.breadcrumbs.length - 1) {
        const a = document.createElement("a");
        a.href = "#";
        a.className = "product-breadcrumb";
        a.textContent = crumb;
        breadcrumbsNav.appendChild(a);
      } else {
        const span = document.createElement("span");
        span.className = "product-breadcrumb product-breadcrumb--current";
        span.textContent = crumb;
        breadcrumbsNav.appendChild(span);
      }

      if (index < product.breadcrumbs.length - 1) {
        breadcrumbsNav.appendChild(sep);
      }
    });
  }
}

function initProductPage() {
  const pageContainer = document.querySelector(".product-page");
  if (!pageContainer) return;

  const id = getProductIdFromUrl();
  if (!id) {
    pageContainer.innerHTML = "<p>Товар не знайдено (нема id в URL).</p>";
    return;
  }

  const product = findProductById(id);
  if (!product) {
    pageContainer.innerHTML = "<p>Товар не знайдено в базі.</p>";
    return;
  }

  CURRENT_PRODUCT = product;
  renderProduct(product);
}

function initProductImageGallery() {
  const mainImgEl = document.querySelector('[data-field="mainImage"]');
  const thumbsContainer = document.querySelector(".product-thumbs");
  const prevBtn = document.querySelector(".product-main-arrow--prev");
  const nextBtn = document.querySelector(".product-main-arrow--next");
  const mainWrapper = document.querySelector(".product-main-image");

  // Страница не product или товара нет = выходим
  if (!mainImgEl || !thumbsContainer || !CURRENT_PRODUCT || !Array.isArray(CURRENT_PRODUCT.images)) {
    return;
  }

  const images = CURRENT_PRODUCT.images.slice();
  if (!images.length) return;

  function updateView(index) {
    if (!images.length) return;

    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    CURRENT_IMAGE_INDEX = index;

    mainImgEl.src = images[CURRENT_IMAGE_INDEX];

    // Подсветка активного превью
    const allThumbs = Array.from(thumbsContainer.querySelectorAll(".product-thumb"));
    allThumbs.forEach((btn, idx) => {
      btn.classList.toggle("product-thumb--active", idx === CURRENT_IMAGE_INDEX);
    });
  }

  // Клик по мини-фото
  thumbsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-thumb");
    if (!btn) return;

    const allThumbs = Array.from(thumbsContainer.querySelectorAll(".product-thumb"));
    const index = allThumbs.indexOf(btn);
    if (index === -1) return;

    updateView(index);
  });

  // Стрелка влево
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      updateView(CURRENT_IMAGE_INDEX - 1);
    });
  }

  // Стрелка вправо
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      updateView(CURRENT_IMAGE_INDEX + 1);
    });
  }

  // Зум по клику
  if (mainWrapper) {
    mainWrapper.addEventListener("click", (e) => {
      if (e.target.closest(".product-main-arrow")) return;

      mainImgEl.classList.toggle("product-img-zoom");
    });
  }

  updateView(0);
}

// ID
function computeCardIdForProduct(cardEl) {
  if (!cardEl) return null;

  // data-product-id він головний (якщо в картці явно прописаний)
  const explicit = cardEl.dataset.productId;
  if (explicit) return explicit;

  const img = cardEl.querySelector("img");
  const title = cardEl.querySelector(".salename, .newname, h3");
  const priceNode = cardEl.querySelector(".salenow, .newprice, .saleprice, .newprice");

  const imgPart = img ? img.getAttribute("src") : "";
  const titlePart = title ? title.textContent.trim() : "";
  const pricePart = priceNode ? priceNode.textContent.trim() : "";

  if (!imgPart && !titlePart) return null;

  return imgPart + "|" + titlePart + "|" + pricePart;
}

// Переходи з карток на product.html
function initProductCardLinks() {
  const cards = document.querySelectorAll(".salecard, .newcard");
  if (!cards.length) return;

  cards.forEach(card => {
    if (card.dataset.productLinkInited === "1") return;
    card.dataset.productLinkInited = "1";

    card.addEventListener("click", (e) => {
      if (e.target.closest(".salewish, .newwish")) return;

      const id = computeCardIdForProduct(card);
      if (!id) return;

      try {
        sessionStorage.setItem("product-card-html-" + id, card.outerHTML);
      } catch (err) {
        console.warn("Не вдалося зберегти HTML картки в sessionStorage", err);
      }

      const url = new URL("product.html", window.location.href);
      url.searchParams.set("id", id);
      window.location.href = url.toString();
    });
  });
}

// Вибір розміру
function initProductSizeSelection() {
  const sizesContainer =
    document.querySelector('[data-field="sizes"]') ||
    document.querySelector(".product-size-list");

  if (!sizesContainer) return;

  sizesContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-size-btn");
    if (!btn) return;

    const all = sizesContainer.querySelectorAll(".product-size-btn");
    all.forEach((b) => b.classList.remove("product-size-btn--active"));
    btn.classList.add("product-size-btn--active");

    // Купити в один клік
    const oneClickBtn = document.querySelector(".product-buy-one-click[data-order-open]");
    if (oneClickBtn) {
      oneClickBtn.dataset.productSize = btn.textContent.trim();
    }
  });
}

// Сердечко
function initProductPageFavoriteHeart() {
  const favBtn = document.querySelector(".product-fav");
  if (!favBtn) return;

  // fun from app.js
  if (typeof loadFavorites !== "function" ||
    typeof saveFavorites !== "function") {
    return;
  }

  const id = getProductIdFromUrl();
  if (!id) return;

  const product = findProductById(id);
  if (!product) return;

  let favorites = loadFavorites();
  let index = favorites.findIndex(item => item.id === id);
  let isFav = index !== -1;

  if (typeof toggleHeartVisual === "function") {
    toggleHeartVisual(favBtn, isFav);
  } else {
    favBtn.classList.toggle("is-favorite", isFav);
  }

  favBtn.addEventListener("click", (e) => {
    e.preventDefault();

    favorites = loadFavorites();
    index = favorites.findIndex(item => item.id === id);
    let nowFav;

    if (index === -1) {
      // додавання в закладки
      let html = null;
      try {
        html = sessionStorage.getItem("product-card-html-" + id);
      } catch (err) {
        html = null;
      }

      if (!html) {
        console.warn("Немає HTML картки в sessionStorage для id:", id);
        return;
      }

      favorites.push({ id, html });
      nowFav = true;
    } else {

      favorites.splice(index, 1);
      nowFav = false;
    }

    saveFavorites(favorites);

    if (typeof toggleHeartVisual === "function") {
      toggleHeartVisual(favBtn, nowFav);
    } else {
      favBtn.classList.toggle("is-favorite", nowFav);
    }
  });
}

// Товар додано у кошик (product.html)
function initAddToCartPopup() {
  const addToCartBtn = document.querySelector(".product-add-to-cart");
  const successPopup = document.getElementById("cartPopup");
  const errorPopup = document.getElementById("sizeErrorPopup");

  if (!addToCartBtn || !successPopup) return;

  const successContinueBtn = successPopup.querySelector(".cart-popup__continue");
  const errorContinueBtn = errorPopup ? errorPopup.querySelector(".cart-popup__continue") : null;

  function openPopup(popup) {
    if (!popup) return;
    popup.classList.add("cart-popup--visible");
    popup.setAttribute("aria-hidden", "false");
  }

  function closePopup(popup) {
    if (!popup) return;
    popup.classList.remove("cart-popup--visible");
    popup.setAttribute("aria-hidden", "true");
  }

  // ДОДАТИ В КОШИК
  addToCartBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const sizesContainer = document.querySelector('[data-field="sizes"], .product-size-list');
    const sizeButtons = sizesContainer ? sizesContainer.querySelectorAll(".product-size-btn") : null;
    const hasSizes = sizeButtons && sizeButtons.length > 0;

    let selectedSize = "";

    if (hasSizes) {
      const active = sizesContainer.querySelector(".product-size-btn--active");

      if (!active) {
        if (errorPopup) openPopup(errorPopup);
        return;
      }

      selectedSize = active.textContent.trim();
    } else {
      selectedSize = "Універсальний";
    }

    if (typeof addToCart === "function" && CURRENT_PRODUCT) {
      const firstImg =
        Array.isArray(CURRENT_PRODUCT.images) && CURRENT_PRODUCT.images.length
          ? CURRENT_PRODUCT.images[0]
          : "";

      addToCart({
        id: CURRENT_PRODUCT.id,
        name: CURRENT_PRODUCT.name,
        article: CURRENT_PRODUCT.article,
        price: CURRENT_PRODUCT.price,
        oldPrice: CURRENT_PRODUCT.oldPrice || null,
        size: selectedSize,
        img: firstImg,
        qty: 1,
      });
    }

    openPopup(successPopup);
  });


  // ПРОДОВЖИТИ (успішно)
  if (successContinueBtn) {
    successContinueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closePopup(successPopup);
    });
  }

  // ПРОДОВЖИТИ (помилка)
  if (errorContinueBtn) {
    errorContinueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closePopup(errorPopup);
    });
  }

  [successPopup, errorPopup].forEach((popup) => {
    if (!popup) return;
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopup(popup);
    });
  });

  // Esc
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    [successPopup, errorPopup].forEach((popup) => {
      if (popup && popup.classList.contains("cart-popup--visible")) {
        closePopup(popup);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initProductPage();            //Загрузка товара и Dom
  initProductImageGallery();    //Галерея и зум
  initProductCardLinks();
  initProductPageFavoriteHeart();
  initProductSizeSelection();
  initAddToCartPopup();
});
