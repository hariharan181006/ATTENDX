const getPos=()=>new Promise((ok,no)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>ok(p.coords),()=>no(new Error('Location permission is required')),{enableHighAccuracy:true,timeout:15000}):no(new Error('Geolocation not supported')));
const fmtTime=t=>{const [h,m]=t.split(':').map(Number);const ap=h>=12?'PM':'AM';const hh=(h%12)||12;return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`};
const remaining=(date,t)=>{const [h,m,s]=t.split(':').map(Number);const end=new Date(`${date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s||0).padStart(2,'0')}`);return end-Date.now()};
initPage('qr',async(u,m)=>{
  if(u.role==='faculty'){
    m.innerHTML=`<div class="panel"><label>Subject<input id="subj" placeholder="e.g. Data Structures"></label><div class="grid2"><label>Start Time<input id="start" type="time"></label><label>End Time<input id="end" type="time"></label></div><br><button class="btn" id="mk">Generate QR</button><p><small>Students who scan between the selected start and end time are marked Present. When the end time is reached, the QR expires automatically; students who did not scan remain Absent.</small></p><div id="out"></div></div>`;
    $('mk').onclick=async()=>{try{
      const start=$('start').value,end=$('end').value;
      if(!start||!end)throw new Error('Select start time and end time');
      if(end<=start)throw new Error('End time must be after start time');
      const p=await getPos();
      const s=(await api('/sessions',{method:'POST',body:{subject:$('subj').value,start_time:start,end_time:end,lat:p.latitude,lng:p.longitude}})).session;
      $('out').innerHTML=`<div class="msg ok">QR generated for <b>${esc(s.subject)}</b><br>Valid from <b>${fmtTime(start)}</b> to <b>${fmtTime(end)}</b><br><span id="timer"></span></div><div id="qrbox"></div>`;
      new QRCode($('qrbox'),{text:s.token,width:240,height:240});
      const tick=()=>{const left=remaining(s.day,end+':00');const el=$('timer');if(!el)return;if(left<=0){el.innerHTML='<b>QR EXPIRED</b>';const box=$('qrbox');if(box)box.innerHTML='<div class="msg err">This QR has expired. Students who did not scan are Absent.</div>';return clearInterval(iv)}const sec=Math.floor(left/1000),h=Math.floor(sec/3600),mm=Math.floor((sec%3600)/60),ss=sec%60;el.textContent=`Expires in ${h?String(h).padStart(2,'0')+':':''}${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`};tick();const iv=setInterval(tick,1000);
    }catch(e){$('out').innerHTML=`<div class="msg err">${esc(e.message)}</div>`}};
  }else{
    m.innerHTML=`<div class="panel"><div id="reader" style="max-width:360px;margin:auto"></div><div id="res"></div></div>`;
    let busy=false;const sc=new Html5Qrcode('reader');
    const done=(h,ok)=>$('res').innerHTML=`<div class="msg ${ok?'ok':'err'}">${h}</div>`;
    sc.start({facingMode:'environment'},{fps:10,qrbox:240},async token=>{
      if(busy)return;busy=true;
      try{const p=await getPos();const r=await api('/attendance/scan',{method:'POST',body:{token,lat:p.latitude,lng:p.longitude}});done(`✔ ${r.message} — ${esc(r.subject)} (${r.status})`,true);sc.stop().catch(()=>{})}
      catch(e){done('✖ Attendance Failed: '+esc(e.message),false);setTimeout(()=>busy=false,3000)}
    }).catch(()=>done('Camera could not start. Allow camera access (use HTTPS or localhost).',false));
  }
});
