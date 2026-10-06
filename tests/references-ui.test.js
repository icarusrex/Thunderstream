import {test} from 'node:test';
import assert from 'node:assert/strict';
class Node{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.textContent='';this.disabled=false;this.hidden=false;}
 setAttribute(k,v){this[k]=v;}addEventListener(k,fn){(this.events[k]||=[]).push(fn);}append(...n){this.children.push(...n);}replaceChildren(...n){this.children=n;}focus(){}
 async fire(k,e={}){for(const fn of this.events[k]||[])await fn(e);}
}
const data={ok:true,scope:{accountName:'Work <img>',folderName:'Inbox'},items:[{id:1,subject:'Current <img src=x>',author:'Me & team',date:'2026-10-06T10:00:00Z',selected:true},{id:2,subject:'Earlier subject',author:'Sender',date:'',selected:false}],issues:{missing:0,ambiguous:0,unavailable:0,truncated:0}};
const text=n=>n.textContent+n.children.map(text).join(' ');
const buttons=n=>n.children.flatMap(child=>child.tagName==='BUTTON'?[child]:buttons(child));
async function page(t,reply,token='fixture'){
 const nodes=Object.fromEntries(['messages','scope','issues','status','refresh','empty'].map(k=>[k,new Node()]));const calls=[],saved={};
 for(const k of ['document','messenger','location'])saved[k]=Object.getOwnPropertyDescriptor(globalThis,k);
 globalThis.document={querySelector:s=>nodes[s.slice(1)],createElement:tag=>new Node(tag)};globalThis.location={href:'moz-extension://test/ui/references.html'+(token?'?token='+token:'')};
 globalThis.messenger={runtime:{sendMessage:async r=>{calls.push(r);return reply?reply(r):structuredClone(data);}}};
 t.after(()=>{for(const [k,d] of Object.entries(saved))d?Object.defineProperty(globalThis,k,d):delete globalThis[k];});
 await import('../extension/ui/references.js?fixture='+crypto.randomUUID());return {nodes,calls};
}
test('reference page exposes original account folder and separate inert message metadata',async t=>{
 const {nodes}=await page(t);assert.equal(nodes.messages.children.length,2);assert.match(nodes.scope.textContent,/Work <img>.*Inbox/);
 const current=nodes.messages.children[0];assert.match(text(current),/Selected message/);assert.match(text(current),/Current <img src=x>/);assert.match(text(current),/Me & team/);
 assert.equal(current.children.find(n=>n.tagName==='H2').children.length,0);assert.equal(buttons(current).length,1);
});
test('native open uses the clicked item ID and retains the page on success',async t=>{
 const {nodes,calls}=await page(t,r=>r.type==='references:init'?structuredClone(data):{ok:true,code:'opened'});
 await buttons(nodes.messages)[1].fire('click');assert.deepEqual(calls.at(-1),{type:'references:open',token:'fixture',messageId:2});assert.match(nodes.status.textContent,/Opened in Thunderbird/);assert.equal(buttons(nodes.messages)[0].disabled,false);
});
test('open failure restores native buttons for retry',async t=>{
 const {nodes,calls}=await page(t,r=>r.type==='references:init'?structuredClone(data):{ok:false,code:'message-open-failed'});
 await buttons(nodes.messages)[1].fire('click');await buttons(nodes.messages)[1].fire('click');assert.equal(calls.filter(c=>c.type==='references:open').length,2);assert.equal(buttons(nodes.messages)[1].disabled,false);assert.match(nodes.status.textContent,/could not open/);
});
test('reference issue counts and selected-only empty state are explicit',async t=>{
 const {nodes}=await page(t,()=>({...structuredClone(data),items:[data.items[0]],issues:{missing:2,ambiguous:1,unavailable:3,truncated:4}}));
 assert.match(text(nodes.issues),/2.*not found/);assert.match(text(nodes.issues),/1.*multiple matches/);assert.match(text(nodes.issues),/3.*could not be checked/);assert.match(text(nodes.issues),/4.*limit/);assert.equal(nodes.empty.hidden,false);
});
test('refresh recovers after init failure without enabling unseen actions',async t=>{
 let n=0;const {nodes}=await page(t,()=>n++?structuredClone(data):{ok:false,code:'references-unavailable'});
 assert.equal(nodes.messages.children.length,0);assert.equal(nodes.refresh.disabled,false);await nodes.refresh.fire('click');assert.equal(nodes.messages.children.length,2);assert.equal(buttons(nodes.messages)[0].disabled,false);
});
test('stale target disables cached opens until a successful refresh',async t=>{
 const {nodes}=await page(t,r=>r.type==='references:init'?structuredClone(data):{ok:false,code:'references-stale'});
 await buttons(nodes.messages)[1].fire('click');assert.equal(buttons(nodes.messages)[0].disabled,true);assert.equal(nodes.refresh.disabled,false);await nodes.refresh.fire('click');assert.equal(buttons(nodes.messages)[0].disabled,false);
});
test('missing page token gives a reopen message without a runtime request',async t=>{
 const {nodes,calls}=await page(t,undefined,'');assert.equal(calls.length,0);assert.match(nodes.status.textContent,/Reopen/);assert.equal(nodes.refresh.disabled,true);
});

test('unreadable anchor headers show an unknown-list warning without inventing a reference count',async t=>{
 const {nodes}=await page(t,()=>({...structuredClone(data),items:[data.items[0]],issues:{missing:0,ambiguous:0,unavailable:0,truncated:0,headersUnavailable:true}}));
 assert.match(text(nodes.issues),/selected message.*could not be read/i);assert.doesNotMatch(text(nodes.issues),/1 reference/);
});
