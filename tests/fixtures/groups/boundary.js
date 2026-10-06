// Synthetic native API and profile storage; all product routing/storage logic is real.
const log=document.querySelector('#fixture-log'),record=request=>{log.textContent+=JSON.stringify(request)+'\n';};
const folders=[{id:'a/inbox',accountId:'a',name:'Inbox',path:'/Inbox',specialUse:['inbox']},{id:'b/inbox',accountId:'b',name:'Inbox',path:'/Inbox',specialUse:['inbox']},{id:'unified',isUnified:true,name:'Unified Inbox',specialUse:['inbox']}];
const accounts=[{id:'a',name:'Work <img src=x>',identities:[]},{id:'b',name:'Personal',identities:[]}];
const store={async get(key){return {[key]:JSON.parse(localStorage.getItem('groups-fixture:'+key)||'null')};},async set(values){for(const [key,value] of Object.entries(values))localStorage.setItem('groups-fixture:'+key,JSON.stringify(value));},async remove(key){localStorage.removeItem('groups-fixture:'+key);}};
if(location.search.includes('missing'))await store.set({accountGroups:[{id:'old',name:'Old account',accountIds:['gone']}],quickOpenGroupId:'old'});
let listener;
globalThis.messenger={
 runtime:{id:'thunderstream@local.invalid',getURL:path=>new URL('../'+path,location.href).href,getBrowserInfo:async()=>({version:'157.0.1'}),openOptionsPage:async()=>record({type:'fixture:settings'}),onMessage:{addListener:fn=>{listener=fn;}},onMessageExternal:{addListener(){}},onConnect:{addListener(){}},sendMessage:async request=>{record(request);return listener(request,{id:messenger.runtime.id,url:messenger.runtime.getURL('ui/palette.html')});}},
 storage:{local:store},permissions:{contains:async()=>false},
 tabs:{query:async()=>[{id:7,windowId:1,type:'mail'}],onRemoved:{addListener(){}},create:async request=>{record({type:'fixture:open-tab',...request});return {id:8};}},
 accounts:{list:async()=>{if(location.search.includes('offline'))throw Error('synthetic offline');return accounts;}},
 folders:{get:async id=>folders.find(f=>f.id===id),query:async q=>folders.filter(f=>(!q.accountId||f.accountId===q.accountId)&&(q.isUnified===undefined||!!f.isUnified===q.isUnified)&&(q.isTag===undefined||!!f.isTag===q.isTag)&&(!q.isFavorite||f.isFavorite)&&(!q.specialUse||q.specialUse.every(use=>f.specialUse.includes(use))))},
 mailTabs:{get:async()=>({displayedFolder:folders[0],folderModesEnabled:['unified','tags']}),getSelectedMessages:async()=>({messages:[{id:1}],id:null}),update:async(...args)=>record({type:'fixture:navigate',args}),setQuickFilter:async(...args)=>record({type:'fixture:filter',args})},
 messages:{get:async()=>({id:1,folder:folders[0],read:true,flagged:false,tags:[]}),archive:async()=>record({type:'fixture:archive'}),update:async()=>record({type:'fixture:update'}),move:async()=>record({type:'fixture:move'}),tags:{list:async()=>[{key:'important',tag:'Important'}]}},
 compose:{beginNew:async()=>record({type:'fixture:compose'}),beginReply:async()=>record({type:'fixture:reply'}),beginForward:async()=>record({type:'fixture:forward'})}
};
await import('../background.js');
