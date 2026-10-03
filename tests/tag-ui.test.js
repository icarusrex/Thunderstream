import {test} from 'node:test';
import assert from 'node:assert/strict';

test('focused Leave unchanged discards its pending tag without submitting',async()=>{
 class Node {
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.events={};}
  setAttribute(key,value){this[key]=value;}
  addEventListener(type,fn){this.events[type]=fn;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  focus(){}
 }
 const nodes=Object.fromEntries(['query','tags','status','apply','cancel'].map(id=>[id,new Node(id==='query'?'input':id==='apply'||id==='cancel'?'button':'div')]));
 nodes.query.value='';const events={},calls=[];
 globalThis.document={querySelector:s=>nodes[s.slice(1)],createElement:tag=>new Node(tag),createTextNode:text=>({text}),addEventListener:(type,fn)=>events[type]=fn};
 globalThis.location={href:'moz-extension://test/ui/tags.html?token=selection'};
 globalThis.window={close(){}};
 globalThis.messenger={runtime:{sendMessage:async request=>{calls.push(request);return request.type==='tags:init'?{ok:true,tags:[{key:'one',tag:'One',all:false,some:true}]}:{ok:true};}}};
 try{
  await import('../extension/ui/tags.js?focused-reset-regression');
  const row=nodes.tags.children[0],checkbox=row.children[0].children[0],reset=row.children[1];
  checkbox.checked=true;checkbox.events.change();
  let prevented=false;events.keydown({key:'Enter',target:reset,preventDefault(){prevented=true;}});
  if(!prevented)reset.events.click();
  assert.equal(calls.filter(x=>x.type==='tags:apply').length,0);
  assert.equal(nodes.tags.children[0].children[0].children[0].checked,false);
  await nodes.apply.events.click();
  assert.deepEqual(calls.find(x=>x.type==='tags:apply').delta,{add:[],remove:[]});
 }finally{for(const name of ['document','location','window','messenger'])delete globalThis[name];}
});
