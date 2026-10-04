const $=id=>document.getElementById(id);
const PAGES={dashboard:'Dashboard',faculty:'Staff Management',students:'Students',qr:'QR Attendance',attendance:'Attendance',leave:'Leave Request',od:'OD Request',reports:'Reports',about:'About'};
const ROLE_MENU={student:['dashboard','qr','attendance','leave','od','reports','about'],
 faculty:['dashboard','students','qr','attendance','leave','od','reports','about'],
 principal:['dashboard','faculty','attendance','leave','od','reports','about']};
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const badge=s=>`<span class="badge ${esc(String(s).toLowerCase())}">${esc(s)}</span>`;
const table=(h,rows)=>`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${h.length}" class="empty">No records</td></tr>`}</tbody></table></div>`;
const cards=a=>`<div class="cards">${a.map(([l,v])=>`<div class="card"><small>${l}</small><h3>${v}</h3></div>`).join('')}</div>`;
async function api(path,opts={}){
  const r=await fetch('/api'+path,{credentials:'include',method:opts.method||'GET',headers:{'Content-Type':'application/json'},body:opts.body?JSON.stringify(opts.body):undefined});
  if(r.status===401){sessionStorage.clear();location.replace('login.html');throw new Error('Login required')}
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Request failed');return j;
}
async function initPage(key,build){
  let u;try{u=(await api('/me')).user}catch(e){return}
  if(!ROLE_MENU[u.role].includes(key))return location.replace('dashboard.html');
  const lab=k=>k==='qr'&&u.role==='student'?'Scan QR':PAGES[k];
  document.body.innerHTML=`<aside class="side"><h2>Attend<span>X</span></h2>${ROLE_MENU[u.role].map(k=>`<a class="${k===key?'on':''}" href="${k}.html">${lab(k)}</a>`).join('')}<a onclick="logout()">Logout</a></aside>
  <main><header class="top"><div><h1>${lab(key)}</h1><small>Welcome back, ${esc(u.name)}</small></div><div class="who"><b>${esc(u.name)}</b><small>${u.role==='principal'?'Principal':u.role}</small></div></header><section id="main"></section></main>`;
  try{await build(u,$('main'))}catch(e){$('main').innerHTML=`<div class="msg err">${esc(e.message)}</div>`}
}
// Generic Leave / OD page
async function requestPage(cfg,u,m){
  const stu=u.role==='student',fac=u.role==='faculty';
  m.innerHTML=(stu?`<form id="rf" class="panel"><h3>New ${cfg.name} Request</h3><div class="grid">
   <label>${cfg.name} Type<select id="rtype">${cfg.types.map(t=>`<option>${t}</option>`).join('')}</select></label>
   <label id="ro" style="display:none">Custom Type<input id="rother"></label>
   ${cfg.fields.map(f=>`<label>${f.l}<input id="f_${f.k}" type="${f.t}" required></label>`).join('')}</div>
   <label>Reason</label><textarea id="rreason" required></textarea><button class="btn">Submit</button><div id="rmsg"></div></form>`:'')+'<div id="rl"></div>';
  if(stu){
    $('rtype').onchange=()=>{$('ro').style.display=$('rtype').value==='Other'?'block':'none'};
    $('rf').onsubmit=async e=>{e.preventDefault();
      const body={type:$('rtype').value==='Other'?$('rother').value:$('rtype').value,reason:$('rreason').value};
      cfg.fields.forEach(f=>body[f.k]=$('f_'+f.k).value);
      try{await api(cfg.ep,{method:'POST',body});$('rmsg').innerHTML='<div class="msg ok">Submitted. Status: Pending</div>';$('rf').reset();load()}
      catch(err){$('rmsg').innerHTML=`<div class="msg err">${esc(err.message)}</div>`}};
  }
  async function load(){
    const rows=(await api(cfg.ep)).rows;
    const head=[...(stu?[]:['Reg No','Name']),'Type',...cfg.fields.map(f=>f.l),'Reason','Status',...(fac?['Action']:[])];
    $('rl').innerHTML=`<h3>${stu?'My Requests':'All Requests'}</h3>`+table(head,rows.map(r=>`<tr>${stu?'':`<td>${esc(r.reg_no)}</td><td>${esc(r.student_name)}</td>`}<td>${esc(r.type)}</td>${cfg.fields.map(f=>`<td>${esc(r[f.k])}</td>`).join('')}<td>${esc(r.reason)}</td><td>${badge(r.status)}</td>${fac?`<td>${r.status==='Pending'?`<button class="btn g s" data-i="${r.id}" data-s="Approved">Approve</button> <button class="btn r s" data-i="${r.id}" data-s="Rejected">Reject</button>`:'—'}</td>`:''}</tr>`));
    $('rl').querySelectorAll('button[data-i]').forEach(b=>b.onclick=async()=>{await api(`${cfg.ep}/${b.dataset.i}`,{method:'PUT',body:{status:b.dataset.s}});load()});
  }
  load();
}
