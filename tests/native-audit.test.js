// Regressions for defects reproduced natively on Thunderbird 157.0.1 (macOS 27.0.1) during the 2026-10-03 audit.
import {test} from 'node:test';import assert from 'node:assert/strict';
import {mailFixture} from './mail-fixture.js';import {memoryStorage} from './helpers.js';
import {captureSelection,validateSelection} from '../extension/selection.js';
import {executeTriage} from '../extension/triage.js';
import {listTags} from '../extension/mail-adapter.js';
import {detectCapabilities} from '../extension/capabilities.js';
import {createSendAndArchive} from '../extension/send-and-archive.js';
import {sendResultText} from '../extension/send-results.js';
import {codeText} from '../extension/outcomes.js';

function messageTab(f,displayed=[1]){
 let shown=[...displayed];
 f.api.mailTabs.getSelectedMessages=async()=>{throw Error('Tab 9 is not a mail tab');};
 f.api.messageDisplay={getDisplayedMessages:async()=>shown.map(id=>({id}))};
 return {show:v=>{shown=v;}};
}
test('archive from a standalone message tab uses the displayed message (was no-selection natively)',async()=>{
 const f=mailFixture();messageTab(f);
 const snapshot=await captureSelection(f.api,9);
 assert.deepEqual(snapshot,{tabId:9,source:'messageDisplay',messageIds:[1]});
 const r=await executeTriage(f.api,'archive',snapshot);
 assert.equal(r.ok,true);assert.deepEqual(f.calls,[['archive',[1]]]);
});
test('message tab that navigated to another message aborts instead of acting on it',async()=>{
 const f=mailFixture();const tab=messageTab(f);
 const snapshot=await captureSelection(f.api,9);tab.show([2]);
 const r=await executeTriage(f.api,'archive',snapshot);
 assert.equal(r.code,'selection-changed');assert.deepEqual(f.calls,[]);
});
test('mail tab selection never silently falls back to displayed messages during validation',async()=>{
 const f=mailFixture([1]);const snapshot=await captureSelection(f.api,7);assert.equal(snapshot.source,'mailTab');
 f.api.messageDisplay={getDisplayedMessages:async()=>[{id:1}]};
 f.api.mailTabs.getSelectedMessages=async()=>{throw Error('tab closed');};
 await assert.rejects(validateSelection(f.api,snapshot));
});
test('message-display MessageList pages are followed (MV3 shape)',async()=>{
 const f=mailFixture();f.api.mailTabs.getSelectedMessages=async()=>{throw Error('not mail');};
 f.api.messageDisplay={getDisplayedMessages:async()=>({id:'p1',messages:[{id:1}]})};
 f.api.messages.continueList=async()=>({id:null,messages:[{id:2}]});
 assert.deepEqual((await captureSelection(f.api,9)).messageIds,[1,2]);
});
test('tag list prefers messages.tags.list and avoids the deprecated listTags error',async()=>{
 let deprecatedCalls=0;
 const api={messages:{listTags:async()=>{deprecatedCalls++;return [];},tags:{list:async()=>[{key:'$label1',tag:'Important'}]},update:async()=>{}}};
 assert.deepEqual(await listTags(api),[{key:'$label1',tag:'Important'}]);assert.equal(deprecatedCalls,0);
 assert.equal((await detectCapabilities(api)).tags.available,true);
 delete api.messages.tags;assert.deepEqual(await listTags(api),[]);assert.equal(deprecatedCalls,1);
});
test('manifest requests read-only tag listing used by messages.tags.list',async()=>{
 const {readFile}=await import('node:fs/promises');
 const manifest=JSON.parse(await readFile(new URL('../extension/manifest.json',import.meta.url),'utf8'));
 assert.ok(manifest.permissions.includes('messagesTagsList'));assert.ok(!manifest.permissions.includes('messagesTags'));
});
test('a compose tab with an attempted send reports locked so the popup cannot invite a retry',async()=>{
 const api={compose:{getComposeDetails:async()=>({type:'reply',relatedMessageId:1}),sendMessage:async()=>{throw Error('550');}},messages:{get:async()=>({}),archive:async()=>{}}};
 const s=createSendAndArchive(api);
 assert.equal(s.isLocked(5),false);
 assert.equal((await s.run(5)).code,'send-failed');
 assert.equal(s.isLocked(5),true);
 assert.equal((await s.run(5)).code,'already-running');
 assert.notEqual(sendResultText({code:'already-running'}),'No result is available.');
 s.forget(5);assert.equal(s.isLocked(5),false);
});
test('SMTP rejection that resolves without a sent header never archives (observed natively on 157)',async()=>{
 const calls=[];
 const api={compose:{getComposeDetails:async()=>({type:'reply',relatedMessageId:1}),sendMessage:async()=>({mode:'sendNow',messages:[]})},messages:{get:async()=>({}),archive:async ids=>calls.push(ids)}};
 assert.equal((await createSendAndArchive(api).run(5)).code,'not-confirmed-sent');assert.deepEqual(calls,[]);
});
test('palette error codes are shown as sentences, not raw identifiers',()=>{
 for(const code of ['no-selection','already-in-trash','selection-changed','action-failed']){const text=codeText(code);assert.ok(!text.includes(code),text);assert.match(text,/[A-Z].*\./);}
 assert.match(codeText('something-new'),/something-new/);
});
test('compose init reports locked state from the background',async()=>{
 const f=mailFixture([1]);let listener;const storage=memoryStorage({settings:{sendArchiveEnabled:true}});
 const api={...f.api,runtime:{id:'thunderstream@local.invalid',getURL:p=>'moz-extension://test/'+p,getBrowserInfo:async()=>({version:'157.0.1'}),openOptionsPage:async()=>{},onMessage:{addListener:fn=>{listener=fn;}},onMessageExternal:{addListener(){}},onConnect:{addListener(){}}},storage:{local:storage},permissions:{contains:async()=>true},tabs:{query:async()=>[{id:7,windowId:1}],create:async()=>{},onRemoved:{addListener(){}}},accounts:{list:async()=>[]},compose:{getComposeDetails:async()=>({type:'reply',relatedMessageId:1}),sendMessage:async()=>{throw Error('550');}}};
 globalThis.messenger=api;await import('../extension/background.js?lock='+crypto.randomUUID());
 const request=msg=>listener(msg,{id:api.runtime.id,url:api.runtime.getURL('ui/compose.html')});
 const first=await request({type:'compose:init'});assert.equal(first.locked,false);assert.equal(first.available,true);
 await request({type:'compose:send-archive',token:first.token});
 const again=await request({type:'compose:init'});assert.equal(again.locked,true);assert.equal(again.available,false);
});
