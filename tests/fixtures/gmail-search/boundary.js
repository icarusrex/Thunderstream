
let release;
const log=document.querySelector('#fixture-log');
const record=value=>{log.textContent+=JSON.stringify(value)+'\n';};
const page={ok:true,session:'fixture-session',items:[{id:'fixture-message',subject:'Synthetic <img src=x> & tea',from:'Fixture <fixture@example.invalid>',date:'6 October 2026'}],nextPageToken:'fixture-next'};
document.querySelector('#release').addEventListener('click',()=>release?.(page));
globalThis.messenger={runtime:{sendMessage:async request=>{
 record(request);
 if(request.type==='gmail:status')return {ok:true,connected:!location.search.includes('disconnected'),email:'fixture@example.invalid',labels:[{id:'Label_14',name:'Projects / "A & B"'}]};
 if(request.type==='gmail:search'&&request.query.includes('delayed'))return await new Promise(resolve=>{release=resolve;});
 if(request.type==='gmail:search')return page;
 if(request.type==='gmail:next')return {...page,items:[{id:'fixture-next-message',subject:'Next synthetic page',from:'Fixture',date:''}],nextPageToken:''};
 if(request.type==='gmail:open')return {ok:true};
 if(request.type==='gmail:disconnect')return {ok:true};
 return {ok:true};
}},permissions:{request:async()=>false}};
