(() => {
  const lang = () => localStorage.getItem('dr_lang') === 'en' ? 'en' : 'ar';
  const isEnglish = () => lang() === 'en';
  const validEnglish = value => {
    const text = String(value ?? '').trim();
    return text && text !== '*' ? text : '';
  };
  const productName = product => isEnglish()
    ? (validEnglish(product?.en) || String(product?.ar ?? ''))
    : String(product?.ar ?? '');
  const categoryNames = {
    'بقلاوات': 'Baklava',
    'قشاطي': 'Cream sweets',
    'كنافة': 'Kunafa',
    'نواشف': 'Dry sweets',
    'بوظة': 'Ice cream',
    'هدايا داما روز': 'Dama Rose gifts'
  };
  const categoryName = value => isEnglish() ? (categoryNames[value] || value) : value;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const variants = product => (Array.isArray(product?.variants) ? product.variants : [])
    .filter(item => item && String(item.size ?? '').trim() && Number.isFinite(Number(item.price)));
  const minPrice = product => {
    const prices = variants(product).map(item => Number(item.price));
    return prices.length ? Math.min(...prices) : 0;
  };
  const money = value => `${Number(value || 0).toFixed(3)} ${isEnglish() ? 'OMR' : 'ر.ع'}`;
  const safeImageUrl = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^data:image\/(?:png|jpe?g|webp|gif|avif);base64,/i.test(raw)) return raw;
    try {
      const url = new URL(raw, location.origin);
      if (!['https:', 'http:'].includes(url.protocol)) return '';
      return url.href;
    } catch {
      return '';
    }
  };
  const safeHttpsUrl = value => {
    try {
      const url = new URL(String(value || '').trim());
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };
  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  };
  const mediaPreviewEnabled = () => new URLSearchParams(location.search).get('mediaPreview') === '1';
  const mediaDraft = () => {
    const value = readJson('damaRoseMediaDraft', {});
    return value && typeof value === 'object' ? value : {};
  };
  const mergeSettings = settings => {
    const base = settings && typeof settings === 'object' ? { ...settings } : {};
    if (!mediaPreviewEnabled()) return base;
    const draft = mediaDraft().settings || {};
    Object.entries(draft).forEach(([key, value]) => {
      if (value?.hidden) base[key] = '';
      else if (value?.src) base[key] = value.src;
      if (value?.position) base[`${key}_position`] = value.position;
      if (value?.zoom) base[`${key}_zoom`] = value.zoom;
      if (value?.alt) base[`${key}_alt`] = value.alt;
    });
    return base;
  };
  const mergeProducts = products => {
    const list = Array.isArray(products) ? products.map(product => ({ ...product })) : [];
    if (!mediaPreviewEnabled()) return list;
    const draft = mediaDraft().products || {};
    return list.map(product => draft[product.id]?.hidden ? { ...product, image: '' } : ({ ...product, image: draft[product.id]?.src || product.image }));
  };
  const cart = () => {
    const value = readJson('damaRoseCart', []);
    return Array.isArray(value) ? value : [];
  };
  const cartUnits = () => cart().reduce((sum, item) => sum + Math.max(0, Number(item?.quantity) || 0), 0);
  const updateCartBadge = () => {
    const count = cartUnits();
    document.querySelectorAll('#cartBadge,[data-cart-badge]').forEach(node => { node.textContent = String(count); });
    return count;
  };
  const cleanWhatsApp = value => {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.length === 8) digits = `968${digits}`;
    return /^\d{8,15}$/.test(digits) ? digits : '';
  };
  const cachedSettings = () => {
    const value = readJson('damaRoseSettings', {});
    return mergeSettings(value && typeof value === 'object' && !Array.isArray(value) ? value : {});
  };

  function showToast(message) {
    let toast = document.getElementById('drGlobalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'drGlobalToast';
      toast.className = 'dr-global-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function addToCart(product, option, quantity = 1) {
    if (!product || !option) return false;
    const items = cart().map(item => ({ ...item }));
    const key = `${String(product.id)}|${String(option.size)}`;
    const existing = items.find(item => String(item.productId) === String(product.id) && String(item.option) === String(option.size));
    if (existing) existing.quantity = Math.max(1, Number(existing.quantity) || 1) + Math.max(1, Number(quantity) || 1);
    else {
      const image = safeImageUrl(product.image);
      items.push({
      key,
      productId: String(product.id),
      name: String(product.ar || ''),
      nameEn: validEnglish(product.en),
      option: String(option.size || ''),
      price: Number(option.price) || 0,
      quantity: Math.max(1, Number(quantity) || 1),
      image: image.startsWith('data:') ? '' : image
      });
    }
    try {
      localStorage.setItem('damaRoseCart', JSON.stringify(items));
      updateCartBadge();
      showToast(isEnglish() ? 'Added to cart' : 'تمت الإضافة إلى السلة');
      return true;
    } catch {
      showToast(isEnglish() ? 'The cart could not be saved.' : 'تعذر حفظ السلة.');
      return false;
    }
  }

  function openImageLightbox(image, alt) {
    const source = safeImageUrl(image);
    if (!source) return;
    let modal = document.getElementById('drImageLightbox');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'drImageLightbox';
      modal.className = 'dr-lightbox';
      modal.innerHTML = '<button type="button" class="dr-lightbox-close" aria-label="إغلاق">×</button><img alt="">';
      modal.addEventListener('click', event => { if (event.target === modal || event.target.closest('.dr-lightbox-close')) modal.classList.remove('open'); });
      document.addEventListener('keydown', event => { if (event.key === 'Escape') modal.classList.remove('open'); });
      document.body.append(modal);
    }
    const img = modal.querySelector('img');
    img.src = source;
    img.alt = alt || '';
    modal.classList.add('open');
  }

  function createProductCard(product, className = 'card') {
    const article = document.createElement('article');
    article.className = `${className} dr-product-card`;
    const imageLink = document.createElement('button');
    imageLink.type = 'button';
    imageLink.className = 'dr-product-image';
    imageLink.setAttribute('aria-label', isEnglish() ? `Enlarge image: ${productName(product)}` : `تكبير صورة: ${productName(product)}`);
    const image = safeImageUrl(product?.image);
    if (image) {
      const img = document.createElement('img');
      img.src = image;
      img.alt = productName(product);
      img.loading = 'lazy';
      img.decoding = 'async';
      imageLink.append(img);
      imageLink.addEventListener('click', () => openImageLightbox(image, productName(product)));
    } else {
      imageLink.classList.add('is-empty');
      imageLink.textContent = isEnglish() ? 'Product image' : 'صورة المنتج';
      imageLink.disabled = true;
    }
    const body = document.createElement('div');
    body.className = 'card-body';
    const titleLink = document.createElement('a');
    titleLink.className = 'name dr-product-name';
    titleLink.href = `product.html?id=${encodeURIComponent(String(product?.id ?? ''))}`;
    titleLink.textContent = productName(product);
    const price = document.createElement('div');
    price.className = 'price dr-product-price';
    const productVariants = variants(product);
    const selected = productVariants[0];
    price.textContent = selected ? money(selected.price) : `${isEnglish() ? 'From' : 'ابتداءً من'} ${money(minPrice(product))}`;
    const foot = document.createElement('div');
    foot.className = 'card-foot dr-card-actions';
    if (productVariants.length) {
      const select = document.createElement('select');
      select.className = 'dr-size-select';
      select.setAttribute('aria-label', isEnglish() ? 'Choose size' : 'اختر الحجم');
      productVariants.forEach((option, index) => {
        const element = document.createElement('option');
        element.value = String(index);
        element.textContent = `${option.size} · ${money(option.price)}`;
        select.append(element);
      });
      select.addEventListener('change', () => { price.textContent = money(productVariants[Number(select.value)]?.price); });
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'add dr-add-cart';
      add.textContent = isEnglish() ? 'Add to cart' : 'أضف إلى السلة';
      add.addEventListener('click', () => addToCart(product, productVariants[Number(select.value)] || productVariants[0], 1));
      foot.append(select, add);
    } else {
      const view = document.createElement('a');
      view.className = 'add dr-add-cart';
      view.href = titleLink.href;
      view.textContent = isEnglish() ? 'View product' : 'عرض المنتج';
      foot.append(view);
    }
    body.append(titleLink, price, foot);
    article.append(imageLink, body);
    return article;
  }
  const replaceProductCards = (container, products, className = 'card') => {
    container.replaceChildren(...products.map(product => createProductCard(product, className)));
  };
  function applyShellSettings(settings = {}) {
    settings = mergeSettings(settings);
    const number = cleanWhatsApp(settings.whatsapp || '92415565');
    const shortNumber = number.startsWith('968') ? number.slice(3) : number;
    const address = String(settings.address || '').trim() || 'سلطنة عمان – مسقط – شارع 18 نوفمبر – مقابل ستاربكس';
    document.querySelectorAll('[data-shell-address],#footerAddress').forEach(element => { element.textContent = address; });
    document.querySelectorAll('[data-shell-whatsapp],#footerWhatsapp').forEach(element => {
      if (number) element.href = `https://wa.me/${number}`;
      if (element.hasAttribute('data-whatsapp-label')) element.textContent = `${isEnglish() ? 'WhatsApp' : 'واتساب'}: ${shortNumber}`;
    });
    const logo = safeImageUrl(settings.logo_image) || '/logo.png';
    document.querySelectorAll('[data-shell-logo]').forEach(element => {
      element.src = logo;
      element.alt = String(settings.logo_image_alt || 'Dama Rose');
    });
    const cssUrl = value => `url("${value.replace(/["\\\n\r]/g, encodeURIComponent)}")`;
    const headerImage = safeImageUrl(settings.header_background_image);
    const footerImage = safeImageUrl(settings.footer_background_image);
    const header = document.querySelector('.dr-site-header');
    const footer = document.querySelector('.dr-site-footer');
    if (header) header.style.backgroundImage = headerImage ? `linear-gradient(rgba(7,42,34,.9),rgba(7,42,34,.94)),${cssUrl(headerImage)}` : '';
    if (footer) footer.style.backgroundImage = footerImage ? `linear-gradient(rgba(6,37,30,.92),rgba(6,37,30,.96)),${cssUrl(footerImage)}` : '';
    const path = location.pathname;
    const coverKey = path.includes('about') ? 'about_cover_image'
      : path.includes('contact') ? 'contact_cover_image'
      : path.includes('offers') ? 'offers_cover_image'
      : path.includes('gifts') ? 'gifts_cover_image' : '';
    const cover = coverKey ? safeImageUrl(settings[coverKey]) : '';
    const hero = document.querySelector('.hero:not(#home)');
    if (hero && cover) {
      hero.style.backgroundImage = `linear-gradient(110deg,rgba(7,42,34,.9),rgba(12,55,48,.72)),${cssUrl(cover)}`;
      hero.style.backgroundPosition = settings[`${coverKey}_position`] || 'center';
      hero.style.backgroundSize = `${Math.max(100, Number(settings[`${coverKey}_zoom`]) || 100)}% auto`;
    }
    const offerBanner = document.querySelector('.offer-banner');
    const offerImage = safeImageUrl(settings.home_offer_banner);
    if (offerBanner && offerImage) offerBanner.style.backgroundImage = `linear-gradient(110deg,rgba(12,55,48,.97),rgba(32,80,68,.7)),${cssUrl(offerImage)}`;
    const giftBanner = document.querySelector('.gift-banner');
    const giftImage = safeImageUrl(settings.home_gifts_banner || settings.category_image_gifts);
    if (giftBanner && giftImage) giftBanner.style.setProperty('--gift-image', cssUrl(giftImage));
  }
  function renderShell() {
    if (document.body?.dataset?.noShell === 'true') return;
    const english = isEnglish();
    const path = location.pathname;
    const homeHref = path === '/' || path.endsWith('/index.html') ? '#home' : '/#home';
    const productsHref = path === '/' || path.endsWith('/index.html') ? '#products' : '/#products';
    const active = key => {
      if (key === 'home') return path === '/' || path.endsWith('/index.html');
      return path.includes(key);
    };
    const navItems = [
      ['home', homeHref, english ? 'Home' : 'الرئيسية'],
      ['product', productsHref, english ? 'Products' : 'المنتجات'],
      ['offers', '/offers.html', english ? 'Offers' : 'العروض'],
      ['about', '/about.html', english ? 'About us' : 'من نحن'],
      ['contact', '/contact.html', english ? 'Contact us' : 'تواصل معنا']
    ];
    const extraItems = [
      ['/menu.html', english ? 'Menu & prices' : 'المنيو والأسعار'],
      ['/bestsellers.html', english ? 'Best sellers' : 'الأكثر مبيعًا'],
      ['/gifts.html', english ? 'Dama Rose gifts' : 'هدايا داما روز'],
      ['/custom-order.html', english ? 'Custom order' : 'تخصيص طلب']
    ];
    const navMarkup = navItems.map(([key, href, label]) => `<a${active(key) ? ' class="active"' : ''} href="${href}">${label}</a>`).join('');
    const header = document.createElement('header');
    header.className = 'dr-site-header';
    header.innerHTML = `<div class="dr-header-inner"><a class="dr-brand" href="/" aria-label="Dama Rose"><img data-shell-logo src="/logo.png" alt="Dama Rose"></a><nav class="dr-desktop-nav" aria-label="${english ? 'Main navigation' : 'التنقل الرئيسي'}">${navMarkup}</nav><div class="dr-header-tools"><a class="lang dr-lang" href="#">${english ? 'AR | EN' : 'AR | EN'}</a><a class="dr-cart" href="/cart.html" aria-label="${english ? 'Cart' : 'السلة'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5h2l1.7 9.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L20.5 8H6.1"/><path d="M9.5 19.5h.01M17.5 19.5h.01"/></svg><span class="badge" id="cartBadge" data-cart-badge>0</span></a><button class="dr-menu-toggle" type="button" aria-label="${english ? 'Open menu' : 'فتح القائمة'}" aria-expanded="false"><span></span><span></span><span></span></button></div></div><div class="dr-mobile-nav"><nav>${navMarkup}${extraItems.map(([href,label])=>`<a href="${href}">${label}</a>`).join('')}</nav></div>`;
    const oldHeader = document.querySelector('body > header, body > .topbar');
    if (oldHeader) oldHeader.replaceWith(header); else document.body.prepend(header);
    const langLink = header.querySelector('.dr-lang');
    langLink.addEventListener('click', event => {
      event.preventDefault();
      localStorage.setItem('dr_lang', english ? 'ar' : 'en');
      location.reload();
    });
    const toggle = header.querySelector('.dr-menu-toggle');
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.dr-mobile-nav a').forEach(link => link.addEventListener('click', () => header.classList.remove('menu-open')));
    const settings = cachedSettings();
    const logo = safeImageUrl(settings.logo_image) || '/logo.png';
    const number = cleanWhatsApp(settings.whatsapp || '92415565') || '96892415565';
    const address = String(settings.address || '').trim() || 'سلطنة عمان – مسقط – شارع 18 نوفمبر – مقابل ستاربكس';
    const footer = document.createElement('footer');
    footer.className = 'dr-site-footer';
    footer.innerHTML = `<div class="dr-footer-main"><div class="dr-footer-brand"><img data-shell-logo src="${escapeHtml(logo)}" alt="Dama Rose"><p>${english ? 'Luxury Arabic sweets with an authentic Levantine spirit in Muscat.' : 'حلويات عربية فاخرة بروح شامية أصيلة في مسقط.'}</p></div><div><h3>${english ? 'Quick links' : 'روابط سريعة'}</h3><div class="dr-footer-links"><a href="/#products">${english ? 'Products' : 'المنتجات'}</a><a href="/menu.html">${english ? 'Menu' : 'المنيو'}</a><a href="/offers.html">${english ? 'Offers' : 'العروض'}</a><a href="/gifts.html">${english ? 'Gifts' : 'الهدايا'}</a><a href="/custom-order.html">${english ? 'Custom order' : 'تخصيص طلب'}</a></div></div><div><h3>${english ? 'Information' : 'معلومات مهمة'}</h3><div class="dr-footer-links"><a href="/about.html">${english ? 'About us' : 'من نحن'}</a><a href="/contact.html">${english ? 'Contact us' : 'تواصل معنا'}</a><a href="/privacy.html">${english ? 'Privacy policy' : 'سياسة الخصوصية'}</a><a href="/terms.html">${english ? 'Terms & conditions' : 'الشروط والأحكام'}</a></div></div><div><h3>${english ? 'Contact us' : 'تواصل معنا'}</h3><div class="dr-footer-contact"><span data-shell-address>${escapeHtml(address)}</span><a href="https://wa.me/${number}" data-shell-whatsapp data-whatsapp-label>${english ? 'WhatsApp' : 'واتساب'}: ${number.startsWith('968') ? number.slice(3) : number}</a><a class="dr-whatsapp-btn" href="https://wa.me/${number}" data-shell-whatsapp target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a9.7 9.7 0 0 0-8.4 14.6L2 22l5.5-1.5A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.9.9-3.1-.2-.3A8 8 0 1 1 12 20Z"/></svg>${english ? 'Order on WhatsApp' : 'اطلب عبر واتساب'}</a></div></div></div><div class="dr-footer-social"><div class="dr-social-links"><a href="https://www.instagram.com/damarose_sweets?stkn=MWZtZDU2a2E1dDZ3bA==" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a><a href="https://www.facebook.com/share/14c58AcoTTf/?mibextid=wwXIfr" target="_blank" rel="noopener" aria-label="Facebook">Facebook</a><a href="https://maps.app.goo.gl/tUKFcJdi5rJvWuVM9?g_st=ic" target="_blank" rel="noopener">Google Maps</a></div><span>© Dama Rose. ${english ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}</span></div>`;
    const oldFooter = document.querySelector('body > footer');
    if (oldFooter) oldFooter.replaceWith(footer); else document.body.append(footer);
    applyShellSettings(settings);
    updateCartBadge();
  }
  window.DamaRose = {
    lang,isEnglish,productName,categoryName,escapeHtml,variants,minPrice,money,safeImageUrl,safeHttpsUrl,readJson,mediaPreviewEnabled,mediaDraft,mergeSettings,mergeProducts,cart,cartUnits,updateCartBadge,createProductCard,replaceProductCards,cleanWhatsApp,cachedSettings,addToCart,showToast,openImageLightbox,applyShellSettings,renderShell
  };
  const refreshShellSettings = async () => {
    try {
      const response = await fetch(`/api/settings?fresh=${Date.now()}`, { cache:'no-store' });
      if (!response.ok) return;
      const raw = await response.json();
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
      try { localStorage.setItem('damaRoseSettings', JSON.stringify(raw)); } catch {}
      applyShellSettings(raw);
    } catch {}
  };
  const init = () => { renderShell(); updateCartBadge(); refreshShellSettings(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  addEventListener('storage', event => {
    if (event.key === 'damaRoseCart') updateCartBadge();
    if (event.key === 'damaRoseSettings') applyShellSettings(cachedSettings());
  });
})();
