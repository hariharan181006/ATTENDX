initPage('od',(u,m)=>requestPage({name:'OD',ep:'/od',types:['Event','Competition','Workshop','Seminar','College Duty','Other'],
 fields:[{k:'duty_date',l:'Duty Date',t:'date'},{k:'location',l:'Location / Event',t:'text'}]},u,m));
