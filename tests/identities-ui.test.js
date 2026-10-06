import {test} from 'node:test';
import assert from 'node:assert/strict';

test('sender chooser recovers and explains an unexpected port disconnect',async()=>{
 class Node {
  constructor(){this.children=[];this.events={};this.textContent='';}
  setAttribute(key,value){this[key]=value;}
  addEventListener(type,fn){this.events[type]=fn;}
  append(node){this.children.push(node);}
  querySelector(){return this.children[0];}
  focus(){}
 }
 const list=new Node(),status=new Node(),calls=[];
 const names=['document','location','window','messenger'];
 const previous=names.map(name=>Object.getOwnPropertyDescriptor(globalThis,name));
 globalThis.document={querySelector:s=>s==='#identities'?list:status,createElement:()=>new Node()};
 globalThis.location={href:'moz-extension://test/ui/identities.html?token=selection'};
 globalThis.window={close(){assert.fail('A disconnected request must not report success.');}};
 globalThis.messenger={runtime:{
  sendMessage:async()=>({ok:true,identities:[{id:'alias',email:'alias@example.invalid',accountName:'Test'}]}),
  connect(){
   let onDisconnect;
   return {
    onMessage:{addListener(){}},
    onDisconnect:{addListener:fn=>{onDisconnect=fn;}},
    postMessage(message){calls.push(message);onDisconnect();},
    disconnect(){}
   };
  }
 }};
 try{
  await import('../extension/ui/identities.js?n23='+crypto.randomUUID());
  await list.children[0].events.click();
  await list.children[0].events.click();
  assert.equal(calls.length,2,'The chooser must not stay busy after disconnect.');
  assert.equal(status.textContent,'Compose result unavailable. Reopen the palette.');
 }finally{
  names.forEach((name,i)=>previous[i]?Object.defineProperty(globalThis,name,previous[i]):delete globalThis[name]);
 }
});


test('sender chooser exposes address account and suggestion as separate inert text',async()=>{
 class Node {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.textContent='';}
  setAttribute(key,value){this[key]=value;}
  addEventListener(type,fn){this.events[type]=fn;}
  append(...nodes){this.children.push(...nodes);}
  querySelector(){return this.children[0];}
  focus(){this.focused=true;}
 }
 const list=new Node(),status=new Node(),previous={};
 for(const name of ['document','location','window','messenger'])previous[name]=Object.getOwnPropertyDescriptor(globalThis,name);
 globalThis.document={querySelector:s=>s==='#identities'?list:status,createElement:tag=>new Node(tag)};
 globalThis.location={href:'moz-extension://test/ui/identities.html?token=fixture'};
 globalThis.window={close(){}};
 globalThis.messenger={runtime:{sendMessage:async()=>({ok:true,identities:[
  {id:'alias',email:'alias@example.invalid',accountName:'Work <img src=x>',suggested:true,reason:'matches a recipient'},
  {id:'other',email:'other@example.invalid',accountName:'Personal'}
 ]})}};
 try{
  await import('../extension/ui/identities.js?identity-context='+crypto.randomUUID());
  const button=list.children[0];
  assert.ok(button.children.length>=2,'Address and account should have separate visible text elements');
  assert.equal(button.children[0].textContent,'alias@example.invalid');
  assert.equal(button.children[1].textContent,'Work <img src=x>');
  assert.match(button.children[2].textContent,/matches a recipient/);
  assert.equal(button.children[1].children.length,0,'Markup-like account name remains text');
  assert.equal(button.focused,true);
  assert.equal(list.children[1].children.length,2,'Unmatched choices do not claim a suggestion');
 }finally{for(const [name,descriptor] of Object.entries(previous))descriptor?Object.defineProperty(globalThis,name,descriptor):delete globalThis[name];}
});
