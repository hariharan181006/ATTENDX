initPage('leave',(u,m)=>requestPage({name:'Leave',ep:'/leave',types:['Casual Leave','Medical Leave','Emergency Leave','Other'],
 fields:[{k:'from_date',l:'From Date',t:'date'},{k:'to_date',l:'To Date',t:'date'}]},u,m));
