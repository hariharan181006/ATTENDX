const form=document.getElementById('lf');
const idInput=document.getElementById('uid');
const pwInput=document.getElementById('pw');
const idLabel=document.getElementById('idLabel');
const loginBtn=document.getElementById('loginBtn');
const err=document.getElementById('err');
let role='';
document.querySelectorAll('.role-btn').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.role-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); role=b.dataset.role;
 idInput.disabled=false; pwInput.disabled=false; loginBtn.disabled=false; idInput.value=''; pwInput.value='';
 idLabel.textContent=role==='student'?'Register Number':role==='faculty'?'Faculty ID':'Username';
 idInput.placeholder=role==='student'?'Enter register number':role==='faculty'?'Enter faculty ID':'Enter username'; idInput.focus(); err.textContent='';
}));
form.addEventListener('submit',async e=>{e.preventDefault();err.textContent=''; if(!role)return; loginBtn.disabled=true;loginBtn.textContent='Logging in...';
 try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({id:idInput.value.trim(),password:pwInput.value,role})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Login failed'); sessionStorage.setItem('attendxUser',JSON.stringify(d.user)); location.href='dashboard.html';}
 catch(x){err.textContent=x.message||'Unable to connect to AttendX backend.';loginBtn.disabled=false;loginBtn.textContent='Login';}
});