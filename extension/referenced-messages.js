import {validateSelection} from './selection.js';
const LIFETIME=300000,MAX_REFERENCES=50,MAX_PAGES=20;
const error=code=>({ok:false,code});
const fail=code=>{throw Object.assign(Error(code),{code});};
export function referenceViewAvailable(api){return ['get','getHeaders','query'].every(name=>typeof api.messages?.[name]==='function')&&typeof api.messageDisplay?.open==='function';}
function identity(header){
 if(!Number.isInteger(header?.id)||header.id<=0||!header.folder?.id||!header.folder.accountId||typeof header.headerMessageId!=='string'||!header.headerMessageId)return null;
 return {id:header.id,headerMessageId:header.headerMessageId,folderId:header.folder.id,accountId:header.folder.accountId};
}
const matches=(header,snapshot)=>header?.id===snapshot.id&&header.headerMessageId===snapshot.headerMessageId&&header.folder?.id===snapshot.folderId&&header.folder.accountId===snapshot.accountId;
function metadata(header,selected=false){
 const date=new Date(header.date);return {id:header.id,subject:String(header.subject||'(No subject)'),author:String(header.author||'Unknown sender'),date:Number.isFinite(date.getTime())?date.toISOString():'',selected};
}
function references(headers,anchor){
 const values=['references','in-reply-to'].flatMap(key=>Object.entries(headers||{}).filter(([name])=>name.toLowerCase()===key).flatMap(([,v])=>Array.isArray(v)?v:typeof v==='string'?[v]:[])).filter(v=>typeof v==='string').join(' ');
 const ids=[...new Set((values.match(/<[^<>\s]+>/g)||[]).map(value=>value.slice(1,-1)))].filter(id=>id!==anchor);
 return {ids:ids.slice(-MAX_REFERENCES),truncated:Math.max(0,ids.length-MAX_REFERENCES)};
}
export function createReferenceView(api,{now=Date.now}={}){
 const sessions=new Map();
 const live=session=>sessions.get(session.token)===session&&now()-session.created<=LIFETIME;
 const check=session=>{if(!live(session))fail('context-expired');};
 async function current(snapshot){let header;try{header=await api.messages.get(snapshot.id);}catch{fail('references-stale');}if(!matches(header,snapshot))fail('references-stale');return header;}
 async function abort(id){if(id&&typeof api.messages.abortList==='function'){try{await api.messages.abortList(id);}catch{}}}
 async function lookup(session,headerMessageId){
  let cursor=null;
  try{
   check(session);let page=await api.messages.query({folderId:session.anchor.folderId,headerMessageId});
   const found=new Map();
   for(let count=0;count<MAX_PAGES;count++){
    cursor=page?.id;check(session);if(!Array.isArray(page?.messages))return {state:'unavailable'};
    for(const header of page.messages){
     const snapshot=identity(header);
     if(snapshot&&snapshot.folderId===session.anchor.folderId&&snapshot.accountId===session.anchor.accountId&&snapshot.headerMessageId===headerMessageId)found.set(snapshot.id,header);
     if(found.size>1)return {state:'ambiguous'};
    }
    if(!cursor)return found.size?{state:'found',header:[...found.values()][0]}:{state:'missing'};
    if(count===MAX_PAGES-1)return {state:'unavailable'};
    page=await api.messages.continueList(cursor);
   }
  }catch(cause){if(cause.code==='context-expired')throw cause;return {state:'unavailable'};}
  finally{await abort(cursor);}
 }
 async function list(session){
  const original=await current(session.anchor);check(session);
  const issues={missing:0,ambiguous:0,unavailable:0,truncated:0,headersUnavailable:false};let refs={ids:[],truncated:0};
  try{refs=references(await api.messages.getHeaders(original.id,{decodeHeaders:false}),session.anchor.headerMessageId);}catch{issues.headersUnavailable=true;}
  check(session);issues.truncated=refs.truncated;
  const items=[metadata(original,true)],snapshots=new Map([[original.id,session.anchor]]);
  for(const id of refs.ids){
   const result=await lookup(session,id);check(session);
   if(result.state==='found'){items.push(metadata(result.header));snapshots.set(result.header.id,identity(result.header));}
   else issues[result.state]++;
  }
  await current(session.anchor);check(session);
  let accountName=session.anchor.accountId;
  try{accountName=(await api.accounts.list(false)).find(a=>a.id===session.anchor.accountId)?.name||accountName;}catch{}
  check(session);session.items=snapshots;
  return {ok:true,items,scope:{accountName:String(accountName),folderName:String(original.folder.name||session.anchor.folderId)},issues};
 }
 return {
  async open(context){
   if(!referenceViewAvailable(api))return error('references-unavailable');
   let token,ready;
   try{
    const ids=await validateSelection(api,context.selection);if(ids.length!==1)return error('select-one-message');
    const anchor=identity(await api.messages.get(ids[0]));if(!anchor||!Number.isInteger(context.windowId))return error('references-unavailable');
    for(const [key,value] of sessions)if(!live(value))sessions.delete(key);
    token=crypto.randomUUID();const settled=new Promise(resolve=>{ready=resolve;});const session={settled,token,anchor,windowId:context.windowId,created:now(),items:new Map(),busy:false};sessions.set(token,session);
    const tab=await api.tabs.create({url:api.runtime.getURL('ui/references.html')+'?token='+encodeURIComponent(token),windowId:context.windowId});
    if(!Number.isInteger(tab?.id)||tab.windowId!==context.windowId)fail('references-unavailable');session.ownerTabId=tab.id;
    ready();return {ok:true,code:'references-opened'};
   }catch(cause){if(token)sessions.delete(token);ready?.();return error(cause.code||(['selection-changed','no-selection'].includes(cause.message)?cause.message:'references-unavailable'));}
  },
  forget(tabId){for(const [key,value] of sessions)if(value.ownerTabId===tabId)sessions.delete(key);},
  async handle(message,sender){
   const session=sessions.get(message.token);
   if(session&&!session.ownerTabId)await session.settled;
   if(!session||!live(session)||sender.tab?.id!==session.ownerTabId||sender.tab?.windowId!==session.windowId||sender.url?.split(/[?#]/)[0]!==api.runtime.getURL('ui/references.html'))return error('context-expired');
   if(session.busy)return error('context-busy');session.busy=true;
   try{
    if(message.type==='references:init')return await list(session);
    if(message.type!=='references:open')return error('unsupported-request');
    if(!Number.isInteger(message.messageId)||!session.items.has(message.messageId))return error('unknown-reference');
    const snapshot=session.items.get(message.messageId);await current(session.anchor);check(session);
    await current(snapshot);check(session);
    if(snapshot.id!==session.anchor.id){const found=await lookup(session,snapshot.headerMessageId);check(session);if(found.state!=='found'||found.header.id!==snapshot.id)return error('references-stale');}
    await current(session.anchor);check(session);await current(snapshot);check(session);
    // Opening is explicit and delegated to Thunderbird; no bodies are rendered here.
    try{await api.messageDisplay.open({messageId:snapshot.id,location:'tab',active:true,windowId:session.windowId});}catch{return error('message-open-failed');}
    check(session);return {ok:true,code:'opened'};
   }catch(cause){return error(cause.code||'references-unavailable');}
   finally{session.busy=false;}
  }
 };
}
