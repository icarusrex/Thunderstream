const identities=[
 {id:'alias',email:'shared@example.invalid',accountName:'Work <img src=x>',suggested:true,reason:'matches a recipient'},
 {id:'personal',email:'shared@example.invalid',accountName:'Personal'},
 {id:'other',email:'long-address-for-layout-check@example.invalid',accountName:'A long synthetic account name for wrapping'}
];
const log=document.querySelector('#fixture-log');
const record=request=>{log.textContent+=JSON.stringify(request)+'\n';};
globalThis.messenger={runtime:{
 sendMessage:async request=>{record(request);return {ok:true,identities:location.search.includes('empty')?[]:identities};},
 connect:()=>{
  let response,disconnected;
  return {
   onMessage:{addListener:fn=>{response=fn;}},onDisconnect:{addListener:fn=>{disconnected=fn;}},
   postMessage:request=>{record(request);queueMicrotask(()=>response({ok:false,code:'synthetic-fixture-only'}));},
   disconnect:()=>{disconnected?.();}
  };
 }
}};
