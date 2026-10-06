import {test} from 'node:test';import assert from 'node:assert/strict';import {fixture} from './background-fixture.js';
test('background routes confirmed identity using original message',async()=>{const f=await fixture();const init=await f.request({type:'palette:init'});const choose=await f.request({type:'command:run',token:init.token,commandId:'reply'});assert.equal(choose.code,'show-identities');const ids=await f.request({type:'identities:init',token:init.token});assert.equal(ids.identities[0].email,'work@test.invalid');assert.equal(ids.identities[0].suggested,true);await f.request({type:'identities:open',token:init.token,identityId:'work'});assert.deepEqual(f.calls,[['reply',1,'replyToSender',{identityId:'work'}]]);});
test('background publishes archive failure outside compose popup',async()=>{const f=await fixture();f.api.messages.archive=async()=>{throw Error();};await f.storage.set({settings:{sendArchiveEnabled:true}});const init=await f.request({type:'compose:init'});await f.request({type:'compose:send-archive',token:init.token});assert.equal(f.storage.data.lastSendResult.code,'sent-archive-failed');assert.ok(f.calls.some(c=>c[0]==='tab'&&c[1].url.includes('send-result.html?id=')));});
test('settings reset does not depend on closed layout tab',async()=>{const f=await fixture();await f.storage.set({settings:{keyboardEnabled:true},layoutRestore:{global:{original:'standard',applied:'vertical'},tabs:{}}});f.api.mailTabs.query=async()=>[];await f.request({type:'settings:reset'});assert.equal(f.storage.data.settings,undefined);assert.ok(f.storage.data.layoutRestore);});
test('new persistent layout changes are gated until disable restoration is verified',async()=>{const f=await fixture();const r=await f.request({type:'layout:apply'});assert.equal(r.ok,false);assert.equal(r.code,'layout-unavailable');assert.equal(f.storage.data.layoutRestore,undefined);});
test('port requests reply on the port and tolerate a popup that already closed (N18)',async()=>{
 const f=await fixture();const sender={id:f.api.runtime.id,url:f.api.runtime.getURL('ui/compose.html')};
 const posted=[];let onMessage;f.connect({sender,onMessage:{addListener:fn=>{onMessage=fn;}},postMessage:m=>posted.push(m)});
 await onMessage({type:'settings:get'});assert.equal(posted[0].ok,true);
 let closed;f.connect({sender,onMessage:{addListener:fn=>{closed=fn;}},postMessage:()=>{throw Error('Attempt to postMessage on disconnected port');}});
 await assert.doesNotReject(closed({type:'settings:get'}));
 const untrusted=[];let bad;f.connect({sender:{id:'other',url:'moz-extension://x/ui/'},onMessage:{addListener:fn=>{bad=fn;}},postMessage:m=>untrusted.push(m)});
 await bad({type:'settings:get'});assert.equal(untrusted[0].code,'untrusted-sender');
});
