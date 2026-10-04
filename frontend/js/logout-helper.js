async function logout(){
  try{await fetch('/api/logout',{method:'POST',credentials:'include'})}catch(e){}
  localStorage.clear();sessionStorage.clear();location.replace('login.html');
}
// Back/forward cache: re-check auth so protected pages never reopen after logout
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
