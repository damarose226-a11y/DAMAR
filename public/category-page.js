(() => {
  const config = window.DR_CATEGORY_PAGE || {};
  const grid = document.getElementById('grid');
  const heroCover = document.getElementById('heroCover');
  const dr = window.DamaRose;
  if (!grid || !dr || !config.category) return;

  function cachedProducts() {
    const value = dr.readJson('damaRoseProducts', []);
    return dr.mergeProducts(Array.isArray(value) ? value : []);
  }

  function empty(message, title = '') {
    const box = document.createElement('div');
    box.className = 'empty';
    if (title) {
      const wrap = document.createElement('div');
      const heading = document.createElement('b');
      const text = document.createElement('span');
      heading.textContent = title;
      text.textContent = message;
      wrap.append(heading, text);
      box.append(wrap);
    } else {
      box.textContent = message;
    }
    grid.replaceChildren(box);
  }

  function render(items) {
    const products = items.filter(product => product?.category === config.category);
    if (!products.length) {
      empty(
        dr.isEnglish() ? 'There are no products in this category right now.' : 'لا توجد منتجات في هذا القسم حاليًا.',
        config.emptyTitle ? dr.categoryName(config.category) : ''
      );
      return;
    }
    dr.replaceProductCards(grid, products);
  }

  function applyCover(settings) {
    settings = dr.mergeSettings(settings);
    const image = dr.safeImageUrl(settings?.[config.coverKey]);
    if (!heroCover || !image) return;
    if (config.coverMode === 'hero') {
      heroCover.style.backgroundImage = `linear-gradient(120deg,rgba(6,31,27,.78),rgba(12,55,48,.78)),url("${image.replace(/["\\\n\r]/g, encodeURIComponent)}")`;
    } else {
      heroCover.style.backgroundImage = `url("${image.replace(/["\\\n\r]/g, encodeURIComponent)}")`;
    }
  }

  async function load() {
    const cached = cachedProducts();
    if (cached.length) render(cached);
    applyCover(dr.cachedSettings());
    try {
      const response = await fetch(`/api/snapshot?fresh=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('snapshot_failed');
      const snapshot = await response.json();
      const rawProducts = Array.isArray(snapshot.products) ? snapshot.products : [];
      const rawSettings = snapshot.settings && typeof snapshot.settings === 'object' ? snapshot.settings : {};
      const products = dr.mergeProducts(rawProducts);
      const settings = dr.mergeSettings(rawSettings);
      localStorage.setItem('damaRoseProducts', JSON.stringify(rawProducts));
      localStorage.setItem('damaRoseSettings', JSON.stringify(rawSettings));
      dr.applyShellSettings(settings);
      render(products);
      applyCover(settings);
    } catch {
      if (!cached.length) {
        empty(dr.isEnglish() ? 'Products could not be loaded. Please try again.' : 'تعذر تحميل المنتجات، حاول مرة أخرى.', config.emptyTitle ? dr.categoryName(config.category) : '');
      }
    }
  }

  dr.updateCartBadge();
  load();
})();
