(()=> {
const D={
"الرئيسية":"Home","المنتجات":"Products","العروض":"Offers","من نحن":"About us","تواصل معنا":"Contact us",
"حلويات عربية فاخرة • مسقط":"Luxury Arabic sweets • Muscat",
"مذاق أصيل...":"Authentic taste...","بروح التراث الشامي":"with the spirit of Damascus",
"تجربة راقية تجمع بين وصفاتنا التقليدية، جودة المكونات، والتقديم الفاخر الذي يليق بكل مناسبة.":"A refined experience combining traditional recipes, quality ingredients, and elegant presentation for every occasion.",
"تسوق الآن ←":"Shop now ←","استكشف المنتجات":"Explore products","جودة عالية":"High quality","مكونات مختارة بعناية":"Carefully selected ingredients",
"تغليف فاخر":"Premium packaging","مناسب للهدايا والمناسبات":"Perfect for gifts and occasions","توصيل سريع":"Fast delivery","داخل مسقط والمناطق":"Across Muscat and nearby areas",
"وصفات أصيلة":"Authentic recipes","نكهة شامية مميزة":"Distinctive Levantine flavor","تصفح المنتجات":"Browse products","اختر القسم الذي يناسب ذوقك":"Choose the category that suits your taste",
"عرض الكل ←":"View all ←","بقلاوات":"Baklava","قشاطي":"Cream sweets","كنافة":"Kunafa","نواشف":"Dry sweets",
"منتجاتنا":"Our products","جميع المنتجات المتوفرة":"All available products","ما نختاره لك":"Our picks for you","يتجدد يوميًا":"Updated daily","تحديث يومي":"Daily update",
"مساحة خاصة للمنتجات التي نختارها لك، ويمكن تحديثها يوميًا وإضافة المنتجات إليها من لوحة الإدارة.":"A daily selection of products chosen for you and managed from the dashboard.",
"لم تتم إضافة منتجات اليوم بعد.":"No products have been selected today yet.","عرض خاص":"Special offer","هدايا داما روز":"Dama Rose gifts",
"بوكسات فاخرة للمناسبات والضيافة، بتنسيق أنيق يليق بالهدية ويترك انطباعًا مميزًا.":"Premium gift boxes for occasions and hospitality, presented with an elegant touch.",
"عرض العروض ←":"View offers ←","حكاية مذاق... وهوية":"A story of taste and identity","اعرف المزيد ←":"Learn more ←",
"روابط سريعة":"Quick links","تواصل معنا":"Contact us","سلطنة عمان – مسقط – شارع 18 نوفمبر – مقابل ستاربكس":"Oman – Muscat – 18 November Street – opposite Starbucks",
"جميع الحقوق محفوظة.":"All rights reserved.","العودة للمنتجات":"Back to products","اسم المنتج":"Product name","اختر الحجم":"Choose size","السعر":"Price","الكمية":"Quantity",
"أضف للسلة":"Add to cart","يتم اختيار الحجم أولًا ثم إضافة المنتج إلى السلة.":"Choose a size first, then add the product to your cart.","تمت إضافة المنتج إلى السلة":"Product added to cart",
"المنتج غير موجود":"Product not found","اختر الحجم":"Choose size","العروض":"Offers","هنا تظهر العروض التي تضيفها أنت لاحقًا من لوحة الإدارة، ويمكن تحديثها أو إيقافها في أي وقت.":"Offers added from the dashboard appear here and can be updated anytime.",
"عروض داما روز":"Dama Rose offers","قسم مستقل للعروض الموسمية والخاصة.":"Seasonal and special offers.","لا توجد عروض متاحة حاليًا.":"No offers are currently available.","عرض":"Offer","تصفح المنتجات":"Browse products",
"سلة الطلب":"Your cart","راجع المنتجات والكميات قبل إرسال الطلب عبر واتساب.":"Review items and quantities before sending your order on WhatsApp.","متابعة التسوق":"Continue shopping",
"السلة فارغة":"Your cart is empty","لم تضف أي منتجات إلى طلبك بعد.":"You have not added any products yet.","الإجمالي":"Total","إرسال الطلب عبر واتساب":"Send order via WhatsApp",
"رقم واتساب غير مضبوط بعد.":"WhatsApp number is not configured yet.","إضافة منتجات أخرى":"+ Add more products","حذف":"Remove","الوحدة":"unit",
"نبذة عن داما روز":"About Dama Rose","حكاية مذاق شامي أصيل نقدّمه بروح عصرية راقية، مع اهتمام بالتفاصيل وجودة التقديم لنصنع تجربة تليق بكل مناسبة.":"Authentic Levantine sweets presented with a refined modern touch, attention to detail, and quality for every occasion.",
"داما روز":"Dama Rose","نقدّم الحلويات العربية والشامية بروح الأصالة ولمسة عصرية راقية، مع اهتمام بالتفاصيل وجودة التقديم، لنصنع تجربة تليق بكل مناسبة.":"We offer Arabic and Levantine sweets with an authentic spirit and a refined modern touch, focusing on detail and presentation for every occasion.",
"الموقع":"Location","واتساب":"WhatsApp","فتح في الخرائط":"Open in Maps","العودة للرئيسية":"Back to home"
};
const lang=()=>localStorage.getItem('dr_lang')||'ar';
function transText(s){
 const t=s.trim(); if(!t)return s;
 let out=D[t];
 if(!out&&/^\d+ عرض$/.test(t))out=t.replace('عرض','offers');
 if(!out&&/ر\.ع/.test(t))out=t.replace(/ر\.ع/g,'OMR').replace('ابتداءً من','From');
 if(!out)return null;
 return s.replace(t,out);
}
function applyNode(n){
 if(n.nodeType!==3)return;
 if(!n.__drAr)n.__drAr=n.nodeValue;
 if(lang()==='ar'){n.nodeValue=n.__drAr;return}
 const v=transText(n.__drAr); if(v!==null)n.nodeValue=v;
}
function walk(root=document.body){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())applyNode(n)}
function apply(){
 document.documentElement.lang=lang();document.documentElement.dir=lang()==='en'?'ltr':'rtl';
 walk();
 document.querySelectorAll('.lang').forEach(a=>{a.textContent=lang()==='en'?'AR | EN':'EN | AR';a.onclick=e=>{e.preventDefault();localStorage.setItem('dr_lang',lang()==='ar'?'en':'ar');location.reload()}});
}
new MutationObserver(ms=>{if(lang()!=='en')return;for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===3)applyNode(n);else if(n.nodeType===1)walk(n)}}).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();