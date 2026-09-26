require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');
const path = require('path');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
if (!process.env.OWNER_USERNAME || !process.env.OWNER_PASSWORD) {
  console.error('OWNER_USERNAME and OWNER_PASSWORD are required');
  process.exit(1);
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET (minimum 32 characters) is required');
  process.exit(1);
}

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  max: Number(process.env.DB_POOL_MAX || 5),
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '8mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

const ALL_PERMS = ['product_add','product_edit','product_delete','offer_manage','picks_manage','settings_manage'];

async function initDb(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner','manager')),
      permissions TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_attempts (
      rate_key TEXT PRIMARY KEY,
      attempts INT NOT NULL DEFAULT 0,
      window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      blocked_until TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL CHECK (category IN ('بقلاوات','قشاطي','كنافة','نواشف')),
      image_data TEXT NOT NULL DEFAULT '',
      is_pick BOOLEAN NOT NULL DEFAULT FALSE,
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS product_variants (
      id UUID PRIMARY KEY,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      price_omr NUMERIC(10,3) NOT NULL CHECK (price_omr >= 0),
      sort_order INT NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS offers (
      id UUID PRIMARY KEY,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      value_text TEXT NOT NULL DEFAULT '',
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  const exists = await pool.query("SELECT id FROM admins WHERE role='owner' LIMIT 1");
  if (!exists.rowCount) {
    const hash = await bcrypt.hash(process.env.OWNER_PASSWORD, 12);
    await pool.query('INSERT INTO admins(id,username,password_hash,role,permissions) VALUES($1,$2,$3,$4,$5)', [crypto.randomUUID(), process.env.OWNER_USERNAME, hash, 'owner', ALL_PERMS]);
  }
  await pool.query(`INSERT INTO settings(key,value) VALUES
    ('whatsapp','+96892415565'),
    ('address','سلطنة عمان، مسقط، شارع 18 نوفمبر، مقابل ستاربكس')
    ON CONFLICT (key) DO NOTHING`);
}

const dbReady = initDb();
app.use(async (req,res,next)=>{
  try { await dbReady; next(); }
  catch (e) { next(e); }
});

function mapProduct(rows, variants){
  return rows.map(p => ({
    id:p.id, ar:p.name_ar, en:p.name_en, category:p.category,
    image:p.image_data, pick:p.is_pick, visible:p.is_visible,
    variants:variants.filter(v=>v.product_id===p.id).sort((a,b)=>a.sort_order-b.sort_order).map(v=>({id:v.id,size:v.label,price:Number(v.price_omr)}))
  }));
}
async function getProducts(where='WHERE is_visible=TRUE', params=[]){
  const p = await pool.query(`SELECT * FROM products ${where} ORDER BY created_at DESC`, params);
  if (!p.rowCount) return [];
  const ids = p.rows.map(x=>x.id);
  const v = await pool.query('SELECT * FROM product_variants WHERE product_id = ANY($1::uuid[]) ORDER BY sort_order ASC', [ids]);
  return mapProduct(p.rows, v.rows);
}

function sessionHash(token){
  return crypto.createHmac('sha256', process.env.SESSION_SECRET).update(token).digest('hex');
}
function loginRateKey(req, username){
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || req.ip || 'unknown';
  return crypto.createHash('sha256').update(`${ip}|${String(username || '').toLowerCase()}`).digest('hex');
}
async function recordFailedLogin(rateKey){
  await pool.query(`
    INSERT INTO auth_attempts(rate_key,attempts,window_started_at,blocked_until,updated_at)
    VALUES($1,1,NOW(),NULL,NOW())
    ON CONFLICT(rate_key) DO UPDATE SET
      attempts = CASE
        WHEN auth_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1
        ELSE auth_attempts.attempts + 1
      END,
      window_started_at = CASE
        WHEN auth_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN NOW()
        ELSE auth_attempts.window_started_at
      END,
      blocked_until = CASE
        WHEN auth_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN NULL
        WHEN auth_attempts.attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
        ELSE auth_attempts.blocked_until
      END,
      updated_at = NOW()
  `, [rateKey]);
}
async function auth(req,res,next){
  const token = req.cookies.dr_session;
  if (!token) return res.status(401).json({error:'unauthorized'});
  const hash = sessionHash(token);
  const q = await pool.query(`SELECT a.id,a.username,a.role,a.permissions FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=$1 AND s.expires_at>NOW()`, [hash]);
  if(!q.rowCount) return res.status(401).json({error:'unauthorized'});
  req.admin=q.rows[0]; next();
}
function can(perm){return (req,res,next)=> req.admin.role==='owner'||(req.admin.permissions||[]).includes(perm) ? next() : res.status(403).json({error:'forbidden'});}
function ownerOnly(req,res,next){return req.admin.role==='owner' ? next() : res.status(403).json({error:'owner_only'});}

app.get('/api/health', async(req,res)=>{try{await pool.query('SELECT 1');res.json({ok:true,service:'dama-rose'})}catch{res.status(503).json({ok:false})}});

app.get('/api/products', async(req,res,next)=>{try{const pick=req.query.pick==='1';res.json(await getProducts(pick?'WHERE is_visible=TRUE AND is_pick=TRUE':'WHERE is_visible=TRUE'));}catch(e){next(e)}});
app.get('/api/products/:id', async(req,res,next)=>{try{const xs=await getProducts('WHERE id=$1 AND is_visible=TRUE',[req.params.id]); if(!xs.length)return res.status(404).json({error:'not_found'});res.json(xs[0]);}catch(e){next(e)}});
app.get('/api/offers', async(req,res,next)=>{try{const q=await pool.query('SELECT id,title_ar AS ar,title_en AS en,body AS text,value_text AS value FROM offers WHERE is_visible=TRUE ORDER BY created_at DESC');res.json(q.rows);}catch(e){next(e)}});
app.get('/api/settings', async(req,res,next)=>{try{const q=await pool.query('SELECT key,value FROM settings');res.json(Object.fromEntries(q.rows.map(x=>[x.key,x.value])));}catch(e){next(e)}});

app.post('/api/auth/login', async(req,res,next)=>{try{
  const {username,password}=req.body||{};
  const cleanUsername=String(username||'').trim();
  const rateKey=loginRateKey(req, cleanUsername);
  const rl=await pool.query('SELECT blocked_until FROM auth_attempts WHERE rate_key=$1',[rateKey]);
  if(rl.rowCount && rl.rows[0].blocked_until && new Date(rl.rows[0].blocked_until)>new Date()){
    return res.status(429).json({error:'too_many_attempts',retry_after_seconds:900});
  }
  const q=await pool.query('SELECT * FROM admins WHERE username=$1',[cleanUsername]);
  const valid=q.rowCount && await bcrypt.compare(String(password||''),q.rows[0].password_hash);
  if(!valid){
    await recordFailedLogin(rateKey);
    return res.status(401).json({error:'invalid_credentials'});
  }
  await pool.query('DELETE FROM auth_attempts WHERE rate_key=$1',[rateKey]);
  const token=crypto.randomBytes(32).toString('hex');
  const hash=sessionHash(token);
  await pool.query('DELETE FROM sessions WHERE expires_at<=NOW()');
  await pool.query('INSERT INTO sessions(token_hash,admin_id,expires_at) VALUES($1,$2,NOW()+INTERVAL \'7 days\')',[hash,q.rows[0].id]);
  res.cookie('dr_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:7*24*3600*1000,path:'/'});
  res.json({id:q.rows[0].id,username:q.rows[0].username,role:q.rows[0].role,permissions:q.rows[0].permissions});
}catch(e){next(e)}});
app.post('/api/auth/logout', auth, async(req,res,next)=>{try{const token=req.cookies.dr_session;const hash=sessionHash(token);await pool.query('DELETE FROM sessions WHERE token_hash=$1',[hash]);res.clearCookie('dr_session',{path:'/'});res.json({ok:true});}catch(e){next(e)}});
app.get('/api/auth/me', auth, (req,res)=>res.json(req.admin));

app.get('/api/admin/products', auth, async(req,res,next)=>{try{res.json(await getProducts(''));}catch(e){next(e)}});
app.post('/api/admin/products', auth, can('product_add'), async(req,res,next)=>{
  const client=await pool.connect();
  try{
    const {ar,en='',category,image='',pick=false,variants=[]}=req.body||{}; if(!ar||!['بقلاوات','قشاطي','كنافة','نواشف'].includes(category)||!variants.length)return res.status(400).json({error:'invalid_product'});
    const id=crypto.randomUUID(); const effectivePick=(req.admin.role==='owner'||(req.admin.permissions||[]).includes('picks_manage'))?!!pick:false; await client.query('BEGIN');
    await client.query('INSERT INTO products(id,name_ar,name_en,category,image_data,is_pick) VALUES($1,$2,$3,$4,$5,$6)',[id,ar,en,category,image,effectivePick]);
    for(let i=0;i<variants.length;i++){const v=variants[i];await client.query('INSERT INTO product_variants(id,product_id,label,price_omr,sort_order) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),id,v.size,Number(v.price),i]);}
    await client.query('COMMIT'); res.json((await getProducts('WHERE id=$1',[id]))[0]);
  }catch(e){try{await client.query('ROLLBACK')}catch{};next(e)} finally {client.release()}
});
app.put('/api/admin/products/:id', auth, can('product_edit'), async(req,res,next)=>{
  const client=await pool.connect();
  try{
    const {ar,en='',category,image='',pick=false,variants=[]}=req.body||{}; if(!ar||!['بقلاوات','قشاطي','كنافة','نواشف'].includes(category)||!variants.length)return res.status(400).json({error:'invalid_product'});
    await client.query('BEGIN');
    let effectivePick=!!pick; if(req.admin.role!=='owner'&&!(req.admin.permissions||[]).includes('picks_manage')){const cur=await client.query('SELECT is_pick FROM products WHERE id=$1',[req.params.id]);effectivePick=!!cur.rows[0]?.is_pick;}
    await client.query('UPDATE products SET name_ar=$1,name_en=$2,category=$3,image_data=$4,is_pick=$5,updated_at=NOW() WHERE id=$6',[ar,en,category,image,effectivePick,req.params.id]);
    await client.query('DELETE FROM product_variants WHERE product_id=$1',[req.params.id]);
    for(let i=0;i<variants.length;i++){const v=variants[i];await client.query('INSERT INTO product_variants(id,product_id,label,price_omr,sort_order) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),req.params.id,v.size,Number(v.price),i]);}
    await client.query('COMMIT'); res.json((await getProducts('WHERE id=$1',[req.params.id]))[0]);
  }catch(e){try{await client.query('ROLLBACK')}catch{};next(e)} finally {client.release()}
});
app.delete('/api/admin/products/:id', auth, can('product_delete'), async(req,res,next)=>{try{await pool.query('DELETE FROM products WHERE id=$1',[req.params.id]);res.json({ok:true});}catch(e){next(e)}});

app.get('/api/admin/offers', auth, async(req,res,next)=>{try{const q=await pool.query('SELECT id,title_ar AS ar,title_en AS en,body AS text,value_text AS value FROM offers ORDER BY created_at DESC');res.json(q.rows);}catch(e){next(e)}});
app.post('/api/admin/offers', auth, can('offer_manage'), async(req,res,next)=>{try{const {ar,en='',text='',value=''}=req.body||{};if(!ar)return res.status(400).json({error:'invalid_offer'});const id=crypto.randomUUID();const q=await pool.query('INSERT INTO offers(id,title_ar,title_en,body,value_text) VALUES($1,$2,$3,$4,$5) RETURNING id,title_ar AS ar,title_en AS en,body AS text,value_text AS value',[id,ar,en,text,value]);res.json(q.rows[0]);}catch(e){next(e)}});
app.put('/api/admin/offers/:id', auth, can('offer_manage'), async(req,res,next)=>{try{const {ar,en='',text='',value=''}=req.body||{};const q=await pool.query('UPDATE offers SET title_ar=$1,title_en=$2,body=$3,value_text=$4,updated_at=NOW() WHERE id=$5 RETURNING id,title_ar AS ar,title_en AS en,body AS text,value_text AS value',[ar,en,text,value,req.params.id]);res.json(q.rows[0]);}catch(e){next(e)}});
app.delete('/api/admin/offers/:id', auth, can('offer_manage'), async(req,res,next)=>{try{await pool.query('DELETE FROM offers WHERE id=$1',[req.params.id]);res.json({ok:true});}catch(e){next(e)}});

app.get('/api/admin/managers', auth, ownerOnly, async(req,res,next)=>{try{const q=await pool.query('SELECT id,username,role,permissions FROM admins ORDER BY created_at ASC');res.json(q.rows);}catch(e){next(e)}});
app.post('/api/admin/managers', auth, ownerOnly, async(req,res,next)=>{try{const {username,password,permissions=[]}=req.body||{};if(String(username||'').trim().length<3||String(password||'').length<6)return res.status(400).json({error:'invalid_manager'});const hash=await bcrypt.hash(password,12);const q=await pool.query('INSERT INTO admins(id,username,password_hash,role,permissions) VALUES($1,$2,$3,$4,$5) RETURNING id,username,role,permissions',[crypto.randomUUID(),username.trim(),hash,'manager',permissions]);res.json(q.rows[0]);}catch(e){next(e)}});
app.put('/api/admin/managers/:id', auth, ownerOnly, async(req,res,next)=>{try{const {username,password,permissions=[]}=req.body||{};const target=await pool.query('SELECT role FROM admins WHERE id=$1',[req.params.id]);if(!target.rowCount||target.rows[0].role==='owner')return res.status(400).json({error:'cannot_edit_owner'});if(password){const hash=await bcrypt.hash(password,12);await pool.query('UPDATE admins SET username=$1,password_hash=$2,permissions=$3 WHERE id=$4',[username.trim(),hash,permissions,req.params.id]);}else{await pool.query('UPDATE admins SET username=$1,permissions=$2 WHERE id=$3',[username.trim(),permissions,req.params.id]);}const q=await pool.query('SELECT id,username,role,permissions FROM admins WHERE id=$1',[req.params.id]);res.json(q.rows[0]);}catch(e){next(e)}});
app.delete('/api/admin/managers/:id', auth, ownerOnly, async(req,res,next)=>{try{const q=await pool.query("DELETE FROM admins WHERE id=$1 AND role<>'owner' RETURNING id",[req.params.id]);if(!q.rowCount)return res.status(400).json({error:'cannot_delete_owner'});res.json({ok:true});}catch(e){next(e)}});
app.put('/api/admin/settings', auth, can('settings_manage'), async(req,res,next)=>{try{for(const [k,v] of Object.entries(req.body||{})){if(['whatsapp','address'].includes(k))await pool.query('INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',[k,String(v)]);}res.json({ok:true});}catch(e){next(e)}});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'server_error'});});

if (require.main === module) {
  dbReady
    .then(()=>app.listen(process.env.PORT||3000,()=>console.log('Dama Rose server ready')))
    .catch(err=>{console.error(err);process.exit(1)});
}

module.exports = app;
