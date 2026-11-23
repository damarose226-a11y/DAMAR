(() => {
  'use strict';
  const admin = window.DamaAdmin;
  if (!admin) return;

  const DRAFT_KEY = 'damaRoseMediaDraft';
  const PREVIOUS_KEY = 'damaRoseMediaPreviousDraft';
  const $ = id => document.getElementById(id);
  const assetDefinitions = [
    { tab:'home', key:'home_hero_image', label:'صورة الواجهة الرئيسية', usage:'الرئيسية · Hero' },
    { tab:'home', key:'home_offer_banner', label:'بانر العروض في الرئيسية', usage:'الرئيسية · قسم العروض' },
    { tab:'home', key:'home_gifts_banner', label:'بانر الهدايا في الرئيسية', usage:'الرئيسية · قسم الهدايا' },
    { tab:'categories', key:'category_image_baklava', label:'غلاف بقلاوات', usage:'الرئيسية وصفحة بقلاوات' },
    { tab:'categories', key:'category_image_qashtah', label:'غلاف قشاطي', usage:'الرئيسية وصفحة قشاطي' },
    { tab:'categories', key:'category_image_kunafa', label:'غلاف كنافة', usage:'الرئيسية وصفحة كنافة' },
    { tab:'categories', key:'category_image_dry', label:'غلاف نواشف', usage:'الرئيسية وصفحة نواشف' },
    { tab:'categories', key:'category_image_icecream', label:'غلاف البوظة', usage:'صفحة البوظة' },
    { tab:'categories', key:'category_image_gifts', label:'غلاف فئة الهدايا', usage:'الرئيسية وصفحة الهدايا' },
    { tab:'campaigns', key:'offers_cover_image', label:'غلاف صفحة العروض', usage:'صفحة العروض' },
    { tab:'campaigns', key:'gifts_cover_image', label:'غلاف صفحة الهدايا', usage:'صفحة الهدايا' },
    { tab:'pages', key:'about_cover_image', label:'غلاف من نحن', usage:'صفحة من نحن' },
    { tab:'pages', key:'about_video_poster', label:'صورة غلاف فيديو من نحن', usage:'صفحة من نحن · الفيديو' },
    { tab:'pages', key:'contact_cover_image', label:'غلاف تواصل معنا', usage:'صفحة تواصل معنا' },
    { tab:'branding', key:'logo_image', label:'شعار داما روز', usage:'الهيدر والفوتر' },
    { tab:'branding', key:'header_background_image', label:'خلفية الهيدر', usage:'جميع الصفحات' },
    { tab:'branding', key:'footer_background_image', label:'خلفية الفوتر', usage:'جميع الصفحات' }
  ];

  let products = [];
  let settings = {};
  let currentTab = 'home';
  let query = '';
  let dirty = false;
  let library = [];
  let draft = loadJson(DRAFT_KEY, { version:1, settings:{}, products:{}, updatedAt:'' });

  function loadJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' ? value : fallback;
    } catch { return fallback; }
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function normalizeDraft(value) {
    return {
      version: 1,
      settings: value?.settings && typeof value.settings === 'object' ? value.settings : {},
      products: value?.products && typeof value.products === 'object' ? value.products : {},
      updatedAt: String(value?.updatedAt || '')
    };
  }
  draft = normalizeDraft(draft);
  function safeSrc(value) {
    const raw = String(value || '').trim();
    if (/^data:image\/(?:png|jpe?g|webp|gif|avif|svg\+xml)[;,]/i.test(raw)) return raw;
    try { const url = new URL(raw, location.origin); return ['https:','http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  function sourceFor(item) {
    const bucket = item.kind === 'product' ? draft.products : draft.settings;
    const base = item.kind === 'product' ? item.product.image : settings[item.key];
    const edit = bucket[item.key] || {};
    return { src:safeSrc(edit.src || base), hidden:!!edit.hidden, position:edit.position || 'center', zoom:Number(edit.zoom) || 100, alt:String(edit.alt || item.label) };
  }
  function allItems() {
    const settingsItems = assetDefinitions.map(def => ({ ...def, kind:'setting' }));
    const productItems = products.map(product => ({ tab:'products', kind:'product', key:String(product.id), product, label:String(product.ar || product.en || 'منتج'), usage:`المنتجات · ${String(product.category || '')}` }));
    return [...settingsItems, ...productItems];
  }
  function buildLibrary() {
    const map = new Map();
    allItems().forEach(item => {
      const effective = sourceFor(item);
      if (!effective.src) return;
      if (!map.has(effective.src)) map.set(effective.src, { id:`asset-${map.size}`, src:effective.src, label:item.label, uses:[] });
      map.get(effective.src).uses.push(item.usage);
    });
    library = [...map.values()];
  }
  function dimensions(src, target) {
    if (!src) { target.textContent = 'لا توجد صورة حالية'; return; }
    const image = new Image();
    image.onload = () => { target.textContent = `${image.naturalWidth} × ${image.naturalHeight} بكسل`; };
    image.onerror = () => { target.textContent = 'تعذر قراءة الأبعاد'; };
    image.src = src;
  }
  function setDirty(value = true) {
    dirty = value;
    const state = $('mediaState');
    if (!state) return;
    state.textContent = value ? 'تغييرات غير محفوظة' : (draft.updatedAt ? 'المسودة محفوظة' : 'لا توجد تغييرات غير محفوظة');
  }
  function setEdit(item, patch) {
    const bucket = item.kind === 'product' ? draft.products : draft.settings;
    bucket[item.key] = { ...(bucket[item.key] || {}), ...patch };
    setDirty();
  }
  function previewBox(item, effective) {
    const box = document.createElement('div');
    box.className = `media-thumb${effective.hidden ? ' is-hidden' : ''}`;
    if (effective.src) {
      const image = document.createElement('img');
      image.src = effective.src;
      image.alt = effective.alt;
      image.style.objectPosition = effective.position;
      image.style.transform = `scale(${Math.max(100,effective.zoom)/100})`;
      box.append(image);
    } else box.textContent = 'لا توجد صورة حالية';
    if (effective.hidden) {
      const badge = document.createElement('span');
      badge.className = 'media-hidden-badge';
      badge.textContent = 'مخفية في المسودة';
      box.append(badge);
    }
    return box;
  }
  function inputField(label, input, full = false) {
    const wrap = document.createElement('label');
    wrap.className = `field${full ? ' full' : ''}`;
    const title = document.createElement('span');
    title.textContent = label;
    wrap.append(title, input);
    return wrap;
  }
  function mediaCard(item) {
    const effective = sourceFor(item);
    const article = document.createElement('article');
    article.className = 'media-card';
    article.append(previewBox(item, effective));
    const body = document.createElement('div');
    body.className = 'media-card-body';
    const heading = document.createElement('div');
    heading.className = 'media-card-title';
    const title = document.createElement('b'); title.textContent = item.label;
    heading.append(title);
    const meta = document.createElement('div'); meta.className = 'media-meta'; meta.textContent = 'جارٍ قراءة الأبعاد…';
    dimensions(effective.src, meta);
    const usage = document.createElement('div'); usage.className = 'muted'; usage.textContent = item.usage;
    usage.style.marginBottom = '10px';

    const controls = document.createElement('div'); controls.className = 'media-controls';
    const alt = document.createElement('input'); alt.value = effective.alt; alt.placeholder = 'وصف الصورة';
    alt.addEventListener('input', () => setEdit(item, { alt:alt.value }));
    const position = document.createElement('select');
    [['center','وسط'],['top','أعلى'],['bottom','أسفل'],['right','يمين'],['left','يسار']].forEach(([value,label]) => { const option=document.createElement('option'); option.value=value; option.textContent=label; option.selected=value===effective.position; position.append(option); });
    position.addEventListener('change', () => { setEdit(item,{position:position.value}); render(); });
    const zoomWrap = document.createElement('div'); zoomWrap.className = 'media-zoom';
    const zoom = document.createElement('input'); zoom.type='range'; zoom.min='100'; zoom.max='180'; zoom.step='5'; zoom.value=String(effective.zoom);
    const zoomOutput = document.createElement('output'); zoomOutput.textContent=`${effective.zoom}%`;
    zoom.addEventListener('input', () => { zoomOutput.textContent=`${zoom.value}%`; setEdit(item,{zoom:Number(zoom.value)}); article.querySelector('.media-thumb img')?.style.setProperty('transform',`scale(${Number(zoom.value)/100})`); });
    zoomWrap.append(zoom,zoomOutput);
    const librarySelect = document.createElement('select'); librarySelect.className='media-library-use';
    const first = document.createElement('option'); first.value=''; first.textContent='استخدام صورة من مكتبة الوسائط'; librarySelect.append(first);
    library.forEach(asset => { const option=document.createElement('option'); option.value=asset.id; option.textContent=asset.label; librarySelect.append(option); });
    librarySelect.addEventListener('change', () => { const asset=library.find(x=>x.id===librarySelect.value); if(asset){setEdit(item,{src:asset.src,hidden:false});render();} });
    controls.append(inputField('النص البديل',alt,true),inputField('موضع الصورة',position),inputField('التكبير',zoomWrap),librarySelect);

    const actions = document.createElement('div'); actions.className='media-actions';
    const file = document.createElement('input'); file.type='file'; file.accept='image/jpeg,image/png,image/webp,image/svg+xml'; file.className='media-file';
    file.addEventListener('change', async () => {
      if (!file.files?.[0]) return;
      try {
        const result = await prepareImage(file.files[0], `${item.kind}:${item.key}`);
        setEdit(item,{src:result.src,hidden:false,originalName:result.name,originalType:result.type});
        render();
      } catch (error) { alert(error.message || 'تعذر تجهيز الصورة'); }
    });
    const replace = document.createElement('button'); replace.type='button'; replace.className='btn gold'; replace.textContent=effective.src?'استبدال':'رفع صورة'; replace.addEventListener('click',()=>file.click());
    const hide = document.createElement('button'); hide.type='button'; hide.className='btn ghost'; hide.textContent=effective.hidden?'إظهار':'إخفاء'; hide.addEventListener('click',()=>{setEdit(item,{hidden:!effective.hidden});render();});
    const reset = document.createElement('button'); reset.type='button'; reset.className='btn ghost'; reset.textContent='استعادة الحالية'; reset.addEventListener('click',()=>{const bucket=item.kind==='product'?draft.products:draft.settings;delete bucket[item.key];setDirty();render();});
    actions.append(file,replace,hide,reset);
    body.append(heading,meta,usage,controls,actions); article.append(body);
    return article;
  }
  function libraryCard(asset) {
    const article=document.createElement('article'); article.className='media-card media-library-card';
    const box=document.createElement('div'); box.className='media-thumb'; const image=document.createElement('img'); image.src=asset.src; image.alt=asset.label; box.append(image);
    const body=document.createElement('div'); body.className='media-card-body'; const title=document.createElement('b'); title.textContent=asset.label;
    const meta=document.createElement('div'); meta.className='media-meta'; dimensions(asset.src,meta);
    const uses=document.createElement('div'); uses.className='media-usage'; [...new Set(asset.uses)].forEach(use=>{const tag=document.createElement('span');tag.textContent=use;uses.append(tag)});
    body.append(title,meta,uses); article.append(box,body); return article;
  }
  function render() {
    const grid=$('mediaGrid'); if(!grid) return;
    buildLibrary();
    const normalized=query.trim().toLowerCase();
    let nodes=[];
    if(currentTab==='library') {
      const items=library.filter(asset=>!normalized||`${asset.label} ${asset.uses.join(' ')}`.toLowerCase().includes(normalized));
      nodes=items.map(libraryCard); $('mediaCount').textContent=`${items.length} صورة في المكتبة`;
    } else {
      const items=allItems().filter(item=>item.tab===currentTab&&(!normalized||`${item.label} ${item.usage}`.toLowerCase().includes(normalized)));
      nodes=items.map(mediaCard); $('mediaCount').textContent=`${items.length} عنصر`;
    }
    grid.replaceChildren(...nodes); $('mediaEmpty').classList.toggle('hidden',nodes.length>0);
    const time=draft.updatedAt?new Date(draft.updatedAt).toLocaleString('ar-OM'):'لم تُحفظ مسودة بعد'; $('mediaDraftTime').textContent=time;
    setDirty(dirty);
    configurePublishButton();
  }

  function openOriginalDb() {
    return new Promise((resolve,reject)=>{const request=indexedDB.open('damaRoseMediaOriginals',1);request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
  }
  async function preserveOriginal(id,file) {
    try { const db=await openOriginalDb(); const tx=db.transaction('files','readwrite'); tx.objectStore('files').put({id,blob:file,name:file.name,type:file.type,size:file.size,updatedAt:Date.now()}); await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)}); db.close(); } catch {}
  }
  function sanitizeSvg(text) {
    const documentNode=new DOMParser().parseFromString(text,'image/svg+xml');
    if(documentNode.querySelector('parsererror,script,foreignObject')) throw new Error('ملف SVG غير آمن');
    for(const element of documentNode.querySelectorAll('*')) for(const attribute of [...element.attributes]) {
      const value=String(attribute.value||'').trim();
      if(/^on/i.test(attribute.name)||/javascript:/i.test(value)||(/^(?:href|xlink:href)$/i.test(attribute.name)&&/^(?:https?:|\/\/)/i.test(value))) throw new Error('ملف SVG يحتوي على روابط أو تعليمات غير آمنة');
    }
    return new XMLSerializer().serializeToString(documentNode.documentElement);
  }
  function rasterPreview(file) {
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('تعذر قراءة الصورة'));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('تعذر فتح الصورة'));image.onload=()=>{const max=1800,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),width=Math.max(1,Math.round(image.naturalWidth*scale)),height=Math.max(1,Math.round(image.naturalHeight*scale)),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,0,0,width,height);resolve(canvas.toDataURL('image/webp',.82))};image.src=reader.result};reader.readAsDataURL(file)});
  }
  async function prepareImage(file,id) {
    const allowed=['image/jpeg','image/png','image/webp','image/svg+xml'];
    if(!allowed.includes(file.type)) throw new Error('الصيغ المدعومة JPG وPNG وWebP وSVG الآمن');
    if(file.size>12*1024*1024) throw new Error('حجم الصورة يجب ألا يتجاوز 12 ميغابايت');
    await preserveOriginal(id,file);
    let src;
    if(file.type==='image/svg+xml') { const clean=sanitizeSvg(await file.text()); src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(clean)}`; }
    else src=await rasterPreview(file);
    return {src,name:file.name,type:file.type};
  }
  function saveDraft({silent=false}={}) {
    try {
      const current=localStorage.getItem(DRAFT_KEY);
      if(current) localStorage.setItem(PREVIOUS_KEY,current);
      draft.updatedAt=new Date().toISOString();
      localStorage.setItem(DRAFT_KEY,JSON.stringify(draft));
      setDirty(false); render();
      if(!silent) alert('تم حفظ مسودة الصور. لم يتم نشر أي تغيير على الموقع الفعلي.');
      return true;
    } catch { alert('تعذر حفظ المسودة في هذا المتصفح. جرّب صورًا أصغر.'); return false; }
  }
  function restorePrevious() {
    const previous=loadJson(PREVIOUS_KEY,null); if(!previous) return alert('لا توجد نسخة سابقة محفوظة.');
    const current=JSON.stringify(draft); draft=normalizeDraft(previous); localStorage.setItem(PREVIOUS_KEY,current); localStorage.setItem(DRAFT_KEY,JSON.stringify(draft)); setDirty(false); render(); alert('تمت استعادة النسخة السابقة من المسودة.');
  }
  function previewDraft() {
    if(dirty&&!saveDraft({silent:true})) return;
    const panel=$('mediaPreviewPanel'),frame=$('mediaPreviewFrame'); panel.classList.remove('hidden'); frame.src=`/?mediaPreview=1&previewTime=${Date.now()}`; panel.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function configurePublishButton() {
    const button=$('publishMediaDraft'); if(!button) return;
    const allowed=location.hostname==='damar-ebon.vercel.app'&&!admin.isMediaPreview()&&admin.can('settings_manage');
    button.disabled=!allowed; button.title=allowed?'نشر الصور بعد المراجعة':'النشر متاح بعد الموافقة على المعاينة';
    if(!allowed) button.textContent='النشر متاح بعد الموافقة';
  }
  async function publishDraft() {
    if(location.hostname!=='damar-ebon.vercel.app'||admin.isMediaPreview()) return;
    if(!admin.can('settings_manage')) return alert('لا تملك صلاحية نشر الصور.');
    if(!confirm('نشر مسودة الصور الحالية على الموقع الفعلي؟')) return;
    const button=$('publishMediaDraft'),old=button.textContent;
    try {
      button.disabled=true; button.textContent='جاري النشر…';
      const settingsUpdate={};
      Object.entries(draft.settings).forEach(([key,value])=>{settingsUpdate[key]=value.hidden?'':String(value.src||settings[key]||'');settingsUpdate[`${key}_position`]=String(value.position||'center');settingsUpdate[`${key}_zoom`]=String(value.zoom||100);settingsUpdate[`${key}_alt`]=String(value.alt||'')});
      if(Object.keys(settingsUpdate).length) await admin.api('/api/admin/settings',{method:'PUT',body:JSON.stringify(settingsUpdate)});
      for(const [id,value] of Object.entries(draft.products)) {
        const product=products.find(item=>String(item.id)===String(id)); if(!product) continue;
        await admin.api('/api/admin/products/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({ar:product.ar,en:product.en||'',category:product.category,pick:!!product.pick,variants:product.variants||[],image:value.hidden?'':String(value.src||product.image||'')})});
      }
      await admin.api('/api/admin/site-refresh',{method:'POST',body:'{}'});
      localStorage.removeItem(DRAFT_KEY);localStorage.removeItem(PREVIOUS_KEY);draft=normalizeDraft({});setDirty(false);await admin.refresh();alert('تم نشر الصور وتحديث الموقع بنجاح.');
    } catch(error) { alert('تعذر نشر الصور: '+(error.message||'خطأ')); }
    finally { button.disabled=false;button.textContent=old;configurePublishButton(); }
  }

  function bind() {
    $('mediaTabs')?.addEventListener('click',event=>{const button=event.target.closest('[data-media-tab]');if(!button)return;currentTab=button.dataset.mediaTab;document.querySelectorAll('[data-media-tab]').forEach(node=>node.classList.toggle('active',node===button));render()});
    $('mediaSearch')?.addEventListener('input',event=>{query=event.target.value;render()});
    $('saveMediaDraft')?.addEventListener('click',()=>saveDraft());
    $('restoreMediaDraft')?.addEventListener('click',restorePrevious);
    $('previewMediaDraft')?.addEventListener('click',previewDraft);
    $('publishMediaDraft')?.addEventListener('click',publishDraft);
    $('closeMediaPreview')?.addEventListener('click',()=>{$('mediaPreviewPanel').classList.add('hidden');$('mediaPreviewFrame').src='about:blank'});
    document.querySelectorAll('[data-preview-device]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-preview-device]').forEach(node=>node.classList.toggle('active',node===button));$('mediaPreviewFrame').className=`media-preview-frame ${button.dataset.previewDevice}`}));
    addEventListener('dama-admin-data',event=>refresh(event.detail?.products,event.detail?.settings));
  }
  function refresh(nextProducts=admin.getProducts(),nextSettings=admin.getSettings()) {
    products=Array.isArray(nextProducts)?nextProducts:[];settings=nextSettings&&typeof nextSettings==='object'?nextSettings:{};render();
  }
  window.DamaMedia={refresh};
  bind();refresh();
})();
