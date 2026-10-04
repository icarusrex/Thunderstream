const MAX_MAIL=25*1024*1024;
export function createGmailSearch(client,api){
 const sessions=new Map();let revision=0,opening=false;
 const error=code=>({ok:false,code});
 const allowed=sender=>sender.id===api.runtime.id&&sender.url?.split('?')[0]===api.runtime.getURL('ui/gmail-search.html')&&Number.isInteger(sender.tab?.id);
 function invalidate(){revision++;sessions.clear();}
 async function page(session,pageToken){
  const result=await client.request('search',{query:session.query,labelId:session.labelId,email:session.email,...(session.includeSpamTrash?{includeSpamTrash:true}:{}),...(pageToken?{pageToken}:{})});
  if(sessions.get(session.tabId)!==session)return error('stale-search');
  if(result.email!==session.email)return error('account-changed');
  if(!Array.isArray(result.items)||result.items.some(m=>typeof m.id!=='string'))return error('invalid-response');
  session.next=result.nextPageToken||'';session.ids=new Set(result.items.map(m=>m.id));
  return {ok:true,session:session.id,items:result.items,nextPageToken:session.next,email:session.email};
 }
 return {forget(tabId){sessions.delete(tabId);},async handle(message,sender){
  if(!allowed(sender))return error('untrusted-sender');
  try{
   if(message.type==='gmail:status')return {ok:true,...await client.request('status')};
   if(message.type==='gmail:connect'||message.type==='gmail:disconnect'){
    invalidate();return {ok:true,...await client.request(message.type.slice(6))};
   }
   if(message.type==='gmail:cancel'){sessions.delete(sender.tab.id);return {ok:true};}
   if(message.type==='gmail:search'){
    if(typeof message.query!=='string'||!message.query.trim()||message.query.length>4096||typeof message.email!=='string'||!message.email)return error('invalid-query');
    const session={id:crypto.randomUUID(),tabId:sender.tab.id,query:message.query,labelId:message.labelId,email:message.email,includeSpamTrash:message.includeSpamTrash===true,ids:new Set(),next:''};
    sessions.set(sender.tab.id,session);return await page(session);
   }
   const session=sessions.get(sender.tab.id);
   if(!session||session.id!==message.session)return error('stale-search');
   if(message.type==='gmail:next'){
    if(!session.next)return error('no-next-page');
    const token=session.next;session.next='';return await page(session,token);
   }
   if(message.type==='gmail:open'){
    if(!session.ids.has(message.messageId))return error('unknown-result');
    if(opening)return error('already-opening');opening=true;
    const currentRevision=revision;
    try{
     const result=await client.request('read',{messageId:message.messageId,email:session.email});
     if(!Number.isInteger(result.size)||result.size<=0||result.size>MAX_MAIL||typeof result.handle!=='string')return error('message-too-large');
     const chunks=[];let size=0;
     while(size<result.size){
      if(sessions.get(session.tabId)!==session||revision!==currentRevision)return error('stale-search');
      const part=await client.request('chunk',{handle:result.handle,offset:size});
      if(typeof part.data!=='string'||part.data.length>350000)return error('invalid-response');
      const bytes=Uint8Array.from(atob(part.data),c=>c.charCodeAt(0));
      if(!bytes.length||size+bytes.length>result.size)return error('invalid-response');
      chunks.push(bytes);size+=bytes.length;
      if(part.done!==(size===result.size))return error('invalid-response');
     }
     if(sessions.get(session.tabId)!==session||revision!==currentRevision)return error('stale-search');
     const file=new File(chunks,'gmail-message.eml',{type:'message/rfc822'});
     await api.messageDisplay.open({file,location:'tab',active:true,windowId:sender.tab.windowId});
     return {ok:true,code:'opened-server-copy'};
    }finally{opening=false;}
   }
   return error('unsupported-request');
  }catch(cause){return error(cause?.code||'gmail-unavailable');}
 }};
}
