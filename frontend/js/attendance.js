initPage('attendance',async(u,m)=>{
  const stu=u.role==='student',fac=u.role==='faculty';
  m.innerHTML=`<div id="sum"></div><div class="filters"><input type="date" id="fd"><input id="fs" placeholder="Subject"><select id="fst"><option value="">All Status</option><option>Present</option><option>Late</option><option>Absent</option></select>${stu?'':'<input id="fq" placeholder="Register No / Name">'}<button class="btn" id="go">Filter</button></div><div id="tb"></div>`;
  async function load(){
    const p=new URLSearchParams({date:$('fd').value,subject:$('fs').value,status:$('fst').value,q:$('fq')?$('fq').value:''});
    const d=await api('/attendance?'+p),s=d.summary;
    $('sum').innerHTML=cards([[stu?'Total Classes':'Total Records',s.total],['Present',s.present],['Absent',s.absent],['Late',s.late],['Attendance %',s.pct+'%']]);
    $('tb').innerHTML=table(stu?['Date','Subject','Time','Status']:['Register Number','Student Name','Department','Date','Time','Status',...(fac?['Action']:[])],
     d.rows.map(r=>stu?`<tr><td>${r.day}</td><td>${esc(r.subject)}</td><td>${r.at||'-'}</td><td>${badge(r.status)}</td></tr>`
      :`<tr><td>${esc(r.reg_no)}</td><td>${esc(r.student_name)}</td><td>${esc(r.department)}</td><td>${r.day}</td><td>${r.at||'-'}</td><td>${badge(r.status)}</td>${fac?`<td><select data-i="${r.id}">${['Present','Late','Absent'].map(x=>`<option ${x===r.status?'selected':''}>${x}</option>`).join('')}</select></td>`:''}</tr>`));
    $('tb').querySelectorAll('select[data-i]').forEach(s=>s.onchange=async()=>{await api('/attendance/'+s.dataset.i,{method:'PUT',body:{status:s.value}});load()});
  }
  $('go').onclick=load;load();
});
