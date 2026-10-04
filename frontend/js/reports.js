initPage('reports',async(u,m)=>{
  const stu=u.role==='student';let rows=[];
  m.innerHTML=`<div class="filters"><input type="date" id="rfrom" title="From Date"><input type="date" id="rto" title="To Date"><input id="rs" placeholder="Subject">${stu?'':'<input id="rq" placeholder="Register No / Name">'}<select id="rst"><option value="">All</option><option>Present</option><option>Late</option><option>Absent</option></select><button class="btn" id="go">Generate</button><button class="btn g" id="xl">Export Excel</button><button class="btn r" id="pdf">Export PDF</button></div><div id="sum"></div><div id="tb"></div>`;
  async function load(){
    const p=new URLSearchParams({from:$('rfrom').value,to:$('rto').value,subject:$('rs').value,status:$('rst').value,q:$('rq')?$('rq').value:''});
    const d=await api('/attendance?'+p);rows=d.rows;const s=d.summary;
    $('sum').innerHTML=cards([['Total Records',s.total],['Present',s.present],['Late',s.late],['Absent',s.absent],['Attendance %',s.pct+'%']]);
    $('tb').innerHTML=table(['Date','Register Number','Student Name','Subject','Time','Status'],rows.map(r=>`<tr><td>${r.day}</td><td>${esc(r.reg_no)}</td><td>${esc(r.student_name)}</td><td>${esc(r.subject)}</td><td>${r.at||'-'}</td><td>${badge(r.status)}</td></tr>`));
  }
  $('go').onclick=load;$('pdf').onclick=()=>window.print();
  $('xl').onclick=()=>{const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
    const csv=['Date,Register Number,Student Name,Subject,Time,Status',...rows.map(r=>[r.day,r.reg_no,r.student_name,r.subject,r.at,r.status].map(q).join(','))].join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='attendx_report.csv';a.click()};
  load();
});
