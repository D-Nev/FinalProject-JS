class Product {
  constructor({
                id,
                name,
                price,
                oldPrice = null,
                article = '',
                category = '',
                brand = '',
                sizes = [],
                images = [],
                description = '',
                type = 'generic'
              }) {
    this._id = id;
    this._name = name || '';
    this.price = price;
    this._oldPrice = oldPrice != null ? Number(oldPrice) : null;
    this._article = article;
    this._category = category;
    this._brand = brand;
    this._sizes = Array.isArray(sizes) ? sizes.slice() : [];
    this._images = Array.isArray(images) ? images.slice() : [];
    this._description = description;
    this._type = type;
  }

  // геттери / сеттери
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = String(value || '').trim();
  }

  get price() {
    return this._price;
  }

  set price(value) {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      throw new Error('Некоректна ціна товару');
    }
    this._price = num;
  }

  get oldPrice() {
    return this._oldPrice;
  }

  set oldPrice(value) {
    if (value == null) {
      this._oldPrice = null;
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      throw new Error('Некоректна стара ціна товару');
    }
    this._oldPrice = num;
  }

  get article() {
    return this._article;
  }

  set article(value) {
    this._article = String(value || '').trim();
  }

  get category() {
    return this._category;
  }

  set category(value) {
    this._category = String(value || '').trim();
  }

  get brand() {
    return this._brand;
  }

  set brand(value) {
    this._brand = String(value || '').trim();
  }

  get sizes() {
    return this._sizes.slice();
  }

  set sizes(list) {
    this._sizes = Array.isArray(list) ? list.slice() : [];
  }

  get images() {
    return this._images.slice();
  }

  set images(list) {
    this._images = Array.isArray(list) ? list.slice() : [];
  }

  get description() {
    return this._description;
  }

  set description(value) {
    this._description = String(value || '');
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = String(value || 'generic');
  }

  // методи

  //Форматована ціна
  getDisplayPrice() {
    return this._price.toLocaleString('uk-UA') + ' грн';
  }

  // Короткий опис для картки
  getShortDescription(maxLength = 80) {
    const text = this._description || '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + '…';
  }

  getTypeLabel() {
    return 'Товар';
  }

  // Перетворення у plain-обʼєкт
  toPlain() {
    return {
      id: this._id,
      name: this._name,
      price: this._price,
      oldPrice: this._oldPrice,
      article: this._article,
      category: this._category,
      brand: this._brand,
      sizes: this._sizes.slice(),
      images: this._images.slice(),
      description: this._description,
      type: this._type
    };
  }

  static fromPlain(obj) {
    if (!obj) return null;
    const base = obj.type || obj.category || 'generic';
    if (base === 'clothes' || /одяг|курт/i.test(base)) {
      return new ClothingProduct(obj);
    }
    if (base === 'electronics' || /електрон/i.test(base)) {
      return new ElectronicsProduct(obj);
    }
    return new Product(obj);
  }
}

// Нащадок для одягу
class ClothingProduct extends Product {
  constructor(data) {
    super({ ...data, type: 'clothes' });
    this._materials = data.materials || '';
  }

  get materials() {
    return this._materials;
  }

  set materials(value) {
    this._materials = String(value || '').trim();
  }

  getTypeLabel() {
    return 'Одяг';
  }
}

class ElectronicsProduct extends Product {
  constructor(data) {
    super({ ...data, type: 'electronics' });
    this._warrantyMonths = Number(data.warrantyMonths) || 0;
  }

  get warrantyMonths() {
    return this._warrantyMonths;
  }

  set warrantyMonths(value) {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      throw new Error('Некоректна гарантія');
    }
    this._warrantyMonths = num;
  }

  getTypeLabel() {
    return 'Електроніка';
  }
}

// Категорія товарів
class Category {
  constructor({ id, code, name, parentId = null }) {
    this._id = id;
    this._code = code;
    this._name = name;
    this._parentId = parentId;
  }

  get id() {
    return this._id;
  }

  get code() {
    return this._code;
  }

  set code(value) {
    this._code = String(value || '').trim();
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = String(value || '').trim();
  }

  get parentId() {
    return this._parentId;
  }

  set parentId(value) {
    this._parentId = value != null ? Number(value) : null;
  }

  toPlain() {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      parentId: this._parentId
    };
  }

  static fromPlain(obj) {
    return obj ? new Category(obj) : null;
  }
}

// Позиція у кошику
class CartItem {
  constructor({ productId, name, article, price, oldPrice = null, size = '', img = '', qty = 1 }) {
    this._productId = productId;
    this._name = name || '';
    this._article = article || '';
    this.price = price;
    this._oldPrice = oldPrice != null ? Number(oldPrice) : null;
    this._size = size || '';
    this._img = img || '';
    this.quantity = qty;
  }

  get productId() {
    return this._productId;
  }

  get name() {
    return this._name;
  }

  get article() {
    return this._article;
  }

  get price() {
    return this._price;
  }

  set price(value) {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      throw new Error('Некоректна ціна в кошику');
    }
    this._price = num;
  }

  get oldPrice() {
    return this._oldPrice;
  }

  set oldPrice(value) {
    if (value == null) {
      this._oldPrice = null;
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      throw new Error('Некоректна стара ціна в кошику');
    }
    this._oldPrice = num;
  }

  get size() {
    return this._size;
  }

  set size(value) {
    this._size = String(value || '');
  }

  get img() {
    return this._img;
  }

  set img(value) {
    this._img = String(value || '');
  }

  get quantity() {
    return this._qty;
  }

  set quantity(value) {
    let num = Number(value);
    if (Number.isNaN(num) || num < 1) num = 1;
    if (num > 99) num = 99;
    this._qty = num;
  }

  get lineTotal() {
    return this._price * this._qty;
  }

  toPlain() {
    return {
      id: this._productId,
      name: this._name,
      article: this._article,
      price: this._price,
      oldPrice: this._oldPrice,
      size: this._size,
      img: this._img,
      qty: this._qty
    };
  }

  static fromPlain(obj) {
    if (!obj) return null;
    return new CartItem({
      productId: obj.id,
      name: obj.name,
      article: obj.article,
      price: obj.price,
      oldPrice: obj.oldPrice,
      size: obj.size,
      img: obj.img,
      qty: obj.qty
    });
  }
}

// Кошик
class Cart {
  constructor(items = []) {
    this._items = Array.isArray(items)
      ? items
        .map(it => (it instanceof CartItem ? it : CartItem.fromPlain(it)))
        .filter(Boolean)
      : [];
  }

  get items() {
    return this._items;
  }

  get isEmpty() {
    return this._items.length === 0;
  }

  findItemIndex(productId, size = '') {
    return this._items.findIndex(
      it => it.productId === productId && (it.size || '') === (size || '')
    );
  }

  addItemFromPayload(payload) {
    try {
      if (!payload || !payload.id) {
        throw new Error('Немає id товару');
      }

      const sizeKey = payload.size || '';
      const idx = this.findItemIndex(payload.id, sizeKey);

      if (idx !== -1) {
        // змінюємо кількість
        const current = this._items[idx];
        const delta =
          payload.qty && !Number.isNaN(Number(payload.qty))
            ? Number(payload.qty)
            : 1;
        current.quantity = (current.quantity || 1) + delta;
      } else {
        const item = new CartItem({
          productId: payload.id,
          name: payload.name || '',
          article: payload.article || '',
          price: payload.price,
          oldPrice: payload.oldPrice,
          size: sizeKey,
          img: payload.img || '',
          qty:
            payload.qty && !Number.isNaN(Number(payload.qty))
              ? Number(payload.qty)
              : 1
        });
        this._items.push(item);
      }
    } catch (e) {
      console.error('Помилка при додаванні товару до кошика (Cart):', e);
    }
  }

  changeQuantity(productId, size, qty) {
    const idx = this.findItemIndex(productId, size);
    if (idx === -1) return;
    this._items[idx].quantity = qty;
  }

  removeItem(productId, size) {
    const idx = this.findItemIndex(productId, size);
    if (idx === -1) return;
    this._items.splice(idx, 1);
  }

  clear() {
    this._items = [];
  }

  getTotal() {
    return this._items.reduce((sum, it) => sum + it.lineTotal, 0);
  }

  toPlain() {
    return this._items.map(it => it.toPlain());
  }

  static fromPlain(list) {
    return new Cart(Array.isArray(list) ? list : []);
  }
}

//Замовлення

class Order {
  constructor({ id, items = [], customer, delivery, payment, totals, createdAt }) {
    this._id = id || 'ORD-' + Date.now();
    this._items = Cart.fromPlain(items);
    this._customer = customer || {};
    this._delivery = delivery || {};
    this._payment = payment || {};
    this._totals = totals || {};
    this._createdAt = createdAt || new Date().toISOString();
  }

  get id() {
    return this._id;
  }

  get items() {
    return this._items.items;
  }

  get customer() {
    return this._customer;
  }

  get delivery() {
    return this._delivery;
  }

  get payment() {
    return this._payment;
  }

  get totals() {
    return this._totals;
  }

  get createdAt() {
    return this._createdAt;
  }

  get totalAmount() {
    if (this._totals && typeof this._totals.finalTotal === 'number') {
      return this._totals.finalTotal;
    }
    // fallback на суму з кошика
    return this._items.getTotal();
  }

  toPlain() {
    return {
      id: this._id,
      createdAt: this._createdAt,
      customer: this._customer,
      delivery: this._delivery,
      payment: this._payment,
      totals: this._totals,
      items: this._items.toPlain()
    };
  }

  static fromPlain(obj) {
    return obj ? new Order(obj) : null;
  }
}


window.ShopModels = {
  Product,
  ClothingProduct,
  ElectronicsProduct,
  Category,
  CartItem,
  Cart,
  Order
};
