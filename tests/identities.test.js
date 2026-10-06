import {test} from 'node:test';import assert from 'node:assert/strict';import {listSendingIdentities,beginWithIdentity} from '../extension/identities.js';import {mailFixture} from './mail-fixture.js';
function fixture(){const f=mailFixture([2]);f.api.accounts={list:async()=>[{id:'a',name:'Personal',identities:[{id:'personal',email:'me@personal.test'}]},{id:'b',name:'Work',identities:[{id:'work',email:'me@work.test'}]}]};f.api.messengerUtilities={parseMailboxString:async value=>{
 const mailboxes={'Team <alias@work.test>':[{name:'Team',email:'alias@work.test'}],'someone@else.test':[{email:'someone@else.test'}],'shared@x.test':[{email:'shared@x.test'}],'me@work.test':[{email:'me@work.test'}]};
 return mailboxes[value]||[];
}};f.api.compose={beginReply:async(...args)=>f.calls.push(['reply',...args]),beginForward:async(...args)=>f.calls.push(['forward',...args]),beginNew:async(...args)=>f.calls.push(['new',...args])};return f;}
const ctx={tabId:7,selection:{tabId:7,messageIds:[2]}};
test('confirmed identity passed to native reply',async()=>{const f=fixture();await beginWithIdentity(f.api,'reply',ctx,'work');assert.deepEqual(f.calls,[['reply',2,'replyToSender',{identityId:'work'}]]);});
test('stale identity does not open compose',async()=>{const f=fixture();assert.equal((await beginWithIdentity(f.api,'reply',ctx,'gone')).ok,false);assert.deepEqual(f.calls,[]);});
test('confirmed identity passed to native forward',async()=>{const f=fixture();await beginWithIdentity(f.api,'forward',ctx,'work');assert.deepEqual(f.calls,[['forward',2,undefined,{identityId:'work'}]]);});

test('reply suggestion is the identity the message was addressed to, even when it is not the account default (native 157 behaviour)',async()=>{const f=fixture();f.api.accounts.list=async()=>[{id:'b',name:'Work',identities:[{id:'work',email:'me@work.test'},{id:'alias',email:'Alias@Work.test'}]},{id:'a',name:'Personal',identities:[{id:'personal',email:'me@personal.test'}]}];f.messages.get(2).recipients=['Team <alias@work.test>'];const ids=await listSendingIdentities(f.api,{...ctx,composeAction:'reply'});assert.equal(ids[0].id,'alias');assert.equal(ids[0].suggested,true);assert.equal(ids[0].reason,'matches a recipient');assert.deepEqual(ids.slice(1).map(i=>i.id),['personal','work']);});
test('reply suggestion falls back to the message account default identity',async()=>{const f=fixture();f.messages.get(2).recipients=['someone@else.test'];const ids=await listSendingIdentities(f.api,{...ctx,composeAction:'reply'});assert.equal(ids[0].id,'work');assert.equal(ids[0].reason,'default for Work');});
test('recipient match in the message account wins over the same address elsewhere',async()=>{const f=fixture();f.api.accounts.list=async()=>[{id:'a',name:'Personal',identities:[{id:'dupe-a',email:'shared@x.test'}]},{id:'b',name:'Work',identities:[{id:'work',email:'me@work.test'},{id:'dupe-b',email:'shared@x.test'}]}];f.messages.get(2).ccList=['shared@x.test'];assert.equal((await listSendingIdentities(f.api,{...ctx,composeAction:'reply'}))[0].id,'dupe-b');});
test('suggested identity is always passed explicitly to compose',async()=>{const f=fixture();f.messages.get(2).recipients=['me@work.test'];await beginWithIdentity(f.api,'reply',ctx,'work');assert.deepEqual(f.calls,[['reply',2,'replyToSender',{identityId:'work'}]]);});
test('compose suggestion is the default identity of the displayed account',async()=>{const f=fixture();f.api.mailTabs.get=async()=>({displayedFolder:{accountId:'a'}});const ids=await listSendingIdentities(f.api,{tabId:7,composeAction:'compose'});assert.equal(ids[0].id,'personal');assert.equal(ids[0].suggested,true);});
test('no suggestion when the message cannot be read; list stays alphabetical',async()=>{const f=fixture();const ids=await listSendingIdentities(f.api,{tabId:7,selection:{tabId:7,messageIds:[99]},composeAction:'reply'});assert.ok(ids.every(i=>!i.suggested));assert.deepEqual(ids.map(i=>i.id),['personal','work']);});

function aliasFixture(){
 const f=fixture();
 f.api.accounts.list=async()=>[
  {id:'a',name:'Personal',identities:[{id:'personal',email:'me@personal.test'}]},
  {id:'b',name:'Work',identities:[{id:'work',email:'me@work.test'},{id:'alias',email:'Alias@Work.test'}]}
 ];
 return f;
}
test('quoted display name cannot impersonate another configured recipient address',async()=>{
 const f=aliasFixture();const header='"Ops <me@personal.test>" <Alias@Work.test>';
 f.messages.get(2).recipients=[header];
 f.api.messengerUtilities.parseMailboxString=async(value,preserveGroups)=>{
  assert.equal(value,header);assert.equal(preserveGroups,false);
  return [{name:'Ops <me@personal.test>',email:'Alias@Work.test'}];
 };
 const identities=await listSendingIdentities(f.api,{...ctx,composeAction:'reply'});
 assert.equal(identities[0].id,'alias');assert.equal(identities[0].reason,'matches a recipient');
});
test('flattened native group recipients preserve message-account identity priority',async()=>{
 const f=aliasFixture();const header='Team: "Ops <me@personal.test>" <Alias@Work.test>, me@personal.test;';
 f.messages.get(2).recipients=[header];
 f.api.messengerUtilities.parseMailboxString=async(value,preserveGroups)=>{
  assert.equal(value,header);assert.equal(preserveGroups,false);
  return [{name:'Ops <me@personal.test>',email:'Alias@Work.test'},{email:'me@personal.test'}];
 };
 assert.equal((await listSendingIdentities(f.api,{...ctx,composeAction:'reply'}))[0].id,'alias');
});
test('all To Cc and Bcc mailboxes are parsed before matching the message account',async()=>{
 const f=aliasFixture();
 f.messages.get(2).recipients=['me@personal.test'];f.messages.get(2).ccList=['other@else.test'];f.messages.get(2).bccList=['"Ops <decoy>" <Alias@Work.test>'];
 f.api.messengerUtilities.parseMailboxString=async(value,preserveGroups)=>{
  assert.equal(value,'me@personal.test, other@else.test, "Ops <decoy>" <Alias@Work.test>');assert.equal(preserveGroups,false);
  return [{email:'me@personal.test'},{email:'other@else.test'},{name:'Ops <decoy>',email:' Alias@Work.test '}];
 };
 assert.equal((await listSendingIdentities(f.api,{...ctx,composeAction:'reply-all'}))[0].id,'alias');
});
test('native parser failure uses account default instead of guessing a recipient',async()=>{
 const f=aliasFixture();f.messages.get(2).recipients=['me@personal.test'];
 f.api.messengerUtilities.parseMailboxString=async()=>{throw Error('Malformed mailbox');};
 const identities=await listSendingIdentities(f.api,{...ctx,composeAction:'reply'});
 assert.equal(identities[0].id,'work');assert.equal(identities[0].reason,'default for Work');
 assert.equal(identities.length,3);
});
test('unavailable mailbox parser keeps explicit choices and uses the account default',async()=>{
 const f=aliasFixture();f.messages.get(2).recipients=['me@personal.test'];delete f.api.messengerUtilities;
 const identities=await listSendingIdentities(f.api,{...ctx,composeAction:'reply'});
 assert.equal(identities[0].id,'work');assert.equal(identities[0].reason,'default for Work');
 await beginWithIdentity(f.api,'reply',ctx,'alias');
 assert.deepEqual(f.calls,[['reply',2,'replyToSender',{identityId:'alias'}]]);
});
test('missing parsed email never matches an empty configured identity',async()=>{
 const f=fixture();f.api.accounts.list=async()=>[{id:'b',name:'Work',identities:[{id:'work',email:'me@work.test'},{id:'empty',email:''}]}];
 f.messages.get(2).recipients=[''];f.api.messengerUtilities.parseMailboxString=async()=>[{name:'Undisclosed recipients'}];
 const identities=await listSendingIdentities(f.api,{...ctx,composeAction:'reply'});
 assert.equal(identities[0].id,'work');assert.equal(identities[0].reason,'default for Work');
});
