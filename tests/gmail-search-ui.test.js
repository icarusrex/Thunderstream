import {test} from 'node:test';
import assert from 'node:assert/strict';

class Node {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.value='';this.checked=false;this.hidden=false;this.disabled=false;this.textContent='';this.maxLength=4096;}
 setAttribute(key,value){this[key]=value;}
 addEventListener(type,fn){(this.events[type]||=[]).push(fn);}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 focus(){this.focused=true;}
 setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;}
 get selectedOptions(){return this.children.filter(node=>node.value===this.value);}
 async fire(type,event={}){for(const fn of this.events[type]||[])await fn({preventDefault(){},...event});await new Promise(resolve=>setImmediate(resolve));}
}
let instance=0;
async function page(t,{connected=true,reply}={}){
 const ids=['status','account','results','gmail-query','scope','spam-trash','search','connect','disconnect','cancel','next','search-form','operator-suggestions','search-date','after-date','before-date','preview-account','preview-scope','preview-spam','preview-query'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Node()]));
 const calls=[];const saved={document:globalThis.document,messenger:globalThis.messenger};
 globalThis.document={querySelector:selector=>nodes[selector.slice(1)],createElement:tag=>new Node(tag)};
 globalThis.messenger={runtime:{sendMessage:async request=>{
  calls.push(request);
  if(request.type==='gmail:status')return {ok:true,connected,email:'fixture@example.invalid',labels:[{id:'Label_14',name:'Projects / "A & B"'}]};
  return await reply?.(request)||{ok:true,session:'session-1',items:[],nextPageToken:''};
 }}};
 t.after(()=>{for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 await import(`../extension/ui/gmail-search.js?search-ui-${++instance}`);
 return {nodes,calls,suggestion:text=>nodes['operator-suggestions'].children.find(node=>node.textContent===text)};
}

test('search preview shows exact literal query and returned label scope',async t=>{
 const {nodes,calls}=await page(t);
 nodes['gmail-query'].value='  {from:a from:b} subject:"<img> & tea"  ';
 await nodes['gmail-query'].fire('input');
 nodes.scope.value='Label_14';await nodes.scope.fire('change');
 nodes['spam-trash'].checked=true;await nodes['spam-trash'].fire('change');
 assert.equal(nodes['preview-query'].textContent,'  {from:a from:b} subject:"<img> & tea"  ');
 assert.equal(nodes['preview-account'].textContent,'fixture@example.invalid');
 assert.equal(nodes['preview-scope'].textContent,'Projects / "A & B"');
 assert.equal(nodes['preview-spam'].textContent,'Included');
 await nodes['search-form'].fire('submit');
 assert.deepEqual(calls.find(call=>call.type==='gmail:search'),{type:'gmail:search',query:'  {from:a from:b} subject:"<img> & tea"  ',email:'fixture@example.invalid',labelId:'Label_14',includeSpamTrash:true});
});

test('operator suggestion appends without replacing selected literal text or searching',async t=>{
 const {nodes,calls,suggestion}=await page(t);
 nodes['gmail-query'].value='subject:"tea & toast"';nodes['gmail-query'].setSelectionRange(0,7);
 assert.ok(suggestion('Attachments'),'Attachments suggestion should exist');
 await suggestion('Attachments').fire('click');
 assert.equal(nodes['gmail-query'].value,'subject:"tea & toast" has:attachment');
 assert.equal(nodes['preview-query'].textContent,'subject:"tea & toast" has:attachment');
 assert.equal(nodes['gmail-query'].selectionStart,36);
 assert.equal(nodes['gmail-query'].focused,true);
 assert.equal(calls.filter(call=>call.type==='gmail:search').length,0);
 assert.equal(calls.at(-1).type,'gmail:cancel');
});

test('operator suggestion preserves existing trailing whitespace and offers editable operators',async t=>{
 const {nodes,suggestion}=await page(t);
 nodes['gmail-query'].value='is:starred\t ';
 assert.ok(suggestion('From…'),'From suggestion should exist');
 await suggestion('From…').fire('click');
 assert.equal(nodes['gmail-query'].value,'is:starred\t from:');
 await suggestion('Subject…').fire('click');
 assert.equal(nodes['gmail-query'].value,'is:starred\t from: subject:');
 await suggestion('Unread').fire('click');
 assert.equal(nodes['gmail-query'].value,'is:starred\t from: subject: is:unread');
});

test('date suggestions append chosen date and do not alter scope',async t=>{
 const {nodes,calls}=await page(t);
 assert.equal(nodes['after-date'].disabled,true);
 nodes['search-date'].value='2026-02-28';await nodes['search-date'].fire('input');
 assert.equal(nodes['after-date'].disabled,false);
 nodes.scope.value='Label_14';await nodes.scope.fire('change');
 await nodes['after-date'].fire('click');await nodes['before-date'].fire('click');
 assert.equal(nodes['gmail-query'].value,'after:2026/02/28 before:2026/02/28');
 assert.equal(nodes.scope.value,'Label_14');
 assert.equal(calls.filter(call=>call.type==='gmail:search').length,0);
});

test('suggestion clears a pending search and discards its late response',async t=>{
 let resolve;const pending=new Promise(done=>{resolve=done;});
 const {nodes,calls,suggestion}=await page(t,{reply:request=>request.type==='gmail:search'?pending:undefined});
 nodes['gmail-query'].value='fixture';await nodes['search-form'].fire('submit');
 assert.ok(suggestion('Unread'),'Unread suggestion should exist');
 await suggestion('Unread').fire('click');
 resolve({ok:true,session:'old',items:[{id:'old-id',subject:'Stale',from:'fixture',date:''}],nextPageToken:'old-next'});
 await new Promise(done=>setImmediate(done));
 assert.equal(nodes.results.children.length,0);
 assert.equal(nodes.next.hidden,true);
 assert.equal(nodes.search.disabled,false);
 assert.equal(calls.at(-1).type,'gmail:cancel');
});

test('scope edit clears results and hides pagination while retaining the literal query',async t=>{
 const {nodes}=await page(t,{reply:request=>request.type==='gmail:search'?{ok:true,session:'old',items:[{id:'id',subject:'Fixture',from:'fixture',date:''}],nextPageToken:'page-2'}:undefined});
 nodes['gmail-query'].value='fixture';await nodes['search-form'].fire('submit');
 assert.equal(nodes.results.children.length,1);assert.equal(nodes.next.hidden,false);
 nodes.scope.value='Label_14';await nodes.scope.fire('change');
 assert.equal(nodes.results.children.length,0);assert.equal(nodes.next.hidden,true);
 assert.equal(nodes['gmail-query'].value,'fixture');
});

test('suggestions respect composition and become available after composition ends',async t=>{
 const {nodes,suggestion}=await page(t);
 assert.ok(suggestion('Attachments'),'Attachments suggestion should exist');
 await nodes['gmail-query'].fire('compositionstart');
 assert.equal(suggestion('Attachments').disabled,true);
 await suggestion('Attachments').fire('click');assert.equal(nodes['gmail-query'].value,'');
 await nodes['gmail-query'].fire('compositionend');
 assert.equal(suggestion('Attachments').disabled,false);
 await suggestion('Attachments').fire('click');assert.equal(nodes['gmail-query'].value,'has:attachment');
});

test('suggestions refuse over-limit queries without losing text or cancelling results',async t=>{
 const {nodes,calls,suggestion}=await page(t);
 nodes['gmail-query'].value='x'.repeat(4090);
 assert.ok(suggestion('Attachments'),'Attachments suggestion should exist');
 await suggestion('Attachments').fire('click');
 assert.equal(nodes['gmail-query'].value,'x'.repeat(4090));
 assert.equal(calls.filter(call=>call.type==='gmail:cancel').length,0);
 assert.match(nodes.status.textContent,/4096/);
});

test('disconnected page disables suggestions and date controls',async t=>{
 const {nodes,suggestion}=await page(t,{connected:false});
 assert.ok(suggestion('Attachments'),'Attachments suggestion should exist');
 assert.equal(suggestion('Attachments').disabled,true);
 assert.equal(nodes['search-date'].disabled,true);
 assert.equal(nodes['after-date'].disabled,true);
 assert.equal(nodes['preview-account'].textContent,'Not connected');
});
