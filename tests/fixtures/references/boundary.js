import {createReferenceView} from '../referenced-messages.js';
const params=new URL(location.href).searchParams,mode=params.get('mode')||'';
const log=document.querySelector('#fixture-log'),record=value=>{log.textContent+=JSON.stringify(value)+'\n';};
const folder={id:'fixture-inbox',accountId:'fixture-work',name:'Inbox'};
const headers=new Map([
 [1,{id:1,headerMessageId:'selected@fixture.invalid',folder,subject:'Project plan <img src=x>',author:'Aron <fixture@example.invalid>',date:new Date('2026-10-06T10:00:00Z')}],
 [2,{id:2,headerMessageId:'parent@fixture.invalid',folder,subject:'Earlier plan and attachments',author:'Colleague <colleague@example.invalid>',date:new Date('2026-10-05T09:30:00Z')}],
 [3,{id:3,headerMessageId:'root@fixture.invalid',folder,subject:'A long synthetic subject to confirm wrapping on a narrow screen without altering the native reader or privacy controls',author:'A long synthetic sender name <layout-check@example.invalid>',date:new Date('2026-10-04T08:15:00Z')}]
]);
if(mode==='duplicates')headers.set(4,{...headers.get(2),id:4});
let captured,opens=0;
const api={runtime:{getURL:path=>new URL('../'+path,location.href).href},tabs:{create:async p=>{captured=p;record({type:'fixture:new-tab',windowId:p.windowId});return {id:8,windowId:3};}},accounts:{list:async()=>[{id:'fixture-work',name:'Work <img src=x>'}]},mailTabs:{getSelectedMessages:async()=>({messages:[{id:1}],id:null})},messages:{
 get:async id=>{if(!headers.has(id))throw Error('missing');return structuredClone(headers.get(id));},
 getHeaders:async()=>{if(mode==='offline')throw Error('synthetic offline');return mode==='empty'?{}:{references:['<root@fixture.invalid> <parent@fixture.invalid> <missing@fixture.invalid>'],'in-reply-to':['<parent@fixture.invalid>']};},
 query:async q=>({messages:[...headers.values()].filter(h=>h.folder.id===q.folderId&&h.headerMessageId===q.headerMessageId).map(h=>structuredClone(h)),id:null})
},messageDisplay:{open:async p=>{record({type:'fixture:native-open',...p});if(mode==='retry'&&!opens++)throw Error('synthetic opening failure');return {id:9,windowId:3};}}};
const view=createReferenceView(api);
const launched=await view.open({tabId:7,windowId:3,selection:{tabId:7,source:'mailTab',messageIds:[1]}});
if(!launched.ok)throw Error('Fixture setup failed');
const token=new URL(captured.url).searchParams.get('token');
// Fixture bootstrap supplies the same token the real palette passes in the created page URL.
const address=new URL(location.href);address.searchParams.set('token',token);history.replaceState(null,'',address);
globalThis.messenger={runtime:{sendMessage:async request=>{record(request);return view.handle(request,{tab:{id:8,windowId:3},url:api.runtime.getURL('ui/references.html')});}}};
