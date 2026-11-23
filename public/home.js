(() => {
  const dr = window.DamaRose;
  const categories = ['بقلاوات', 'قشاطي', 'كنافة', 'نواشف', 'بوظة', 'هدايا داما روز'];
  let allProducts = [];
  let selectedCategory = 'بقلاوات';

  function uniqueProducts(items) {
    const seen = new Set();
    return items.filter(product => {
      const key = String(product?.id || [product?.category, product?.ar, product?.image].join('|'));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function cachedProducts() {
    const value = dr.readJson('damaRoseProducts', []);
    return dr.mergeProducts(Array.isArray(value) ? value : []);
  }

  function emptyState(title, description) {
    const box = document.createElement('div');
    box.className = 'daily-empty';
    const content = document.createElement('div');
    const heading = document.createElement('b');
    const text = document.createElement('span');
    heading.textContent = title;
    text.textContent = description;
    content.append(heading, text);
    box.append(content);
    return box;
  }

  function renderProducts(category = selectedCategory) {
    const grid = document.getElementById('productsGrid');
    const active = categories.includes(category) ? category : selectedCategory;
    const products = uniqueProducts(allProducts.filter(product => product?.category === active));
    document.getElementById('productFilterLabel').textContent = dr.categoryName(active);
    if (!products.length) {
      grid.replaceChildren(emptyState(
        dr.isEnglish() ? 'No products in this category' : 'لا توجد منتجات في هذا القسم',
        dr.isEnglish() ? 'Products will appear here when they are added from the dashboard.' : 'ستظهر المنتجات هنا فور إضافتها من لوحة الإدارة.'
      ));
      return;
    }
    dr.replaceProductCards(grid, products);
  }

  function renderDailyPicks(items) {
    const grid = document.getElementById('dailyGrid');
    const products = uniqueProducts(items);
    if (!products.length) {
      grid.replaceChildren(emptyState(
        dr.isEnglish() ? 'Best sellers' : 'الأكثر مبيعًا',
        dr.isEnglish() ? 'The most requested products will appear here.' : 'ستظهر المنتجات الأكثر طلبًا هنا.'
      ));
      return;
    }
    dr.replaceProductCards(grid, products, 'daily-card');
  }

  function selectCategory(category, { scroll = false, updateUrl = false } = {}) {
    if (!categories.includes(category)) return;
    selectedCategory = category;
    document.querySelectorAll('.cat[data-category]').forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderProducts(category);
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('category', category);
      url.hash = 'product-list';
      history.replaceState(null, '', url);
    }
    if (scroll) requestAnimationFrame(() => document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function applySiteVisuals(settings) {
    settings = dr.mergeSettings(settings);
    const hero = dr.safeImageUrl(settings?.home_hero_image);
    if (hero) {
      const node = document.querySelector('.hero');
      node?.style.setProperty('--hero-image', `url("${hero.replace(/["\\\n\r]/g, encodeURIComponent)}")`);
      node?.style.setProperty('background-position', settings.home_hero_image_position || 'left center', 'important');
      node?.style.setProperty('background-size', `${Math.max(100,Number(settings.home_hero_image_zoom)||100)}% auto`, 'important');
    }
    const gift = dr.safeImageUrl(settings?.home_gifts_banner || settings?.category_image_gifts);
    if (gift) document.querySelector('.gift-banner')?.style.setProperty('--gift-image', `url("${gift.replace(/["\\\n\r]/g, encodeURIComponent)}")`);
    dr.applyShellSettings(settings);

    const section = document.getElementById('homeVideoSection');
    const player = document.getElementById('homeVideo');
    const video = dr.safeHttpsUrl(settings?.home_video_url);
    if (section && player) {
      if (video) {
        if (player.src !== video) player.src = video;
        section.hidden = false;
      } else {
        player.pause();
        player.removeAttribute('src');
        section.hidden = true;
      }
    }

    const number = dr.cleanWhatsApp(settings?.whatsapp);
    if (number) {
      const shortNumber = number.startsWith('968') ? number.slice(3) : number;
      const heroLink = document.getElementById('heroWhatsapp');
      const footerLink = document.getElementById('footerWhatsapp');
      if (heroLink) heroLink.href = `https://wa.me/${number}`;
      if (footerLink) {
        footerLink.href = `https://wa.me/${number}`;
        footerLink.textContent = `${dr.isEnglish() ? 'WhatsApp' : 'واتساب'}: ${shortNumber}`;
      }
    }
    const address = String(settings?.address || '').trim();
    if (address) document.getElementById('footerAddress').textContent = address;
  }

  function applyCategorySettings(settings) {
    applySiteVisuals(settings);
    document.querySelectorAll('[data-cat-image]').forEach(element => {
      const image = dr.safeImageUrl(settings?.[element.dataset.catImage]);
      if (image) {
        element.style.backgroundImage = `url("${image.replace(/["\\\n\r]/g, encodeURIComponent)}")`;
        element.textContent = '';
      } else {
        element.style.backgroundImage = '';
      }
    });
  }

  async function loadProducts() {
    const cached = uniqueProducts(cachedProducts());
    if (cached.length) {
      allProducts = cached;
      renderProducts();
      renderDailyPicks(allProducts.filter(product => product?.pick));
    }
    try {
      const response = await fetch(`/api/snapshot?fresh=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('snapshot_failed');
      const snapshot = await response.json();
      const rawProducts = Array.isArray(snapshot.products) ? snapshot.products : [];
      const fresh = uniqueProducts(dr.mergeProducts(rawProducts));
      const rawSettings = snapshot.settings && typeof snapshot.settings === 'object' ? snapshot.settings : {};
      const settings = dr.mergeSettings(rawSettings);
      allProducts = fresh;
      try {
        localStorage.setItem('damaRoseProducts', JSON.stringify(rawProducts));
        localStorage.setItem('damaRoseSettings', JSON.stringify(rawSettings));
      } catch {}
      renderProducts();
      renderDailyPicks(fresh.filter(product => product?.pick));
      applyCategorySettings(settings);
    } catch {
      if (!cached.length) {
        try {
          const response = await fetch(`/api/products?fresh=${Date.now()}`, { cache: 'no-store' });
          if (!response.ok) throw new Error('products_failed');
          allProducts = uniqueProducts(dr.mergeProducts(await response.json()));
          renderProducts();
          renderDailyPicks(allProducts.filter(product => product?.pick));
        } catch {
          allProducts = [];
          renderProducts();
          renderDailyPicks([]);
        }
      }
    }
  }

  const requested = new URLSearchParams(location.search).get('category');
  if (categories.includes(requested)) selectedCategory = requested;
  document.querySelectorAll('.cat[data-category]').forEach(button => {
    button.addEventListener('click', () => selectCategory(button.dataset.category, { scroll: true, updateUrl: true }));
  });
  selectCategory(selectedCategory);
  applyCategorySettings(dr.cachedSettings());
  const instant = uniqueProducts(cachedProducts());
  if (instant.length) {
    allProducts = instant;
    renderProducts();
    renderDailyPicks(instant.filter(product => product?.pick));
  }
  dr.updateCartBadge();
  loadProducts();
})();
