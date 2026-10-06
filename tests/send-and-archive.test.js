import {test} from 'node:test';import assert from 'node:assert/strict';import {createSendAndArchive} from '../extension/send-and-archive.js';
function fixture(){const calls=[];return {calls,api:{compose:{getComposeDetails:async()=>({type:'reply',identityId:'identity',relatedMessageId:42}),sendMessage:async(id,options)=>{calls.push(['send',id,options]);return {mode:'sendNow',headerMessageId:'sent-id',messages:[]};}},messages:{get:async()=>({id:42}),archive:async ids=>calls.push(['archive',ids])}}};}
test('successfulImmediateSendArchivesOriginal',async()=>{const f=fixture();const r=await createSendAndArchive(f.api).run(7);assert.equal(r.ok,true);assert.deepEqual(f.calls,[['send',7,{mode:'sendNow'}],['archive',[42]]]);});
test('failedSendDoesNotArchive',async()=>{const f=fixture();f.api.compose.sendMessage=async()=>{throw Error();};assert.equal((await createSendAndArchive(f.api).run(7)).ok,false);assert.deepEqual(f.calls,[]);});
test('queuedSendDoesNotArchive',async()=>{const f=fixture();f.api.compose.sendMessage=async()=>({mode:'sendLater'});assert.equal((await createSendAndArchive(f.api).run(7)).code,'not-confirmed-sent');assert.deepEqual(f.calls,[]);});
test('duplicateClickDoesNotSendTwice',async()=>{const f=fixture();let release;f.api.compose.sendMessage=async()=>{f.calls.push(['send']);return new Promise(r=>{release=r;});};const service=createSendAndArchive(f.api);const first=service.run(7);await new Promise(r=>setImmediate(r));assert.equal((await service.run(7)).code,'already-running');release({mode:'sendNow',headerMessageId:'x'});await first;assert.equal(f.calls.filter(c=>c[0]==='send').length,1);});
test('archiveFailureDoesNotResend',async()=>{const f=fixture();f.api.messages.archive=async()=>{throw Error();};const service=createSendAndArchive(f.api);assert.equal((await service.run(7)).code,'sent-archive-failed');assert.equal((await service.run(7)).code,'already-running');assert.equal(f.calls.length,1);});
test('missingRelatedMessageDisablesAction',async()=>{const f=fixture();f.api.compose.getComposeDetails=async()=>({type:'new'});assert.equal((await createSendAndArchive(f.api).run(7)).code,'not-a-reply');assert.deepEqual(f.calls,[]);});
test('closedComposeStillUsesCapturedOriginal',async()=>{const f=fixture();let reads=0;f.api.compose.getComposeDetails=async()=>{reads++;if(reads>1)throw Error('closed');return {type:'reply',relatedMessageId:42};};await createSendAndArchive(f.api).run(7);assert.equal(reads,1);assert.deepEqual(f.calls[1],['archive',[42]]);});
test('ambiguous success never archives',async()=>{const f=fixture();f.api.compose.sendMessage=async()=>({mode:'sendNow'});assert.equal((await createSendAndArchive(f.api).run(7)).code,'not-confirmed-sent');assert.deepEqual(f.calls,[]);});
test('send rejection remains locked until the compose tab closes',async()=>{const f=fixture();let sends=0;f.api.compose.sendMessage=async()=>{sends++;throw Error('server may have accepted');};const service=createSendAndArchive(f.api);await service.run(7);assert.equal((await service.run(7)).code,'already-running');assert.equal(sends,1);service.forget(7);await service.run(7);assert.equal(sends,2);});
test('ambiguous send cannot be retried automatically',async()=>{const f=fixture();f.api.compose.sendMessage=async()=>({mode:'sendNow'});const service=createSendAndArchive(f.api);await service.run(7);assert.equal((await service.run(7)).code,'already-running');});
test('offline action returns without attempting delivery or archiving',async()=>{const f=fixture();const service=createSendAndArchive(f.api,()=>false);assert.equal((await service.run(7)).code,'offline');assert.deepEqual(f.calls,[]);assert.equal(service.isLocked(7),false);});
test('going online permits an explicit retry of an unattempted offline action',async()=>{const f=fixture();let online=false;const service=createSendAndArchive(f.api,()=>online);await service.run(7);online=true;const result=await service.run(7);assert.equal(result.code,'sent-and-archived');assert.deepEqual(f.calls,[['send',7,{mode:'sendNow'}],['archive',[42]]]);});
test('going offline while preparing the archive plan prevents delivery',async()=>{const f=fixture();let online=true;f.api.messages.get=async()=>{online=false;return {id:42};};const service=createSendAndArchive(f.api,()=>online);assert.equal((await service.run(7)).code,'offline');assert.deepEqual(f.calls,[]);assert.equal(service.isLocked(7),false);});

// A removed compose tab cancels only before the native send boundary.
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function lifecycleFixture(){
 const f=fixture();let sends=0,archives=0;
 f.api.messages.get=async()=>({id:42,headerMessageId:'original@fixture.test',folder:{id:'a/inbox',accountId:'a'}});
 f.api.messages.getFull=async()=>({headers:{}});
 f.api.compose.sendMessage=async()=>{sends++;return {mode:'sendNow',headerMessageId:'sent@fixture.test',messages:[]};};
 f.api.messages.archive=async ids=>{archives++;f.calls.push(['archive',ids]);};
 return {...f,get sends(){return sends;},get archives(){return archives;},attempt(){sends++;}};
}
for(const stage of ['details','original','references'])test(`closing during ${stage} preparation never attempts send`,async()=>{
 const f=lifecycleFixture(),entered=deferred(),work=deferred();
 const pause=()=>{entered.resolve();return work.promise;};
 if(stage==='details')f.api.compose.getComposeDetails=pause;
 else if(stage==='original')f.api.messages.get=pause;
 else f.api.messages.getFull=pause;
 const service=createSendAndArchive(f.api),pending=service.run(7);await entered.promise;service.forget(7);
 work.resolve(stage==='details'?{type:'reply',relatedMessageId:42}:stage==='original'?{id:42,folder:{id:'a/inbox',accountId:'a'}}:{headers:{}});
 assert.equal((await pending).code,'compose-closed');assert.equal(f.sends,0);assert.equal(f.archives,0);assert.equal(service.isLocked(7),false);
});
test('removed compose with rejected preparation reports no send attempt',async()=>{
 const f=lifecycleFixture(),entered=deferred(),work=deferred();f.api.compose.getComposeDetails=()=>{entered.resolve();return work.promise;};
 const service=createSendAndArchive(f.api),pending=service.run(7);await entered.promise;service.forget(7);work.reject(Error('closed'));
 assert.equal((await pending).code,'compose-closed');assert.equal(f.sends,0);assert.equal(f.archives,0);assert.equal(service.isLocked(7),false);
});
test('removed compose stays locked until in-flight sending confirms then archives captured original',async()=>{
 const f=lifecycleFixture(),entered=deferred(),work=deferred();f.api.compose.sendMessage=()=>{f.attempt();entered.resolve();return work.promise;};
 const service=createSendAndArchive(f.api),pending=service.run(7);await entered.promise;service.forget(7);
 assert.equal(service.isLocked(7),true);assert.equal((await service.run(7)).code,'already-running');
 work.resolve({mode:'sendNow',headerMessageId:'sent@fixture.test',messages:[]});
 assert.equal((await pending).code,'sent-and-archived');assert.equal(f.sends,1);assert.deepEqual(f.calls,[['archive',[42]]]);assert.equal(service.isLocked(7),false);
});
test('removed compose with rejected in-flight send never archives or retries',async()=>{
 const f=lifecycleFixture(),entered=deferred(),work=deferred();f.api.compose.sendMessage=()=>{f.attempt();entered.resolve();return work.promise;};
 const service=createSendAndArchive(f.api),pending=service.run(7);await entered.promise;service.forget(7);work.reject(Error('Sent copy or transport failed'));
 assert.equal((await pending).code,'send-failed');assert.equal(f.sends,1);assert.equal(f.archives,0);assert.equal(service.isLocked(7),false);
});
test('removed compose with archive failure reports sent outcome without resending',async()=>{
 const f=lifecycleFixture(),entered=deferred(),work=deferred();f.api.compose.sendMessage=()=>{f.attempt();entered.resolve();return work.promise;};f.api.messages.archive=async()=>{throw Error('archive failed');};
 const service=createSendAndArchive(f.api),pending=service.run(7);await entered.promise;service.forget(7);work.resolve({mode:'sendNow',headerMessageId:'sent@fixture.test',messages:[]});
 assert.equal((await pending).code,'sent-archive-failed');assert.equal(f.sends,1);assert.equal(service.isLocked(7),false);
});
