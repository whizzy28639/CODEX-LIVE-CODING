'use strict';
// CODEX PLAYGROUND access-control server (Node.js built-ins only)
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadEnv();
const PORT = Number(process.env.PORT || 8080);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const DB_FILE = path.join(ROOT, 'data', 'access-requests.json');
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ requests: [] }, null, 2));
let db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const adminSessions = new Map();
const visitorSessions = new Map();
const loginAttempts = new Map();
const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon' };
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const token = () => crypto.randomBytes(32).toString('hex');
const cookie = (name, value, maxAge) => `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
function save() { const tmp = DB_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db, null, 2)); fs.renameSync(tmp, DB_FILE); }
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim()).filter(Boolean).map(x => { const i=x.indexOf('='); return [x.slice(0,i),x.slice(i+1)]; })); }
function json(res, status, data, headers={}) { res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', ...headers }); res.end(JSON.stringify(data)); }
function body(req) { return new Promise((resolve,reject)=>{ let raw=''; req.on('data',c=>{raw+=c; if(raw.length>20000){reject(new Error('Request too large')); req.destroy();}}); req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{});}catch{reject(new Error('Invalid JSON'));}}); req.on('error',reject); }); }
function visitor(req) { const c=cookies(req); const id=c.codex_visitor; if(!id) return null; const r=db.requests.find(x=>x.visitorKey===hash(id)); return r ? {requestId:r.id} : null; }
function admin(req) { const c=cookies(req); const s=c.codex_admin; return s && adminSessions.has(s); }
function statusFor(v) { if (!v) return { status:'none' }; const r=db.requests.find(x=>x.id===v.requestId); return r ? { status:r.status, name:r.name } : { status:'none' }; }
function sameOrigin(req) { const origin=req.headers.origin; if(!origin) return true; try { return new URL(origin).host === req.headers.host; } catch { return false; } }
const server = http.createServer(async (req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    if (!sameOrigin(req)) return json(res,403,{error:'Invalid origin'});
    try {
      if (req.method==='GET' && url.pathname==='/api/access/status') {
        const v=visitor(req); return json(res,200,{...statusFor(v), admin:admin(req)});
      }
      if (req.method==='POST' && url.pathname==='/api/access/request') {
        const b=await body(req); const name=String(b.name||'').trim().slice(0,80); const email=String(b.email||'').trim().slice(0,160); const reason=String(b.reason||'').trim().slice(0,1000);
        if(name.length<2 || reason.length<5) return json(res,400,{error:'Please enter your name and a short reason for requesting access.'});
        let vid=cookies(req).codex_visitor; if(!vid || !visitorSessions.has(vid)) vid=token();
        const existing=db.requests.find(x=>x.visitorKey===hash(vid)); if(existing && ['pending','approved'].includes(existing.status)) return json(res,409,{error:'A request already exists for this browser.',status:existing.status});
        const record={id:crypto.randomUUID(),visitorKey:hash(vid),name,email,reason,status:'pending',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
        db.requests.unshift(record); save();
        return json(res,201,{ok:true,status:'pending'}, {'Set-Cookie':cookie('codex_visitor',vid,60*60*24*365)});
      }
      if (req.method==='POST' && url.pathname==='/api/admin/login') {
        const ip=req.socket.remoteAddress||'unknown'; const a=loginAttempts.get(ip)||{count:0,until:0};
        if(a.until>Date.now()) return json(res,429,{error:'Too many attempts. Try again later.'});
        const b=await body(req); if(!ADMIN_PASSWORD) return json(res,503,{error:'Admin password is not configured on the server.'});
        const supplied=String(b.password||''); const ok=crypto.timingSafeEqual(Buffer.from(hash(supplied)),Buffer.from(hash(ADMIN_PASSWORD)));
        if(!ok){a.count++; if(a.count>=6){a.count=0;a.until=Date.now()+10*60*1000;} loginAttempts.set(ip,a); return json(res,401,{error:'Incorrect admin password.'});}
        loginAttempts.delete(ip); const sid=token(); adminSessions.set(sid,{createdAt:Date.now()});
        return json(res,200,{ok:true},{'Set-Cookie':cookie('codex_admin',sid,60*60*8)});
      }
      if (req.method==='POST' && url.pathname==='/api/admin/logout') { const sid=cookies(req).codex_admin; if(sid) adminSessions.delete(sid); return json(res,200,{ok:true},{'Set-Cookie':cookie('codex_admin','',0)}); }
      if (url.pathname.startsWith('/api/admin/')) {
        if(!admin(req)) return json(res,401,{error:'Admin authentication required.'});
        if(req.method==='GET' && url.pathname==='/api/admin/requests') return json(res,200,{requests:db.requests});
        const m=url.pathname.match(/^\/api\/admin\/requests\/([a-f0-9-]+)\/(approve|reject|suspend|restore|revoke|delete)$/);
        if(req.method==='POST' && m){const [,id,action]=m; const r=db.requests.find(x=>x.id===id); if(!r) return json(res,404,{error:'Request not found.'});
          if(action==='approve') r.status='approved'; if(action==='reject') r.status='rejected'; if(action==='suspend') r.status='suspended'; if(action==='restore') r.status='approved'; if(action==='revoke') r.status='revoked'; if(action==='delete') db.requests=db.requests.filter(x=>x.id!==id);
          r.updatedAt=new Date().toISOString(); save(); return json(res,200,{ok:true}); }
        return json(res,404,{error:'Unknown admin endpoint.'});
      }
      return json(res,404,{error:'Not found'});
    } catch(e) { return json(res,400,{error:e.message||'Request failed'}); }
  }
  let pathname=decodeURIComponent(url.pathname); if(pathname==='/') pathname='/index.html';
  const publicFiles = new Set(['/index.html','/styles.css','/app.js','/access.js','/manifest.json']);
  if(!publicFiles.has(pathname)) return json(res,404,{error:'Not found'});
  const file=path.resolve(ROOT,'.'+pathname);
  if(!file.startsWith(ROOT+path.sep)) return json(res,404,{error:'Not found'});
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain'});return res.end('Not found');} res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(data);});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`CODEX PLAYGROUND running on http://localhost:${PORT}`));
