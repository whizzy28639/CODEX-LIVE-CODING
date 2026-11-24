/* CODEX PLAYGROUND access gate and admin console */
(() => {
  'use strict';
  let resolveAccess;
  window.CODEX_ACCESS_GRANTED = false;
  window.CODEX_ACCESS_READY = new Promise(resolve => { resolveAccess = resolve; });
  const api = async (url, options={}) => {
    const response = await fetch(url, { credentials:'same-origin', headers:{'Content-Type':'application/json', ...(options.headers||{})}, ...options });
    const data = await response.json().catch(()=>({error:'Unexpected server response'}));
    if(!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  };
  const el = (tag, attrs={}, html='') => { const n=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>k==='class'?n.className=v:k==='text'?n.textContent=v:n.setAttribute(k,v)); if(html)n.innerHTML=html; return n; };
  const style = `
  #access-gate{position:fixed;inset:0;z-index:99999;background:#090a0d;color:#e8e8ed;display:flex;align-items:center;justify-content:center;padding:22px;font-family:Inter,system-ui,sans-serif;overflow:auto}
  #access-gate *{box-sizing:border-box} .ag-card{width:min(100%,490px);background:#12151b;border:1px solid #29313b;border-radius:18px;padding:28px;box-shadow:0 25px 90px #0009}
  .ag-brand{color:#00d4ff;font-weight:900;letter-spacing:2px;font-size:13px;margin-bottom:22px}.ag-card h1{font-size:25px;margin:0 0 9px}.ag-sub{color:#9ba7b5;line-height:1.55;margin:0 0 22px;font-size:14px}
  .ag-field{display:block;margin:14px 0}.ag-field span{display:block;font-size:12px;color:#aeb9c7;margin-bottom:7px}.ag-field input,.ag-field textarea{width:100%;background:#0b0e13;border:1px solid #303946;border-radius:9px;color:#fff;padding:13px;font:inherit;outline:none}.ag-field input:focus,.ag-field textarea:focus{border-color:#00bfe8}.ag-field textarea{min-height:95px;resize:vertical}
  .ag-btn{border:0;border-radius:9px;background:#00c5ed;color:#041116;font-weight:800;padding:13px 16px;cursor:pointer;width:100%;font-size:14px}.ag-btn.secondary{background:#202833;color:#dce7f1;border:1px solid #34404d}.ag-btn.danger{background:#49242a;color:#ffd8dc}.ag-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.ag-row .ag-btn{flex:1}.ag-link{border:0;background:none;color:#00c5ed;padding:13px 0;cursor:pointer}.ag-msg{margin-top:14px;color:#f6bd60;font-size:13px;line-height:1.5}.ag-status{border:1px solid #34404d;background:#0b0e13;border-radius:10px;padding:15px;color:#b9c5d2;line-height:1.6}.ag-admin{position:fixed;top:14px;left:14px;z-index:100000;background:#17212b;color:#00d4ff;border:1px solid #315063;border-radius:8px;padding:9px 12px;font-weight:800;font-size:11px;letter-spacing:.5px;cursor:pointer}
  .ag-dash{width:min(100%,1050px);max-height:92vh;overflow:auto}.ag-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:18px 0}.ag-stat{background:#0b0e13;border:1px solid #293441;padding:13px;border-radius:10px}.ag-stat b{display:block;font-size:23px;color:#00d4ff}.ag-stat small{color:#9ba7b5}.ag-list{display:grid;gap:10px}.ag-item{background:#0b0e13;border:1px solid #293441;border-radius:11px;padding:14px}.ag-item-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.ag-item p{color:#aeb9c7;font-size:13px;line-height:1.5;margin:8px 0}.ag-badge{font-size:11px;text-transform:uppercase;color:#00d4ff}.ag-actions{display:flex;gap:7px;flex-wrap:wrap}.ag-actions button{width:auto;padding:8px 11px;font-size:12px}.ag-top{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}.ag-top button{width:auto}
  @media(max-width:520px){.ag-card{padding:21px}.ag-card h1{font-size:22px}.ag-admin{top:8px;left:8px}}
  `;
  function mount() {
    if(document.getElementById('access-gate')) return;
    const css=el('style'); css.textContent=style; document.head.appendChild(css);
    const gate=el('div',{id:'access-gate'}); gate.innerHTML='<section class="ag-card"><div class="ag-brand">CODEX PLAYGROUND</div><div id="ag-content"></div></section>';
    let admin=document.getElementById('ag-admin-trigger'); if(!admin){admin=el('button',{id:'ag-admin-trigger',class:'ag-admin',text:'ADMIN LOGIN'}); admin.addEventListener('click',showAdminLogin);}
    document.body.append(gate); if(!admin.isConnected) document.body.append(admin);
    return gate.querySelector('#ag-content');
  }
  let content;
  function showForm(message='') {
    content.innerHTML=`<h1>Request access</h1><p class="ag-sub">CODEX PLAYGROUND is access-controlled. Submit a request and the administrator will review it.</p>
      <form id="ag-request"><label class="ag-field"><span>FULL NAME</span><input name="name" required minlength="2" maxlength="80" placeholder="Your name"></label>
      <label class="ag-field"><span>EMAIL ADDRESS (OPTIONAL)</span><input name="email" type="email" maxlength="160" placeholder="you@example.com"></label>
      <label class="ag-field"><span>WHY WOULD YOU LIKE ACCESS?</span><textarea name="reason" required minlength="5" maxlength="1000" placeholder="Tell us briefly..."></textarea></label>
      <button class="ag-btn" type="submit">SUBMIT ACCESS REQUEST</button></form><div class="ag-msg" id="ag-msg">${message}</div>`;
    content.querySelector('#ag-request').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const btn=e.currentTarget.querySelector('button');btn.disabled=true;btn.textContent='Submitting...';try{await api('/api/access/request',{method:'POST',body:JSON.stringify(Object.fromEntries(f))});showPending();}catch(err){content.querySelector('#ag-msg').textContent=err.message;btn.disabled=false;btn.textContent='SUBMIT ACCESS REQUEST';}});
  }
  function showPending(status='pending') {
    const title=status==='approved'?'Access approved':'Request submitted';
    content.innerHTML=`<h1>${title}</h1><p class="ag-sub">${status==='approved'?'Your access has been approved. Opening your coding workspace...':'Your request is awaiting administrator approval. You can leave this page open; it will update automatically when a decision is made.'}</p><div class="ag-status">STATUS: <strong>${status.toUpperCase()}</strong><br><small>Access is attached to this browser. Keep this browser data to retain your approval.</small></div><div class="ag-msg" id="ag-msg"></div>`;
  }
  async function checkStatus() {
    try { const s=await api('/api/access/status'); if(s.status==='approved'){grant();return;} if(['pending','rejected','suspended','revoked'].includes(s.status)){showPending(s.status);return;} showForm(); }
    catch(e){content.innerHTML=`<h1>Server unavailable</h1><p class="ag-sub">The access service could not be reached. Open CODEX PLAYGROUND through its Node.js server, not by opening index.html directly.</p><div class="ag-msg">${e.message}</div>`;}
  }
  function grant(){window.CODEX_ACCESS_GRANTED=true;const gate=document.getElementById('access-gate');if(gate)gate.remove();resolveAccess(true);}
  async function showAdminLogin(){
    if(!document.getElementById('access-gate')) content=mount();
    content.innerHTML=`<h1>Administrator login</h1><p class="ag-sub">Enter the administrator access password to manage requests.</p><form id="ag-admin-form"><label class="ag-field"><span>ADMIN PASSWORD</span><input name="password" type="password" required autocomplete="current-password" placeholder="Enter admin password"></label><button class="ag-btn" type="submit">OPEN ADMIN DASHBOARD</button></form><div class="ag-msg" id="ag-admin-msg"></div><button class="ag-link" id="ag-back">← Back to access request</button>`;
    content.querySelector('#ag-back').onclick=checkStatus;
    content.querySelector('form').onsubmit=async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('button');btn.disabled=true;try{await api('/api/admin/login',{method:'POST',body:JSON.stringify({password:new FormData(e.currentTarget).get('password')})});await showDashboard();}catch(err){content.querySelector('#ag-admin-msg').textContent=err.message;btn.disabled=false;}};
  }
  async function showDashboard(){
    try{const data=await api('/api/admin/requests');const reqs=data.requests||[];const count=s=>reqs.filter(r=>r.status===s).length;
      content.innerHTML=`<div class="ag-dash"><div class="ag-top"><div><h1>Admin dashboard</h1><p class="ag-sub">Manage CODEX PLAYGROUND access requests.</p></div><button class="ag-btn secondary" id="ag-logout">LOG OUT</button></div>
      <div class="ag-stats"><div class="ag-stat"><b>${reqs.length}</b><small>Total requests</small></div><div class="ag-stat"><b>${count('pending')}</b><small>Pending</small></div><div class="ag-stat"><b>${count('approved')}</b><small>Approved</small></div><div class="ag-stat"><b>${count('rejected')}</b><small>Rejected</small></div><div class="ag-stat"><b>${count('suspended')}</b><small>Suspended</small></div></div>
      <label class="ag-field"><span>SEARCH REQUESTS</span><input id="ag-search" placeholder="Search name or email..."></label><div class="ag-list" id="ag-list"></div></div>`;
      const list=content.querySelector('#ag-list'); const render=()=>{const q=content.querySelector('#ag-search').value.toLowerCase();const filtered=reqs.filter(r=>(r.name+' '+r.email+' '+r.status).toLowerCase().includes(q));list.innerHTML='';if(!filtered.length){list.innerHTML='<div class="ag-status">No requests found.</div>';return;}filtered.forEach(r=>{const item=el('article',{class:'ag-item'});const date=new Date(r.createdAt).toLocaleString();item.innerHTML=`<div class="ag-item-head"><strong>${escapeHtml(r.name)}</strong><span class="ag-badge">${escapeHtml(r.status)}</span></div><p>${escapeHtml(r.email||'No email provided')}<br>${escapeHtml(date)}<br>${escapeHtml(r.reason)}</p><div class="ag-actions"></div>`;const actions=item.querySelector('.ag-actions');const buttons={pending:[['Approve','approve'],['Reject','reject'],['Delete','delete']],approved:[['Suspend','suspend'],['Revoke','revoke']],suspended:[['Restore access','restore'],['Revoke','revoke']],rejected:[['Approve','approve'],['Delete','delete']],revoked:[['Restore access','restore'],['Delete','delete']]};(buttons[r.status]||[]).forEach(([label,action])=>{const b=el('button',{class:'ag-btn '+(['reject','suspend','revoke','delete'].includes(action)?'danger':'secondary'),text:label});b.onclick=()=>changeRequest(r.id,action);actions.appendChild(b);});list.appendChild(item);});};
      content.querySelector('#ag-search').addEventListener('input',render);render();content.querySelector('#ag-logout').onclick=async()=>{await api('/api/admin/logout',{method:'POST'});await checkStatus();};
    }catch(e){if(e.message.includes('authentication'))showAdminLogin();else content.innerHTML=`<h1>Admin dashboard unavailable</h1><p class="ag-msg">${escapeHtml(e.message)}</p><button class="ag-btn secondary" id="ag-retry">Retry</button>`;const b=content.querySelector('#ag-retry');if(b)b.onclick=showDashboard;}
  }
  async function changeRequest(id,action){try{await api(`/api/admin/requests/${id}/${action}`,{method:'POST',body:'{}'});await showDashboard();}catch(e){alert(e.message);}}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  document.addEventListener('DOMContentLoaded',()=>{content=mount();checkStatus();setInterval(async()=>{if(window.CODEX_ACCESS_GRANTED)return;try{const s=await api('/api/access/status');if(s.status==='approved')grant();}catch{}},7000);});
})();
