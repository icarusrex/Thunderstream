import test from 'node:test';
import assert from 'node:assert/strict';
import {createGmailSearch} from '../extension/gmail-search.js';
import {createNativeClient} from '../extension/gmail-native.js';

const sender={id:'thunderstream@local.invalid',url:'moz-extension://test/ui/gmail-search.html',tab:{id:5,windowId:2}};
function fixture(){
 const calls=[];let opened;
 const client={async request(op,args){calls.push({op,args});if(op==='status')return{connected:true,email:'owner@fixture.test',labels:[]};if(op==='search')return{email:'owner@fixture.test',items:[{id:'abc1',subject:'Synthetic'}],nextPageToken:args.pageToken?'':'page2'};if(op==='read')return{handle:'opaque',size:8};if(op==='chunk')return{data:'RXhhY3QgSUQ=',done:true};return{};}};
 const api={runtime:{id:sender.id,getURL:path=> 'moz-extension://test/'+path},messageDisplay:{async open(value){opened=value;return{id:10};}}};
 return{client,api,calls,get opened(){return opened;}};
}
test('pagination uses captured query and label, not fresh UI input',async()=>{
 const f=fixture(),service=createGmailSearch(f.client,f.api);
 const first=await service.handle({type:'gmail:search',query:'from:peer OR has:attachment',labelId:'Label_1',email:'owner@fixture.test'},sender);
 assert.equal(first.ok,true);
 const next=await service.handle({type:'gmail:next',session:first.session},sender);
 assert.equal(next.ok,true);assert.equal(next.items.length,1);
 assert.deepEqual(f.calls.filter(c=>c.op==='search').map(c=>c.args),[
  {query:'from:peer OR has:attachment',labelId:'Label_1',email:'owner@fixture.test'},
  {query:'from:peer OR has:attachment',labelId:'Label_1',email:'owner@fixture.test',pageToken:'page2'}]);
});
test('late old query cannot replace a new query session',async()=>{
 const f=fixture();let finish;
 const request=f.client.request.bind(f.client);
 f.client.request=(op,args)=>op==='search'&&args.query==='old'?new Promise(resolve=>finish=resolve):request(op,args);
 const s=createGmailSearch(f.client,f.api),old=s.handle({type:'gmail:search',query:'old',email:'owner@fixture.test'},sender);
 const fresh=await s.handle({type:'gmail:search',query:'new',email:'owner@fixture.test'},sender);
 finish({email:'owner@fixture.test',items:[{id:'abc2'}]});
 assert.equal((await old).code,'stale-search');
 assert.equal((await s.handle({type:'gmail:open',session:fresh.session,messageId:'abc2'},sender)).code,'unknown-result');
});
test('native viewer receives exact server bytes, no ambiguous header lookup',async()=>{
 const f=fixture(),s=createGmailSearch(f.client,f.api);
 const search=await s.handle({type:'gmail:search',query:'synthetic',email:'owner@fixture.test'},sender);
 assert.equal((await s.handle({type:'gmail:open',session:search.session,messageId:'abc1'},sender)).ok,true);
 assert.equal(await f.opened.file.text(),'Exact ID');assert.equal(f.opened.windowId,2);
 assert.equal(f.opened.messageId,undefined);assert.equal(f.opened.headerMessageId,undefined);
});
test('failed metadata, changed account and incomplete bytes never open or imply empty results',async()=>{
 const f=fixture(),s=createGmailSearch(f.client,f.api);
 f.client.request=async()=>{throw Object.assign(new Error(),{code:'rate-limited'});};
 assert.deepEqual(await s.handle({type:'gmail:search',query:'x',email:'owner@fixture.test'},sender),{ok:false,code:'rate-limited'});
 const g=fixture(),t=createGmailSearch(g.client,g.api);
 const search=await t.handle({type:'gmail:search',query:'x',email:'owner@fixture.test'},sender);
 const request=g.client.request.bind(g.client);
 g.client.request=(op,args)=>op==='chunk'?Promise.resolve({data:'QQ==',done:true}):request(op,args);
 assert.equal((await t.handle({type:'gmail:open',session:search.session,messageId:'abc1'},sender)).code,'invalid-response');assert.equal(g.opened,undefined);
});
test('untrusted sender and another tab cannot read a search session',async()=>{
 const f=fixture(),s=createGmailSearch(f.client,f.api);
 assert.equal((await s.handle({type:'gmail:status'},{...sender,url:'https://evil.test/'})).code,'untrusted-sender');
 const search=await s.handle({type:'gmail:search',query:'x',email:'owner@fixture.test'},sender);
 assert.equal((await s.handle({type:'gmail:open',session:search.session,messageId:'abc1'},{...sender,tab:{id:6}})).code,'stale-search');
});
test('disconnect invalidates previous read sessions',async()=>{
 const f=fixture(),s=createGmailSearch(f.client,f.api);
 const search=await s.handle({type:'gmail:search',query:'x',email:'owner@fixture.test'},sender);
 await s.handle({type:'gmail:disconnect'},sender);
 assert.equal((await s.handle({type:'gmail:open',session:search.session,messageId:'abc1'},sender)).code,'stale-search');
});
test('Spam and Trash inclusion stays bound to the paginated search',async()=>{
 const f=fixture(),s=createGmailSearch(f.client,f.api);
 const r=await s.handle({type:'gmail:search',query:'in:anywhere synthetic',email:'owner@fixture.test',includeSpamTrash:true},sender);
 await s.handle({type:'gmail:next',session:r.session},sender);
 assert.deepEqual(f.calls.filter(c=>c.op==='search').map(c=>c.args.includeSpamTrash),[true,true]);
});
test('native disconnection rejects pending requests and does not retry',async()=>{
 let listener,disconnect,posts=0;
 const port={onMessage:{addListener(fn){listener=fn;}},onDisconnect:{addListener(fn){disconnect=fn;}},postMessage(){posts++;},disconnect(){disconnect();}};
 const client=createNativeClient({runtime:{connectNative(){return port;}}});
 const pending=client.request('status');disconnect();
 await assert.rejects(pending,{code:'helper-unavailable'});assert.equal(posts,1);
});
test('a retired helper port cannot interrupt a replacement request',async()=>{
 const ports=[];
 const api={runtime:{connectNative(){
  const p={onMessage:{addListener(fn){p.reply=fn;}},onDisconnect:{addListener(fn){p.closed=fn;}},postMessage(m){p.id=m.id;if(ports.length===1)throw Error('old disconnected');},disconnect(){p.closed();}};
  ports.push(p);return p;
 }}};
 const client=createNativeClient(api);
 await assert.rejects(client.request('status'),{code:'helper-unavailable'});
 const replacement=client.request('status');ports[0].closed();ports[1].reply({id:ports[1].id,ok:true,connected:true});
 assert.equal((await replacement).connected,true);
});
