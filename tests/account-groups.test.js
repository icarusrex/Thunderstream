import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './background-fixture.js';

async function grouped(){
 const f=await fixture();
 f.api.accounts.list=async()=>[{id:'a',name:'Work',identities:[]},{id:'b',name:'Personal',identities:[]}];
 const folders=[{id:'native-a',accountId:'a',name:'Inbox',path:'/Inbox',specialUse:['inbox']},{id:'native-b',accountId:'b',name:'Inbox',path:'/Inbox',specialUse:['inbox']},{id:'native-u',isUnified:true,name:'Unified Inbox',specialUse:['inbox']}];
 f.api.mailTabs.get=async()=>({displayedFolder:folders[0],folderModesEnabled:['unified','tags']});
 f.api.mailTabs.update=async(...args)=>f.calls.push(['navigate',...args]);
 f.api.mailTabs.setQuickFilter=async(...args)=>f.calls.push(['filter',...args]);
 f.api.folders.get=async id=>folders.find(folder=>folder.id===id);
 f.api.folders.query=async query=>folders.filter(folder=>
  (!query.accountId||folder.accountId===query.accountId)&&
  (query.isUnified===undefined||!!folder.isUnified===query.isUnified)&&
  (query.isTag===undefined||!!folder.isTag===query.isTag)&&
  (!query.isFavorite||folder.isFavorite)&&
  (!query.specialUse||query.specialUse.every(use=>folder.specialUse.includes(use))));
 await f.storage.set({accountGroups:[{id:'work',name:'Work focus',accountIds:['a']}],quickOpenGroupId:''});
 return f;
}
const folderIds=data=>data.commands.filter(command=>command.id.startsWith('go:')&&command.id!=='go:starred').map(command=>command.id);

test('All accounts is the initial scope and retains native unified navigation',async()=>{
 const f=await grouped();const data=await f.request({type:'palette:init'});
 assert.equal(data.group?.id,'');assert.equal(data.group?.name,'All accounts');
 assert.deepEqual(folderIds(data),['go:unified','go:native-a','go:native-b']);
 assert.equal(data.groups?.[0].id,'work');
});
test('selecting a group filters folder destinations and revokes the earlier token',async()=>{
 const f=await grouped();const initial=await f.request({type:'palette:init'});
 const chosen=await f.request({type:'palette:group',token:initial.token,groupId:'work'});
 assert.equal(chosen.ok,true);assert.equal(chosen.group.id,'work');
 assert.deepEqual(folderIds(chosen),['go:native-a']);assert.notEqual(chosen.token,initial.token);
 assert.equal(f.storage.data.quickOpenGroupId,'work');
 assert.equal((await f.request({type:'command:run',token:initial.token,commandId:'go:native-a'})).code,'context-expired');
 assert.equal((await f.request({type:'command:run',token:chosen.token,commandId:'go:native-b'})).ok,false);
 assert.deepEqual(f.calls,[]);
});
test('saved group is restored on next palette and All accounts can be restored explicitly',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});
 const data=await f.request({type:'palette:init'});assert.equal(data.group?.id,'work');
 const all=await f.request({type:'palette:group',token:data.token,groupId:''});
 assert.equal(all.ok,true);assert.deepEqual(folderIds(all),['go:unified','go:native-a','go:native-b']);
 assert.equal(f.storage.data.quickOpenGroupId,'');
});
test('grouped navigation uses the original mail tab and exact returned folder ID',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});
 const data=await f.request({type:'palette:init'});
 const result=await f.request({type:'command:run',token:data.token,commandId:'go:native-a'});
 assert.equal(data.group?.id,'work');assert.equal(result.ok,true);
 assert.deepEqual(f.calls,[['navigate',7,{displayedFolder:'native-a'}]]);
});
test('group changes in another window do not retarget an already open All palette',async()=>{
 const f=await grouped();const original=await f.request({type:'palette:init'});const other=await f.request({type:'palette:init'});
 assert.equal((await f.request({type:'palette:group',token:other.token,groupId:'work'})).ok,true);
 assert.equal((await f.request({type:'command:run',token:original.token,commandId:'go:native-b'})).ok,true);
 assert.deepEqual(f.calls,[['navigate',7,{displayedFolder:'native-b'}]]);
});
test('deleted saved group warns and falls back to All accounts',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'gone'});
 const data=await f.request({type:'palette:init'});
 assert.equal(data.group?.id,'');assert.match(data.group?.warning||'',/unavailable/);
 assert.deepEqual(folderIds(data),['go:unified','go:native-a','go:native-b']);
});
test('group with no remaining accounts warns and falls back to All accounts',async()=>{
 const f=await grouped();await f.storage.set({accountGroups:[{id:'old',name:'Old',accountIds:['gone']}],quickOpenGroupId:'old'});
 const data=await f.request({type:'palette:init'});
 assert.equal(data.group?.id,'');assert.match(data.group?.warning||'',/unavailable/);
 assert.equal(data.groups?.[0].available,false);
});
test('partly removed group retains only live accounts and exposes its missing membership',async()=>{
 const f=await grouped();await f.storage.set({accountGroups:[{id:'work',name:'Work',accountIds:['a','gone']}],quickOpenGroupId:'work'});
 const data=await f.request({type:'palette:init'});
 assert.equal(data.group?.id,'work');assert.deepEqual(folderIds(data),['go:native-a']);
 assert.equal(data.groups?.[0].missingAccounts,1);assert.match(data.group?.warning||'',/unavailable/);
});
test('missing group request cannot change persisted preference or current palette token',async()=>{
 const f=await grouped();const data=await f.request({type:'palette:init'});
 assert.equal((await f.request({type:'palette:group',token:data.token,groupId:'missing'})).code,'group-unavailable');
 assert.equal(f.storage.data.quickOpenGroupId,'');
 assert.equal((await f.request({type:'command:run',token:data.token,commandId:'go:native-a'})).ok,true);
});
test('editing group membership invalidates a stale grouped navigation request',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});const data=await f.request({type:'palette:init'});
 assert.equal((await f.request({type:'groups:save',id:'work',name:'Work focus',accountIds:['b']})).ok,true);
 assert.equal((await f.request({type:'command:run',token:data.token,commandId:'go:native-a'})).code,'group-changed');
 assert.deepEqual(f.calls,[]);
});
test('group manager returns account names and strips extra stored fields',async()=>{
 const f=await grouped();await f.storage.set({accountGroups:[{id:'work',name:'Work',accountIds:['a','a'],password:'must-not-leave-storage'}]});
 const data=await f.request({type:'groups:list'});
 assert.equal(data.ok,true);assert.deepEqual(data.accounts,[{id:'a',name:'Work'},{id:'b',name:'Personal'}]);
 assert.deepEqual(data.groups[0].accountIds,['a']);assert.equal(data.groups[0].password,undefined);
});
test('saving a named group stores only validated membership without overwriting other settings',async()=>{
 const f=await grouped();await f.storage.set({settings:{sendArchiveEnabled:true,recentTagIds:['keep']}});
 const data=await f.request({type:'groups:save',name:'  Personal focus  ',accountIds:['b','b'],password:'discard'});
 assert.equal(data.ok,true);const group=data.groups.find(group=>group.name==='Personal focus');assert.ok(group);
 assert.deepEqual(group.accountIds,['b']);assert.equal(group.password,undefined);
 assert.deepEqual(f.storage.data.settings,{sendArchiveEnabled:true,recentTagIds:['keep']});
});
test('empty or unknown account membership is rejected without a saved group',async()=>{
 const f=await grouped();const before=structuredClone(f.storage.data.accountGroups);
 for(const accountIds of [[],['gone']])assert.equal((await f.request({type:'groups:save',name:'Bad',accountIds})).code,'invalid-group');
 assert.deepEqual(f.storage.data.accountGroups,before);
});
test('reserved duplicate and overlong group names are rejected',async()=>{
 const f=await grouped();
 for(const name of ['','All accounts','WORK FOCUS','x'.repeat(81)])assert.equal((await f.request({type:'groups:save',name,accountIds:['b']})).ok,false);
 assert.equal(f.storage.data.accountGroups.length,1);
});
test('concurrent creates retain both groups',async()=>{
 const f=await grouped();const result=await Promise.all([
  f.request({type:'groups:save',name:'One',accountIds:['a']}),f.request({type:'groups:save',name:'Two',accountIds:['b']})
 ]);assert.ok(result.every(item=>item.ok));assert.deepEqual(f.storage.data.accountGroups.map(group=>group.name),['Work focus','One','Two']);
});
test('deleting the selected group restores All and preserves other groups',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});
 assert.equal((await f.request({type:'groups:save',name:'Personal',accountIds:['b']})).ok,true);
 const result=await f.request({type:'groups:delete',id:'work'});
 assert.equal(result.ok,true);assert.equal(f.storage.data.quickOpenGroupId,'');assert.equal(result.groups.length,1);
 assert.equal(result.groups[0].name,'Personal');
});
test('settings reset clears groups and selection along with extension settings',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});await f.request({type:'settings:reset'});
 assert.equal(f.storage.data.accountGroups,undefined);assert.equal(f.storage.data.quickOpenGroupId,undefined);
});
test('account listing failure keeps ordinary palette actions usable with an explicit warning',async()=>{
 const f=await grouped();f.api.accounts.list=async()=>{throw Error('Account API unavailable');};
 const data=await f.request({type:'palette:init'});
 assert.equal(data.ok,true);assert.equal(data.group?.id,'');assert.match(data.group?.warning||'',/unavailable/);
 assert.ok(data.commands.some(command=>command.id==='archive'&&command.available));
});

test('accounts disappearing during a group switch preserve the old selection and token',async()=>{
 const f=await grouped();await f.storage.set({accountGroups:[{id:'both',name:'Both',accountIds:['a','b']}]});
 const data=await f.request({type:'palette:init'});let removed=false;
 f.api.accounts.list=async()=>[{id:'a',name:'Work'},...(!removed?[{id:'b',name:'Personal'}]:[])];
 const query=f.api.folders.query;f.api.folders.query=async request=>{removed=true;return query(request);};
 const result=await f.request({type:'palette:group',token:data.token,groupId:'both'});
 assert.equal(result.ok,false);assert.equal(result.code,'group-changed');assert.equal(f.storage.data.quickOpenGroupId,'');
 assert.equal((await f.request({type:'command:run',token:data.token,commandId:'archive'})).ok,true);
});
test('group switches and commands cannot overlap within one palette session',async()=>{
 const f=await grouped();const data=await f.request({type:'palette:init'});let resume,entered;
 const started=new Promise(resolve=>{entered=resolve;});const pending=new Promise(resolve=>{resume=resolve;});
 const query=f.api.folders.query;f.api.folders.query=async request=>{entered();await pending;return query(request);};
 const command=f.request({type:'command:run',token:data.token,commandId:'archive'});await started;
 const change=f.request({type:'palette:group',token:data.token,groupId:'work'});resume();
 assert.equal((await change).code,'context-busy');assert.equal((await command).ok,true);
});
test('grouped tag destinations use current-folder filters instead of cross-account virtual folders',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});
 f.api.messages.tags={list:async()=>[{key:'tag1',tag:'Important'}]};
 const query=f.api.folders.query;f.api.folders.query=async request=>request.isTag?[{id:'virtual',isTag:true,name:'Important'}]:query(request);
 const data=await f.request({type:'palette:init'}),tag=data.commands.find(c=>c.id==='tag:tag1');
 assert.ok(tag);assert.match(tag.title,/this folder/);
});

test('edited groups do not block original-selection mail actions',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});const data=await f.request({type:'palette:init'});
 await f.request({type:'groups:save',id:'work',name:'Work focus',accountIds:['b']});
 const result=await f.request({type:'command:run',token:data.token,commandId:'archive'});
 assert.equal(result.ok,true);assert.deepEqual(f.calls,[['archive',[1]]]);
});
test('account-list outage does not block captured mail actions in grouped palette',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});const data=await f.request({type:'palette:init'});
 f.api.accounts.list=async()=>{throw Error('offline');};
 assert.equal((await f.request({type:'command:run',token:data.token,commandId:'archive'})).ok,true);
 assert.deepEqual(f.calls,[['archive',[1]]]);
});

test('manager membership edits serialize behind an in-flight grouped native navigation',async()=>{
 const f=await grouped();await f.storage.set({quickOpenGroupId:'work'});const data=await f.request({type:'palette:init'});
 let resume,entered;const started=new Promise(resolve=>{entered=resolve;}),pending=new Promise(resolve=>{resume=resolve;});
 const get=f.api.folders.get;f.api.folders.get=async id=>{entered();await pending;return get(id);};
 const navigation=f.request({type:'command:run',token:data.token,commandId:'go:native-a'});await started;
 const saving=f.request({type:'groups:save',id:'work',name:'Work focus',accountIds:['b']}).then(result=>{f.calls.push(['saved']);return result;});
 await new Promise(resolve=>setImmediate(resolve));resume();
 assert.equal((await navigation).ok,true);assert.equal((await saving).ok,true);
 assert.deepEqual(f.calls,[['navigate',7,{displayedFolder:'native-a'}],['saved']]);
});
