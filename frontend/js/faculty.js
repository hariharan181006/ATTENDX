initPage('faculty', async (u, m) => {
  if (u.role !== 'principal') return location.replace('dashboard.html');

  m.innerHTML = `
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div><h3 style="margin:0 0 5px">Faculty Management</h3><small>Add, edit, delete and view faculty members.</small></div>
        <button id="addFacultyBtn" class="btn">Add Faculty</button>
      </div>
      <div id="facultyMsg"></div>
    </div>
    <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0">Faculty Records</h3><b>Total: <span id="facultyCount">0</span></b></div><div id="facultyTable"></div></div>
    <div id="facultyModal" style="display:none;position:fixed;inset:0;background:#0007;z-index:1000;padding:20px;overflow:auto">
      <div class="panel" style="max-width:560px;margin:40px auto">
        <div style="display:flex;justify-content:space-between;align-items:center"><h3 id="facultyModalTitle" style="margin-top:0">Add Faculty</h3><button type="button" id="closeFacultyModal" class="btn r">Close</button></div>
        <form id="facultyForm"><input type="hidden" id="facultyEditId"><div class="grid">
          <label>Faculty ID<input id="facultyId" required maxlength="30"></label>
          <label>Faculty Name<input id="facultyName" required maxlength="80"></label>
          <label>Department<input id="facultyDepartment" required maxlength="60"></label>
          <label>Password<input id="facultyPassword" type="password" minlength="4" maxlength="100"><small id="facultyPasswordHelp">Required when adding a faculty.</small></label>
        </div><div id="facultyFormMsg"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button type="button" id="cancelFacultyBtn" class="btn r">Cancel</button><button type="submit" class="btn" id="saveFacultyBtn">Add Faculty</button></div></form>
      </div>
    </div>`;

  let faculty=[];
  const msg=(x,t='ok')=>$('facultyMsg').innerHTML=x?`<div class="msg ${t}">${esc(x)}</div>`:'';
  const fmsg=(x,t='err')=>$('facultyFormMsg').innerHTML=x?`<div class="msg ${t}">${esc(x)}</div>`:'';

  function openModal(f=null){
    $('facultyForm').reset(); fmsg(''); const edit=!!f;
    $('facultyModalTitle').textContent=edit?'Edit Faculty':'Add Faculty';
    $('saveFacultyBtn').textContent=edit?'Update Faculty':'Add Faculty';
    $('facultyEditId').value=edit?f.id:''; $('facultyId').value=edit?f.faculty_id:''; $('facultyName').value=edit?f.name:''; $('facultyDepartment').value=edit?f.department:''; $('facultyPassword').value='';
    $('facultyId').readOnly=edit; $('facultyPassword').required=!edit;
    $('facultyPasswordHelp').textContent=edit?'Leave blank to keep the current password.':'Required when adding a faculty.';
    $('facultyModal').style.display='block';
  }
  function closeModal(){ $('facultyModal').style.display='none'; fmsg(''); }
  function render(){
    $('facultyCount').textContent=faculty.length;
    const rows=faculty.map(f=>`<tr><td>${esc(f.faculty_id)}</td><td>${esc(f.name)}</td><td>${esc(f.department)}</td><td><button class="btn s edit-faculty" data-id="${f.id}">Edit</button> <button class="btn r s delete-faculty" data-id="${f.id}">Delete</button></td></tr>`);
    $('facultyTable').innerHTML=table(['Faculty ID','Faculty Name','Department','Action'],rows);
    document.querySelectorAll('.edit-faculty').forEach(b=>b.onclick=()=>{const f=faculty.find(x=>String(x.id)===String(b.dataset.id));if(f)openModal(f)});
    document.querySelectorAll('.delete-faculty').forEach(b=>b.onclick=async()=>{const f=faculty.find(x=>String(x.id)===String(b.dataset.id));if(!f||!confirm(`Delete faculty ${f.faculty_id} - ${f.name}?`))return;try{await api(`/faculty/${f.id}`,{method:'DELETE'});msg('Faculty deleted successfully.');load()}catch(e){msg(e.message,'err')}});
  }
  async function load(){try{faculty=(await api('/faculty')).rows||[];render()}catch(e){$('facultyTable').innerHTML=`<div class="msg err">${esc(e.message)}</div>`}}
  $('addFacultyBtn').onclick=()=>openModal(); $('closeFacultyModal').onclick=closeModal; $('cancelFacultyBtn').onclick=closeModal;
  $('facultyModal').onclick=e=>{if(e.target===$('facultyModal'))closeModal()};
  $('facultyForm').onsubmit=async e=>{e.preventDefault();fmsg('');const id=$('facultyEditId').value;const body={faculty_id:$('facultyId').value.trim(),name:$('facultyName').value.trim(),department:$('facultyDepartment').value.trim(),password:$('facultyPassword').value};if(!body.faculty_id||!body.name||!body.department){fmsg('Please fill all required fields.');return}if(!id&&!body.password){fmsg('Password is required when adding a faculty.');return}try{if(id){delete body.faculty_id;if(!body.password)delete body.password;await api(`/faculty/${id}`,{method:'PUT',body});msg('Faculty updated successfully.')}else{await api('/faculty',{method:'POST',body});msg('Faculty added successfully.')}closeModal();await load()}catch(e){fmsg(e.message)}};
  await load();
});
