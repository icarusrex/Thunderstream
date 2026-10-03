import {test} from 'node:test';import assert from 'node:assert/strict';
import {conversationScope} from '../extension/conversation.js';
import {createSendAndArchive} from '../extension/send-and-archive.js';
// Thread in INBOX: t1 <- t2 <- t3 (reply target) <- t4 (newer, unseen). t1 also has a copy in ARCHIVE. "x" shares the subject only.
function thread(){
 const msgs=new Map([
  [1,{id:1,headerMessageId:'t1@x',subject:'Plan',folder:{id:'inbox'}}],
  [2,{id:2,headerMessageId:'t2@x',subject:'Re: Plan',folder:{id:'inbox'}}],
  [3,{id:3,headerMessageId:'t3@x',subject:'Re: Plan',folder:{id:'inbox'}}],
  [4,{id:4,headerMessageId:'t4@x',subject:'Re: Plan',folder:{id:'inbox'}}],
  [5,{id:5,headerMessageId:'t1@x',subject:'Plan',folder:{id:'archive'}}],
  [6,{id:6,headerMessageId:'other@x',subject:'Re: Plan',folder:{id:'inbox'}}],
 ]);
 const full={3:{headers:{references:['<t1@x> <t2@x>'],'in-reply-to':['<t2@x>']}},4:{headers:{references:['<t1@x> <t2@x> <t3@x>']}}};
 const calls=[];
 const api={messages:{
  get:async id=>{if(!msgs.has(id))throw Error('gone');return structuredClone(msgs.get(id));},
  getFull:async id=>full[id]||{headers:{}},
  query:async q=>({id:null,messages:[...msgs.values()].filter(m=>m.headerMessageId===q.headerMessageId&&(!q.folderId||m.folder.id===q.folderId))}),
  archive:async ids=>calls.push(['archive',ids]),
 },compose:{getComposeDetails:async()=>({type:'reply',relatedMessageId:3}),sendMessage:async()=>({mode:'sendNow',headerMessageId:'reply@x'})}};
 return {api,msgs,calls,full};
}
test('scope is the replied-to message plus referenced ancestors in the same folder',async()=>{
 const {api}=thread();assert.deepEqual(await conversationScope(api,3),{ids:[3,1,2],complete:true});
});
test('scope never includes newer replies, other folders, or subject-only matches',async()=>{
 const {api}=thread();const {ids}=await conversationScope(api,3);
 assert.ok(!ids.includes(4));assert.ok(!ids.includes(5));assert.ok(!ids.includes(6));
});
test('unreadable headers fall back to the replied-to message only and report incomplete',async()=>{
 const {api}=thread();api.messages.getFull=async()=>{throw Error('offline');};
 assert.deepEqual(await conversationScope(api,3),{ids:[3],complete:false});
});
test('Send & Archive archives the planned conversation once, after a confirmed send',async()=>{
 const {api,calls}=thread();const r=await createSendAndArchive(api).run(9);
 assert.deepEqual(r,{ok:true,code:'sent-and-archived',archived:3});assert.deepEqual(calls,[['archive',[3,1,2]]]);
});
test('messages that arrive or move during sending do not change the archive set',async()=>{
 const {api,msgs,calls,full}=thread();
 api.compose.sendMessage=async()=>{msgs.get(2).folder={id:'elsewhere'};full[3].headers.references.push('<t4@x>');return {mode:'sendNow',headerMessageId:'reply@x'};};
 await createSendAndArchive(api).run(9);assert.deepEqual(calls,[['archive',[3,1]]]);
});
test('unconfirmed send archives nothing from the conversation',async()=>{
 const {api,calls}=thread();api.compose.sendMessage=async()=>({mode:'sendNow',messages:[]});
 assert.equal((await createSendAndArchive(api).run(9)).code,'not-confirmed-sent');assert.deepEqual(calls,[]);
});
test('if the replied-to message moved during sending, nothing is archived and the user is told',async()=>{
 const {api,msgs,calls}=thread();api.compose.sendMessage=async()=>{msgs.get(3).folder={id:'elsewhere'};return {mode:'sendNow',headerMessageId:'reply@x'};};
 assert.equal((await createSendAndArchive(api).run(9)).code,'sent-archive-failed');assert.deepEqual(calls,[]);
});
