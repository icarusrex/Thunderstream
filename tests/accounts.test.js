import {test} from 'node:test';import assert from 'node:assert/strict';import {listDestinations,listTagDestinations,openDestination,mailTabInfo} from '../extension/navigation.js';import {captureSelection} from '../extension/selection.js';import {mailFixture} from './mail-fixture.js';
function nav(folders,{unified=false,modes=['all']}={}){
 const calls=[],queries=[];
 const smart={id:'smart/inbox',path:'/Inbox',name:'Inbox',isUnified:true,isVirtual:true};
 const tag={id:'tag/work',path:'/Work',name:'Work',isTag:true,isVirtual:true};
 return {calls,queries,api:{
  accounts:{list:async()=>[{id:'a',name:'OpenADR'},{id:'b',name:'Personal'}]},
  folders:{
   query:async q=>{
    queries.push(q);
    if(q.isUnified===true)return unified?[smart]:[];
    if(q.isTag===true)return [tag];
    return folders.filter(f=>(!q.accountId||f.accountId===q.accountId)
     &&(!q.specialUse||q.specialUse.every(use=>f.specialUse?.includes(use)))
     &&(q.isFavorite===undefined||!!f.isFavorite===q.isFavorite)
     &&(q.isRoot===undefined||!!f.isRoot===q.isRoot)
     &&(q.isTag===undefined||!!f.isTag===q.isTag)
     &&(q.isUnified===undefined||!!f.isUnified===q.isUnified));
   },
   get:async id=>{const f=[...folders,smart,tag].find(f=>f.id===id);if(!f)throw Error('gone');return f;}
  },
  mailTabs:{get:async id=>{if(id!==7)throw Error('not a mail tab');return {id:7,displayedFolder:{accountId:'b'},folderModesEnabled:modes};},
   update:async(...a)=>calls.push(['update',...a]),setQuickFilter:async(...a)=>calls.push(['filter',...a])}
 }};
}
const folders=[{id:'a/inbox',name:'Caixa de entrada',accountId:'a',specialUse:['inbox']},{id:'b/inbox',accountId:'b',specialUse:['inbox']},{id:'b/sent',accountId:'b',specialUse:['sent']}];
test('localizedInboxUsesFolderType',async()=>{const {api}=nav(folders);const d=await listDestinations(api);assert.deepEqual(d.filter(x=>x.rank===1).map(x=>[x.title,x.folderId]),[['Go to Inbox · OpenADR','a/inbox'],['Go to Inbox · Personal','b/inbox']]);});
test('unifiedSelectionUsesOriginalAccount',async()=>{const f=mailFixture();const s=await captureSelection(f.api,7);assert.deepEqual(s.messageIds,[1,2]);assert.equal((await f.api.messages.get(s.messageIds[1])).folder.accountId,'b');});
test('current account is marked and unified inbox comes first when Thunderbird shows unified folders',async()=>{const {api}=nav(folders,{unified:true,modes:['all','unified']});const d=await listDestinations(api,await mailTabInfo(api,7));assert.equal(d[0].title,'Go to Unified Inbox');assert.ok(d.some(x=>x.title==='Go to Inbox · Personal (current)'));assert.ok(d.some(x=>x.title==='Go to Sent · Personal (current)'));assert.ok(!d.some(x=>x.title.includes('OpenADR (current)')));});
test('no unified inbox command when Thunderbird has no unified folders',async()=>{const {api}=nav(folders);assert.ok(!(await listDestinations(api)).some(x=>x.id==='go:unified'));});
test('navigation only changes the displayed folder of a mail tab',async()=>{const {api,calls}=nav(folders);assert.equal((await openDestination(api,7,{folderId:'b/sent'})).ok,true);assert.deepEqual(calls,[['update',7,{displayedFolder:'b/sent'}]]);assert.equal((await openDestination(api,9,{folderId:'b/sent'})).code,'not-a-mail-tab');assert.equal(calls.length,1);});
test('tag navigation opens the virtual tag folder when the tags mode is on, else filters the current folder',async()=>{const {api,calls}=nav(folders,{modes:['all','tags']});const d=await listTagDestinations(api,[{key:'$label2',tag:'Work'},{key:'$label5',tag:'Later'}],await mailTabInfo(api,7));assert.equal(d[0].folderId,'tag/work');assert.equal(d[1].folderId,undefined);await openDestination(api,7,d[1]);assert.deepEqual(calls,[['filter',7,{show:true,tags:{mode:'all',tags:{$label5:true}}}]]);});

test('virtual folders are not offered as navigable when their folder-pane mode is off (native 157 failure)',async()=>{const {api,calls}=nav(folders,{unified:true});const tab=await mailTabInfo(api,7);const d=await listDestinations(api,tab);assert.equal(d[0].available,false);assert.match(d[0].title,/turn on Unified Folders/);const t=await listTagDestinations(api,[{key:'$label2',tag:'Work'}],tab);assert.equal(t[0].folderId,undefined);assert.equal(t[0].title,'Filter this folder by tag · Work');await openDestination(api,7,t[0]);assert.deepEqual(calls,[['filter',7,{show:true,tags:{mode:'all',tags:{$label2:true}}}]]);});
test('a tag folder that cannot be displayed falls back to filtering by tag',async()=>{const {api,calls}=nav(folders);api.mailTabs.update=async()=>{throw Error('cannot display');};const r=await openDestination(api,7,{folderId:'tag/work',tagKey:'$label2'});assert.equal(r.ok,true);assert.deepEqual(calls,[['filter',7,{show:true,tags:{mode:'all',tags:{$label2:true}}}]]);});
test('a non-tag folder that cannot be displayed reports failure without side effects',async()=>{const {api,calls}=nav(folders);api.mailTabs.update=async()=>{throw Error('cannot display');};assert.equal((await openDestination(api,7,{folderId:'smart/inbox'})).code,'folder-unavailable');assert.deepEqual(calls,[]);});


test('ordinary nested folders are discoverable with full path and account context',async()=>{
 const {api}=nav([...folders,
  {id:'a/projects/2026',name:'2026',path:'/Projects/2026',accountId:'a',specialUse:[]},
  {id:'b/projects/2026',name:'2026',path:'/Projects/2026',accountId:'b',specialUse:[]}]);
 const d=await listDestinations(api,await mailTabInfo(api,7));
 assert.deepEqual(d.filter(x=>x.folderId?.includes('projects')).map(x=>[x.title,x.folderId,x.accountId]),[
  ['Go to Projects / 2026 · OpenADR','a/projects/2026','a'],
  ['Go to Projects / 2026 · Personal (current)','b/projects/2026','b']]);
});
test('native Favorites are ranked once including favorite special-use folders',async()=>{
 const {api,queries}=nav([...folders.map(f=>({...f,isFavorite:f.id==='b/inbox'})),
  {id:'a/projects',name:'Projects',path:'/Projects',accountId:'a',specialUse:[],isFavorite:true}]);
 const d=await listDestinations(api,await mailTabInfo(api,7));
 assert.equal(d.filter(x=>x.folderId==='b/inbox').length,1);
 const favorites=d.filter(x=>x.keywords.includes('favorite'));
 assert.deepEqual(favorites.map(x=>x.folderId).sort(),['a/projects','b/inbox']);
 assert.ok(favorites.every(x=>x.rank<=1));
 assert.ok(queries.some(q=>q.isFavorite===true));
});
test('all-folder discovery excludes account roots and virtual tag/unified destinations',async()=>{
 const {api}=nav([...folders,
  {id:'a/root',name:'OpenADR',path:'/',accountId:'a',isRoot:true},
  {id:'a/work',name:'Work',path:'/Work',accountId:'a',isTag:true,isVirtual:true},
  {id:'a/unified',name:'Inbox',path:'/Inbox',accountId:'a',isUnified:true,isVirtual:true},
  {id:'a/custom',name:'Custom',path:'/Custom',accountId:'a',specialUse:[]}]);
 const d=await listDestinations(api,await mailTabInfo(api,7));
 assert.ok(d.some(x=>x.folderId==='a/custom'));
 assert.ok(!d.some(x=>['a/root','a/work','a/unified'].includes(x.folderId)));
});
test('an empty Favorite set retains every ordinary destination without duplicates',async()=>{
 const {api}=nav([...folders,{id:'b/references',name:'References',path:'/References',accountId:'b',specialUse:[]}]);
 const d=await listDestinations(api,await mailTabInfo(api,7));
 assert.ok(d.some(x=>x.folderId==='b/references'));
 assert.equal(new Set(d.map(x=>x.id)).size,d.length);
 assert.ok(!d.some(x=>x.keywords.includes('favorite')));
});
test('unavailable Favorite discovery does not hide ordinary folders',async()=>{
 const {api}=nav([...folders,{id:'a/project',name:'Project',path:'/Project',accountId:'a',specialUse:[]}]);
 const query=api.folders.query;api.folders.query=async q=>{if(q.isFavorite===true)throw Error('unavailable');return query(q);};
 assert.ok((await listDestinations(api)).some(x=>x.folderId==='a/project'));
});
test('unavailable broad discovery preserves existing special-use destinations',async()=>{
 const {api}=nav(folders);const query=api.folders.query;
 api.folders.query=async q=>{if(!q.specialUse&&!q.isFavorite)throw Error('unavailable');return query(q);};
 assert.deepEqual((await listDestinations(api)).map(x=>x.folderId),['a/inbox','b/inbox','b/sent']);
});
