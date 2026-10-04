initPage('dashboard',async(u,m)=>{
  const d=await api('/dashboard'),s=d.stats,stu=u.role==='student';
  const rec=d.recent.map(r=>stu?`<tr><td>${r.day}</td><td>${esc(r.subject)}</td><td>${r.at||'-'}</td><td>${badge(r.status)}</td></tr>`
    :`<tr><td>${esc(r.student_name)}</td><td>${esc(r.reg_no)}</td><td>${r.at||'-'}</td><td>${badge(r.status)}</td></tr>`);
  const rq=(n,o)=>`${n}: <b>${o.Pending||0}</b> pending · ${o.Approved||0} approved · ${o.Rejected||0} rejected`;
  m.innerHTML=(stu?`<div class="panel"><b>${esc(u.name)}</b> · Register No: ${esc(u.login_id)}</div>`+cards([['Attendance %',s.pct+'%'],['Present',s.present],['Absent',s.absent],['Late',s.late]])+'<p><a class="btn" href="qr.html">Scan QR Attendance</a></p>'
   :cards([['Total Students',s.students],['Present Today',s.present],['Absent Today',s.absent],['Late Today',s.late],['Attendance %',s.pct+'%']])
    +(u.role==='faculty'?'<p><a class="btn" href="qr.html">Create QR Attendance</a> <a class="btn" href="attendance.html">View Attendance</a> <a class="btn" href="leave.html">Leave Requests</a> <a class="btn" href="od.html">OD Requests</a></p>':u.role==='principal'?'<p><a class="btn" href="faculty.html">Faculty Management / Add Faculty</a> <a class="btn" href="attendance.html">View Attendance</a> <a class="btn" href="leave.html">Leave Requests</a> <a class="btn" href="od.html">OD Requests</a></p>':''))
   +`<h3>Recent Attendance</h3>`+table(stu?['Date','Subject','Time','Status']:['Student Name','Register Number','Time','Status'],rec)
   +`<h3>${stu?'Request Summary':'Pending Requests'}</h3><div class="panel">${rq('Leave',d.req.leave)}<br>${rq('OD',d.req.od)}</div>`;
});
