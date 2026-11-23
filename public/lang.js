(() => {
  const D = {
    'الرئيسية':'Home','المنتجات':'Products','المنيو':'Menu','المنيو والأسعار':'Menu & prices','العروض':'Offers','من نحن':'About us','تواصل معنا':'Contact us','تخصيص طلب':'Custom order','السلة':'Cart',
    'خصّص طلبك':'Customize your order','اكتب تفاصيل طلبك والكمية وموعد الاستلام، ثم أرسلها إلينا عبر واتساب للتأكيد.':'Enter your order details, quantity, and pickup time, then send them to us on WhatsApp for confirmation.','تفاصيل الطلب':'Order details','الكمية أو العدد':'Quantity or count','ملاحظات':'Notes','وقت الاستلام':'Pickup time','اختر اليوم والوقت المناسب للاستلام.':'Choose your preferred pickup date and time.','بعد الضغط ستنتقل إلى واتساب لمراجعة الرسالة وإرسالها.':'You will continue to WhatsApp to review and send the message.',
    'كيف يتم الطلب؟':'How does it work?','اكتب اسم المنتج':'Enter the product name','يمكنك كتابة أي صنف أو طلب خاص تريده.':'Enter any item or special order you would like.','حدّد الكمية والموعد':'Choose quantity and time','اكتب الوزن أو عدد القطع واختر موعد الاستلام.':'Enter the weight or number of pieces and choose a pickup time.','أرسل الطلب للتأكيد':'Send for confirmation','سنراجع التفاصيل معك عبر واتساب ونؤكد إمكانية التجهيز.':'We will review the details with you on WhatsApp and confirm availability.','الطلب لا يُعد مؤكداً حتى يصلك تأكيد من داما روز عبر واتساب.':'Your order is confirmed only after you receive confirmation from Dama Rose on WhatsApp.',
    'حلويات عربية فاخرة • مسقط':'Luxury Arabic sweets • Muscat','منيو داما روز':'Dama Rose menu','جميع أصنافنا وأسعارها في قائمة مرتبة وسهلة التصفح.':'All our items and prices in one clear, easy-to-browse menu.','اختر القسم':'Choose a section','الأسعار بالريال العُماني':'Prices in Omani rial','الأسعار بالريال العُماني ولا تشمل ضريبة القيمة المضافة':'Prices are in Omani rial and exclude VAT','حلويات عربية فاخرة بطابع شامي أصيل':'Luxury Arabic sweets with an authentic Levantine character','لا توجد أصناف في المنيو حاليًا.':'There are no menu items right now.','تعذر تحميل المنيو حاليًا.':'The menu could not be loaded right now.',
    'مذاق أصيل...':'Authentic taste...','بروح التراث الشامي':'with the spirit of Damascus','تجربة راقية تجمع بين وصفاتنا التقليدية، جودة المكونات، والتقديم الفاخر الذي يليق بكل مناسبة.':'A refined experience combining traditional recipes, quality ingredients, and elegant presentation for every occasion.','تسوق الآن':'Shop now','تسوق الآن ←':'Shop now ←','استكشف المنتجات':'Explore products','جودة عالية':'High quality','مذاق أصيل':'Authentic taste','مكونات مختارة':'Selected ingredients','تحضير يومي بعناية':'Prepared fresh with care','مكونات مختارة بعناية':'Carefully selected ingredients','تغليف فاخر':'Premium packaging','مناسب للهدايا والمناسبات':'Perfect for gifts and occasions','توصيل سريع':'Fast delivery','في مسقط والمناطق':'Across Muscat and nearby areas','داخل مسقط والمناطق':'Across Muscat and nearby areas','خدمة مميزة':'Personal service','دعم مباشر عبر واتساب':'Direct WhatsApp support','وصفات أصيلة':'Authentic recipes','نكهة شامية مميزة':'Distinctive Levantine flavor','تصفح المنتجات':'Browse products','اختر القسم الذي يناسب ذوقك':'Choose the category that suits your taste','عرض الكل':'View all','عرض الكل ←':'View all ←',
    'بقلاوات':'Baklava','قشاطي':'Cream sweets','كنافة':'Kunafa','نواشف':'Dry sweets','بوظة':'Ice cream','هدايا داما روز':'Dama Rose gifts','أقسام المنتجات':'Product categories','منتجاتنا':'Our products','جميع المنتجات المتوفرة':'All available products','عرض المنتج':'View product','لا توجد منتجات في هذا القسم':'No products in this category','ستظهر المنتجات هنا فور إضافتها من لوحة الإدارة.':'Products will appear here when they are added from the dashboard.','لا توجد منتجات في هذا القسم حاليًا.':'There are no products in this category right now.','تعذر تحميل المنتجات.':'Products could not be loaded.','تعذر تحميل المنتجات، حاول مرة أخرى.':'Products could not be loaded. Please try again.',
    'الأكثر مبيعًا':'Best sellers','الأكثر طلبًا':'Most requested','★ الأكثر طلبًا':'★ Most requested','صفحة الأكثر مبيعًا':'Best sellers page','صفحة الأكثر مبيعًا ←':'Best sellers page ←','اكتشف المنتج':'View product','لا توجد منتجات في الأكثر مبيعًا حاليًا.':'There are no best sellers right now.','تظهر هنا المنتجات التي تحددها كالأكثر مبيعًا من لوحة الإدارة.':'Products you mark as best sellers in the admin panel appear here.','تشكيلة من المنتجات التي تحظى بإقبال أكبر من عملائنا.':'A selection of products that are especially popular with our customers.','ستظهر المنتجات الأكثر طلبًا هنا.':'The most requested products will appear here.','★ داما روز':'★ Dama Rose','جاري تحميل المنتجات...':'Loading products...',
    'من داما روز':'From Dama Rose','شاهدوا أجواءنا':'See our atmosphere','لقطات من منتجاتنا وتجربتنا اليومية.':'A glimpse of our products and daily experience.','عرض خاص':'Special offer','عروض مختارة عند توفرها':'Selected offers when available','اكتشف العروض الفعلية المضافة من لوحة الإدارة من دون خصومات أو أسعار تجريبية.':'Discover actual offers added from the dashboard, with no sample discounts or prices.','تصفح العروض':'Browse offers','هدايا تليق بمناسباتكم':'Gifts for your occasions','تشكيلة الهدايا المتوفرة فعلياً بتنسيق أنيق من داما روز.':'Available Dama Rose gifts presented with an elegant touch.','تسوق الهدايا':'Shop gifts','بوكسات فاخرة للمناسبات والضيافة، بتنسيق أنيق يليق بالهدية ويترك انطباعًا مميزًا.':'Premium gift boxes for occasions and hospitality, presented with an elegant touch.','عرض ←':'View ←','عرض العروض ←':'View offers ←','هدية':'Gift','بتفاصيل تليق بك':'Finished with care for you','حكاية مذاق... وهوية':'A story of taste and identity','في داما روز نحافظ على روح الحلويات الشامية الأصيلة ونقدمها بأسلوب عصري راقٍ. نهتم بالتفاصيل من اختيار المكونات وحتى التغليف، لتصل كل قطعة كما يجب أن تكون.':'At Dama Rose, we preserve the spirit of authentic Levantine sweets and present them with a refined modern touch, from carefully selected ingredients to elegant packaging.','اعرف المزيد':'Learn more','اعرف المزيد ←':'Learn more ←',
    'روابط سريعة':'Quick links','حلويات عربية فاخرة بطابع شامي أصيل، بهوية تجمع بين التراث والرقي.':'Luxury Arabic sweets with an identity that brings heritage and elegance together.','سلطنة عمان – مسقط – شارع 18 نوفمبر – مقابل ستاربكس':'Oman – Muscat – 18 November Street – opposite Starbucks','موقعنا على Google Maps':'Find us on Google Maps','جميع الحقوق محفوظة.':'All rights reserved.','© Dama Rose — جميع الحقوق محفوظة':'© Dama Rose — All rights reserved','© Dama Rose — جميع الحقوق محفوظة.':'© Dama Rose — All rights reserved.','© Dama Rose. جميع الحقوق محفوظة.':'© Dama Rose. All rights reserved.',
    'العودة للرئيسية':'Back to home','العودة للرئيسية ←':'Back to home ←','← كل الأقسام':'← All categories','العودة للمنتجات':'Back to products','← العودة للمنتجات':'← Back to products','اختر المنتج لعرض التفاصيل والأحجام والأسعار':'Choose a product to view details, sizes, and prices',
    'منتجات بقلاوات':'Baklava products','تشكيلة من البقلاوات الشامية الفاخرة بنكهات وحشوات متنوعة.':'A selection of premium Levantine baklava with varied flavors and fillings.','منتجات قشاطي':'Cream sweets products','تشكيلة قشاطي شامية محضرة بعناية وبمذاق غني.':'A carefully prepared selection of rich Levantine cream sweets.','منتجات كنافة':'Kunafa products','كنافة بطعم أصيل وتشكيلات تناسب مختلف الأذواق.':'Authentic kunafa in a selection for different tastes.','منتجات نواشف':'Dry sweets products','تشكيلة نواشف مناسبة للضيافة والقهوة والمناسبات.':'A selection of dry sweets for hospitality, coffee, and occasions.','منتجات بوظة':'Ice cream products','بوظة بنكهات مختارة وتقديم مميز من داما روز.':'Ice cream in selected flavors, presented by Dama Rose.','تشكيلة هدايا راقية من داما روز للمناسبات والضيافة.':'An elegant Dama Rose gift selection for occasions and hospitality.',
    'اسم المنتج':'Product name','اختر الحجم':'Choose size','اختر الحجم والكمية، ثم أضف المنتج إلى السلة.':'Choose a size and quantity, then add the product to your cart.','اختر الحجم وأضفه مباشرة للسلة':'Choose a size and add it directly to your cart','يمكنك إضافة أكثر من حجم من نفس المنتج، وسيظهر كل حجم كسطر مستقل في السلة.':'You can add several sizes of the same product; each size will appear as a separate cart item.','السعر':'Price','الكمية':'Quantity','أضف إلى السلة':'Add to cart','أضف للسلة':'Add to cart','يتم اختيار الحجم أولًا ثم إضافة المنتج إلى السلة.':'Choose a size first, then add the product to your cart.','تمت إضافة المنتج إلى السلة':'Product added to cart','المنتج غير موجود':'Product not found','صورة المنتج':'Product image','لا توجد أحجام متاحة لهذا المنتج حاليًا.':'No sizes are available for this product right now.','تعذر تحميل المنتج.':'Product could not be loaded.',
    'هنا تظهر العروض التي تضيفها أنت لاحقًا من لوحة الإدارة، ويمكن تحديثها أو إيقافها في أي وقت.':'Offers added from the dashboard appear here and can be updated anytime.','عروض داما روز':'Dama Rose offers','قسم مستقل للعروض الموسمية والخاصة.':'Seasonal and special offers.','لا توجد عروض متاحة حاليًا.':'No offers are currently available.','تعذر تحميل العروض، حاول مرة أخرى.':'Offers could not be loaded. Please try again.','عرض':'Offer',
    'سلة الطلب':'Your cart','راجع المنتجات والكميات قبل إرسال الطلب عبر واتساب.':'Review items and quantities before sending your order on WhatsApp.','متابعة التسوق':'Continue shopping','← متابعة التسوق':'← Continue shopping','السلة فارغة':'Your cart is empty','لم تضف أي منتجات إلى طلبك بعد.':'You have not added any products yet.','الإجمالي':'Total','الأسعار لا تشمل ضريبة القيمة المضافة.':'Prices exclude VAT.','إرسال الطلب عبر واتساب':'Send order via WhatsApp','رقم واتساب غير مضبوط بعد.':'WhatsApp number is not configured yet.','إضافة منتجات أخرى':'+ Add more products','حذف':'Remove','الوحدة':'unit','بيانات العميل':'Customer details','الاسم':'Name','رقم الهاتف':'Phone number','يرجى إدخال الاسم ورقم هاتف صحيح لإكمال الطلب.':'Enter a name and a valid phone number to continue.',
    'نبذة عن داما روز':'About Dama Rose','حكاية مذاق شامي أصيل، نقدّمها بروح راقية تليق بكل مناسبة.':'Authentic Levantine flavor, presented with a refined spirit for every occasion.','داما روز':'Dama Rose','نحن أصحاب سنوات طويلة من الخبرة في مجال الحلويات الشرقية والمطبخ الشامي، وخاصة في سلطنة عُمان – مسقط. ويشكّل تواجدنا معكم منذ عشر سنوات ميزة فريدة نتميز بها، ونتشرف بتقديم أفخر أنواع الحلويات الدمشقية في Dama Rose – داما روز.':'We bring many years of experience in Eastern sweets and Levantine cuisine, especially in Muscat, Oman. Our ten years with you are a source of pride, and we are honored to serve fine Damascene sweets at Dama Rose.','نرجو أن ننال رضاكم، ونتمنى أن تزودونا بمقترحاتكم من دون تردد.':'We hope to earn your satisfaction and welcome your suggestions at any time.',
    'نحن قريبون منك':'We are close to you','يسعدنا استقبال طلباتكم واستفساراتكم عبر واتساب أو زيارتنا في مسقط.':'We are happy to receive your orders and questions on WhatsApp or welcome you at our Muscat location.','الموقع':'Location','واتساب':'WhatsApp','تواصل عبر واتساب':'Contact us on WhatsApp','سلطنة عمان، مسقط، شارع 18 نوفمبر، مقابل ستاربكس.':'Oman, Muscat, 18 November Street, opposite Starbucks.','فتح في Google Maps':'Open in Google Maps','موقع داما روز':'Dama Rose location','مسقط – شارع 18 نوفمبر – مقابل ستاربكس':'Muscat – 18 November Street – opposite Starbucks','فتح في الخرائط':'Open in Maps'
  };
  const TITLES = {
    'Dama Rose | حلويات داما روز':'Dama Rose | Arabic sweets','Dama Rose | تفاصيل المنتج':'Dama Rose | Product details','Dama Rose | السلة':'Dama Rose | Cart','Dama Rose | العروض':'Dama Rose | Offers','Dama Rose | الأكثر مبيعًا':'Dama Rose | Best sellers','Dama Rose | هدايا داما روز':'Dama Rose | Gifts','من نحن | Dama Rose':'About us | Dama Rose','تواصل معنا | Dama Rose':'Contact us | Dama Rose','المنيو والأسعار | Dama Rose':'Menu and prices | Dama Rose','تخصيص طلب | Dama Rose':'Custom order | Dama Rose','بقلاوات | Dama Rose':'Baklava | Dama Rose','قشاطي | Dama Rose':'Cream sweets | Dama Rose','كنافة | Dama Rose':'Kunafa | Dama Rose','نواشف | Dama Rose':'Dry sweets | Dama Rose','بوظة | Dama Rose':'Ice cream | Dama Rose'
  };
  const lang = () => localStorage.getItem('dr_lang') === 'en' ? 'en' : 'ar';
  function translateText(value) {
    const trimmed = value.trim();
    if (!trimmed) return value;
    let output = D[trimmed];
    if (!output && /^\d+ عرض$/.test(trimmed)) output = trimmed.replace('عرض', 'offers');
    if (!output && /ر\.ع/.test(trimmed)) output = trimmed.replace(/ر\.ع/g, 'OMR').replace('ابتداءً من', 'From');
    return output ? value.replace(trimmed, output) : null;
  }
  function applyNode(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    if (node.__drAr === undefined) node.__drAr = node.nodeValue;
    if (lang() === 'ar') { node.nodeValue = node.__drAr; return; }
    const translated = translateText(node.__drAr);
    if (translated !== null) node.nodeValue = translated;
  }
  function walk(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) applyNode(node);
  }
  function translateAttributes(root = document) {
    root.querySelectorAll('[aria-label],[title]').forEach(element => {
      ['aria-label','title'].forEach(attribute => {
        const value = element.getAttribute(attribute);
        if (value && D[value]) element.setAttribute(attribute, D[value]);
      });
    });
  }
  function apply() {
    const english = lang() === 'en';
    document.documentElement.lang = english ? 'en' : 'ar';
    document.documentElement.dir = english ? 'ltr' : 'rtl';
    if (english && TITLES[document.title]) document.title = TITLES[document.title];
    walk();
    if (english) translateAttributes();
    document.querySelectorAll('.lang').forEach(link => {
      link.textContent = english ? 'AR | EN' : 'EN | AR';
      link.onclick = event => {
        event.preventDefault();
        localStorage.setItem('dr_lang', english ? 'ar' : 'en');
        location.reload();
      };
    });
  }
  new MutationObserver(mutations => {
    if (lang() !== 'en') return;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) applyNode(node);
        else if (node.nodeType === Node.ELEMENT_NODE) { walk(node); translateAttributes(node); }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
